import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// Initialize when container is ready
const initStudio = () => {
    const container = document.querySelector('#scene-container');
    const viewportWrapper = document.querySelector('.scene-viewport-wrapper');
    if (!container) return;

    // --- Procedural Canvas Textures ---
    const createWoodTexture = (baseColorHex = '#c4a682', grainColorHex = '#9d7c58') => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = baseColorHex;
        ctx.fillRect(0, 0, 512, 512);

        // Plank lines
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 2;
        for (let y = 0; y < 512; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }

        // Wood grain noise
        for (let i = 0; i < 400; i++) {
            ctx.fillStyle = grainColorHex;
            ctx.globalAlpha = Math.random() * 0.12;
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const w = Math.random() * 80 + 20;
            const h = Math.random() * 2 + 1;
            ctx.fillRect(x, y, w, h);
        }
        ctx.globalAlpha = 1.0;

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    };

    const createArtTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 700;
        const ctx = canvas.getContext('2d');
        // Textured plaster base
        ctx.fillStyle = '#EBE7DF';
        ctx.fillRect(0, 0, 512, 700);

        // Abstract architectural shapes
        ctx.fillStyle = '#B85D3D'; // Terracotta
        ctx.beginPath();
        ctx.arc(256, 300, 160, 0.2 * Math.PI, 1.3 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#4E5B52'; // Sage
        ctx.beginPath();
        ctx.rect(140, 360, 220, 180);
        ctx.fill();

        ctx.fillStyle = '#C29F68'; // Brass gold
        ctx.beginPath();
        ctx.arc(320, 220, 60, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1C1C1A'; // Charcoal stroke
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(100, 600);
        ctx.bezierCurveTo(200, 480, 300, 550, 420, 440);
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    };

    const createRugTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ECE7DF';
        ctx.fillRect(0, 0, 256, 256);

        // Woven grid texture
        ctx.strokeStyle = 'rgba(160, 150, 138, 0.25)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 256; i += 8) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(256, i);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 256);
            ctx.stroke();
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(6, 5);
        return texture;
    };

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE4DFD5);
    scene.fog = new THREE.FogExp2(0xE4DFD5, 0.028);

    const camera = new THREE.PerspectiveCamera(36, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(6.8, 4.2, 8.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 5.5;
    controls.maxDistance = 14;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent camera under floor
    controls.target.set(0.2, 1.4, 0);

    // --- Lighting Architecture ---
    const hemiLight = new THREE.HemisphereLight(0xfffaed, 0x6e6e66, 1.8);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff1da, 3.8);
    sunLight.position.set(-6, 9, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 28;
    sunLight.shadow.camera.left = -7;
    sunLight.shadow.camera.right = 7;
    sunLight.shadow.camera.top = 7;
    sunLight.shadow.camera.bottom = -7;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Floor lamp localized warm point light
    const lampLight = new THREE.PointLight(0xffaa5e, 0, 8, 2);
    lampLight.position.set(-3.2, 2.8, -1.2);
    lampLight.castShadow = true;
    scene.add(lampLight);

    // Subtle gallery accent light for wall art
    const artSpot = new THREE.SpotLight(0xffeedd, 1.4, 12, Math.PI / 6, 0.4, 1);
    artSpot.position.set(2.4, 5.5, 2.5);
    artSpot.target.position.set(2.4, 3.4, -4.4);
    scene.add(artSpot);
    scene.add(artSpot.target);

    // --- Materials & Textures ---
    const woodFloorTexture = createWoodTexture();
    const floorMaterial = new THREE.MeshStandardMaterial({
        map: woodFloorTexture,
        roughness: 0.65,
        metalness: 0.05
    });

    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xDDD7CC,
        roughness: 0.9,
        metalness: 0.0
    });

    const flutedWallMaterial = new THREE.MeshStandardMaterial({
        color: 0x8A6D55,
        roughness: 0.7,
        metalness: 0.08
    });

    // Dynamic sofa fabric material
    const sofaMaterial = new THREE.MeshStandardMaterial({
        color: 0xE2DDD4,
        roughness: 0.9,
        metalness: 0.02
    });

    const travertineMaterial = new THREE.MeshStandardMaterial({
        color: 0xDCD5C8,
        roughness: 0.45,
        metalness: 0.05
    });

    const brassMaterial = new THREE.MeshStandardMaterial({
        color: 0xC6A473,
        roughness: 0.28,
        metalness: 0.85
    });

    const darkMetalMaterial = new THREE.MeshStandardMaterial({
        color: 0x222320,
        roughness: 0.5,
        metalness: 0.5
    });

    // --- Architectural Geometry Construction ---
    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(15, 0.2, 12), floorMaterial);
    floor.position.set(0, -0.1, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Back Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(15, 7.5, 0.3), wallMaterial);
    backWall.position.set(0, 3.65, -4.6);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left Wall with large architectural picture window cutout
    const leftWallUpper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 12), wallMaterial);
    leftWallUpper.position.set(-7.4, 6.3, 0);
    scene.add(leftWallUpper);

    const leftWallLower = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 12), wallMaterial);
    leftWallLower.position.set(-7.4, 0.6, 0);
    leftWallLower.receiveShadow = true;
    scene.add(leftWallLower);

    const leftWallBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.2, 3), wallMaterial);
    leftWallBack.position.set(-7.4, 3.3, -3.5);
    scene.add(leftWallBack);

    const leftWallFront = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.2, 3), wallMaterial);
    leftWallFront.position.set(-7.4, 3.3, 3.5);
    scene.add(leftWallFront);

    // Window Steel Frame & Glass
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x1A1B18, roughness: 0.4, metalness: 0.7 });
    const windowGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.85,
        opacity: 0.9,
        transparent: true,
        roughness: 0.05,
        ior: 1.5
    });

    const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(0.05, 4.1, 5.8), windowGlassMat);
    windowGlass.position.set(-7.38, 3.3, 0);
    scene.add(windowGlass);

    // Window Mullions (Grid Bars)
    const mullionH = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 5.8), windowFrameMat);
    mullionH.position.set(-7.36, 3.3, 0);
    scene.add(mullionH);

    const mullionV1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.1, 0.08), windowFrameMat);
    mullionV1.position.set(-7.36, 3.3, -1.45);
    scene.add(mullionV1);

    const mullionV2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.1, 0.08), windowFrameMat);
    mullionV2.position.set(-7.36, 3.3, 1.45);
    scene.add(mullionV2);

    // Baseboard Trim
    const baseboardBack = new THREE.Mesh(new THREE.BoxGeometry(15, 0.22, 0.06), windowFrameMat);
    baseboardBack.position.set(0, 0.11, -4.42);
    scene.add(baseboardBack);

    // Fluted Wood Feature Wall Panel (behind sofa)
    const flutedGroup = new THREE.Group();
    const fluteCount = 38;
    const fluteWidth = 0.06;
    for (let i = 0; i < fluteCount; i++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(fluteWidth * 0.7, 5.2, 0.05), flutedWallMaterial);
        slat.position.set(-5.6 + i * fluteWidth, 2.6, -4.42);
        slat.castShadow = true;
        flutedGroup.add(slat);
    }
    scene.add(flutedGroup);

    // Textured Area Rug
    const rug = new THREE.Mesh(
        new THREE.BoxGeometry(5.8, 0.04, 4.6),
        new THREE.MeshStandardMaterial({ map: createRugTexture(), roughness: 0.95 })
    );
    rug.position.set(0.6, 0.02, 0.5);
    rug.receiveShadow = true;
    scene.add(rug);

    // --- Bespoke Designer Sofa ---
    const sofaGroup = new THREE.Group();

    // Sofa Base Plinth
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.24, 1.8), darkMetalMaterial);
    sofaBase.position.set(1.1, 0.12, 0.9);
    sofaBase.castShadow = true;
    sofaBase.receiveShadow = true;
    sofaGroup.add(sofaBase);

    // Sofa Main Bench Cushions (3 sections)
    for (let i = 0; i < 3; i++) {
        const seatCushion = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.45, 1.7), sofaMaterial);
        seatCushion.position.set(-0.25 + i * 1.38, 0.44, 0.9);
        seatCushion.castShadow = true;
        seatCushion.receiveShadow = true;
        sofaGroup.add(seatCushion);
    }

    // Backrest Cushion (Long upholstered back)
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.75, 0.4), sofaMaterial);
    backrest.position.set(1.1, 0.95, 0.15);
    backrest.castShadow = true;
    backrest.receiveShadow = true;
    sofaGroup.add(backrest);

    // Left & Right Armrests
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.62, 1.7), sofaMaterial);
    leftArm.position.set(-1.08, 0.58, 0.88);
    leftArm.castShadow = true;
    sofaGroup.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.62, 1.7), sofaMaterial);
    rightArm.position.set(3.28, 0.58, 0.88);
    rightArm.castShadow = true;
    sofaGroup.add(rightArm);

    // Lumbar Accent Pillows
    const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.4, 0.18), new THREE.MeshStandardMaterial({ color: 0xB85D3D, roughness: 0.85 }));
    pillow1.position.set(-0.35, 0.72, 0.42);
    pillow1.rotation.y = 0.15;
    pillow1.castShadow = true;
    sofaGroup.add(pillow1);

    const pillow2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.75, 20), new THREE.MeshStandardMaterial({ color: 0x4E5B52, roughness: 0.8 }));
    pillow2.rotation.z = Math.PI / 2;
    pillow2.position.set(2.6, 0.62, 0.5);
    pillow2.castShadow = true;
    sofaGroup.add(pillow2);

    scene.add(sofaGroup);

    // --- Travertine Coffee Table ---
    const tableGroup = new THREE.Group();

    // Table Top (Rounded slab)
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 1.2), travertineMaterial);
    tableTop.position.set(0.8, 0.46, -1.1);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // Table Monolith Cylindrical Legs
    const tableLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.38, 32), travertineMaterial);
    tableLeg1.position.set(0.0, 0.2, -1.1);
    tableLeg1.castShadow = true;
    tableGroup.add(tableLeg1);

    const tableLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.38, 32), travertineMaterial);
    tableLeg2.position.set(1.6, 0.2, -1.1);
    tableLeg2.castShadow = true;
    tableGroup.add(tableLeg2);

    // Architectural Coffee Table Books
    const book1 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.05, 0.36), new THREE.MeshStandardMaterial({ color: 0x1C1C1A, roughness: 0.5 }));
    book1.position.set(0.4, 0.56, -1.05);
    book1.rotation.y = 0.2;
    book1.castShadow = true;
    tableGroup.add(book1);

    const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.32), new THREE.MeshStandardMaterial({ color: 0xDFDACF, roughness: 0.7 }));
    book2.position.set(0.42, 0.6, -1.03);
    book2.rotation.y = 0.08;
    book2.castShadow = true;
    tableGroup.add(book2);

    // Brass Sculptural Bowl
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.12, 0.1, 24), brassMaterial);
    bowl.position.set(1.4, 0.57, -1.08);
    bowl.castShadow = true;
    tableGroup.add(bowl);

    scene.add(tableGroup);

    // --- Mid-Century Modern Floor Lamp ---
    const lampGroup = new THREE.Group();

    // Heavy round stone base
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32), darkMetalMaterial);
    lampBase.position.set(-3.2, 0.04, -1.2);
    lampBase.castShadow = true;
    lampGroup.add(lampBase);

    // Slender vertical brass pole
    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 3.4, 16), brassMaterial);
    lampPole.position.set(-3.2, 1.7, -1.2);
    lampPole.castShadow = true;
    lampGroup.add(lampPole);

    // Conical Linen Shade
    const lampShade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.42, 0.52, 32, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xF2EDE4, roughness: 0.85, side: THREE.DoubleSide })
    );
    lampShade.position.set(-3.2, 3.2, -1.2);
    lampShade.castShadow = true;
    lampGroup.add(lampShade);

    scene.add(lampGroup);

    // --- Botanical Plant (Ficus / Olive Tree in Terracotta Planter) ---
    const plantGroup = new THREE.Group();

    // Ceramic Planter
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.9, 32), new THREE.MeshStandardMaterial({ color: 0xC87D5D, roughness: 0.8 }));
    pot.position.set(-4.8, 0.45, 1.8);
    pot.castShadow = true;
    pot.receiveShadow = true;
    plantGroup.add(pot);

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.4, 12), new THREE.MeshStandardMaterial({ color: 0x483C32, roughness: 0.9 }));
    trunk.position.set(-4.8, 1.6, 1.8);
    trunk.castShadow = true;
    plantGroup.add(trunk);

    // Lush Foliage Clusters
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x475647, roughness: 0.7 });
    for (let i = 0; i < 14; i++) {
        const leafSphere = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), leafMaterial);
        const angle = (i / 14) * Math.PI * 2;
        const radius = 0.35 + (i % 3) * 0.15;
        leafSphere.position.set(
            -4.8 + Math.cos(angle) * radius,
            2.2 + (i % 4) * 0.35,
            1.8 + Math.sin(angle) * radius
        );
        leafSphere.scale.set(1.2, 0.7, 1.1);
        leafSphere.castShadow = true;
        plantGroup.add(leafSphere);
    }
    scene.add(plantGroup);

    // --- Framed Minimalist Wall Art ---
    const artGroup = new THREE.Group();
    const artFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.08), windowFrameMat);
    artFrame.position.set(2.4, 3.5, -4.42);
    artFrame.castShadow = true;
    artGroup.add(artFrame);

    const artCanvas = new THREE.Mesh(
        new THREE.BoxGeometry(2.26, 3.06, 0.02),
        new THREE.MeshStandardMaterial({ map: createArtTexture(), roughness: 0.6 })
    );
    artCanvas.position.set(2.4, 3.5, -4.36);
    artGroup.add(artCanvas);
    scene.add(artGroup);

    // --- 3D Interactive Hotspot Pins ---
    const hotspots = [
        {
            name: 'Modular Lounge',
            spec: 'Belgian Bouclé & Oiled Walnut Plinth',
            position: new THREE.Vector3(1.1, 1.5, 0.9),
            targetId: 'hotspot-sofa'
        },
        {
            name: 'Travertine Monolith',
            spec: 'Honed Roman Travertine Stone Slab',
            position: new THREE.Vector3(0.8, 0.9, -1.1),
            targetId: 'hotspot-table'
        },
        {
            name: 'Morrow 02 Floor Lamp',
            spec: 'Brushed Brass & Natural Linen Shade',
            position: new THREE.Vector3(-3.2, 3.6, -1.2),
            targetId: 'hotspot-lamp'
        }
    ];

    const hotspotMeshes = [];
    const pinGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const pinMaterial = new THREE.MeshBasicMaterial({ color: 0xB85D3D });

    hotspots.forEach((hs) => {
        const pin = new THREE.Mesh(pinGeometry, pinMaterial);
        pin.position.copy(hs.position);
        pin.userData = hs;
        scene.add(pin);
        hotspotMeshes.push(pin);
    });

    // Tooltip Element
    const tooltipEl = document.querySelector('#scene-tooltip');

    // Raycasting for Hotspots
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hotspotMeshes);

        if (intersects.length > 0 && tooltipEl) {
            const hit = intersects[0].object.userData;
            tooltipEl.querySelector('.tooltip-title').textContent = hit.name;
            tooltipEl.querySelector('.tooltip-spec').textContent = hit.spec;
            tooltipEl.style.left = `${e.clientX - rect.left}px`;
            tooltipEl.style.top = `${e.clientY - rect.top}px`;
            tooltipEl.classList.add('visible');
            container.style.cursor = 'pointer';
        } else if (tooltipEl) {
            tooltipEl.classList.remove('visible');
            container.style.cursor = '';
        }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);

    // --- Atmosphere Modes Engine ---
    const atmospheres = {
        day: {
            bg: 0xE4DFD5,
            fog: 0xE4DFD5,
            sunColor: 0xfff1da,
            sunIntensity: 3.8,
            hemiColor: 0xfffaed,
            hemiGround: 0x6e6e66,
            hemiIntensity: 1.8,
            lampIntensity: 0,
            artSpotIntensity: 1.4,
            exposure: 1.05
        },
        dusk: {
            bg: 0x6E5860,
            fog: 0x6E5860,
            sunColor: 0xff9045,
            sunIntensity: 2.9,
            hemiColor: 0x7a6270,
            hemiGround: 0x4a3a30,
            hemiIntensity: 1.3,
            lampIntensity: 1.8,
            artSpotIntensity: 2.2,
            exposure: 0.98
        },
        night: {
            bg: 0x14151C,
            fog: 0x14151C,
            sunColor: 0x3d4a66,
            sunIntensity: 0.35,
            hemiColor: 0x1d212e,
            hemiGround: 0x12131a,
            hemiIntensity: 0.55,
            lampIntensity: 4.8,
            artSpotIntensity: 3.2,
            exposure: 1.15
        }
    };

    document.querySelectorAll('[data-scene]').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-scene]').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = atmospheres[btn.dataset.scene];
            if (!mode) return;

            scene.background.set(mode.bg);
            scene.fog.color.set(mode.fog);
            sunLight.color.set(mode.sunColor);
            sunLight.intensity = mode.sunIntensity;
            hemiLight.color.set(mode.hemiColor);
            hemiLight.groundColor.set(mode.hemiGround);
            hemiLight.intensity = mode.hemiIntensity;
            lampLight.intensity = mode.lampIntensity;
            artSpot.intensity = mode.artSpotIntensity;
            renderer.toneMappingExposure = mode.exposure;
        });
    });

    // --- Material Customizer (Upholstery & Floor) ---
    const upholsteryPalette = {
        boucle: { color: 0xE2DDD4, roughness: 0.9 },
        sage: { color: 0x58695C, roughness: 0.85 },
        cognac: { color: 0x8C492B, roughness: 0.4 },
        charcoal: { color: 0x2A2B27, roughness: 0.75 }
    };

    document.querySelectorAll('[data-material]').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-material]').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const matConfig = upholsteryPalette[btn.dataset.material];
            if (matConfig) {
                sofaMaterial.color.set(matConfig.color);
                sofaMaterial.roughness = matConfig.roughness;
            }
        });
    });

    // --- Camera Presets with Smooth Interpolation ---
    const cameraPresets = {
        overview: { pos: new THREE.Vector3(6.8, 4.2, 8.4), target: new THREE.Vector3(0.2, 1.4, 0) },
        lounge: { pos: new THREE.Vector3(3.2, 2.2, 3.8), target: new THREE.Vector3(1.1, 0.9, 0.8) },
        architectural: { pos: new THREE.Vector3(0.2, 2.4, 8.6), target: new THREE.Vector3(0.2, 1.8, 0) },
        top: { pos: new THREE.Vector3(0.2, 9.2, 0.5), target: new THREE.Vector3(0.2, 0, 0) }
    };

    let targetCamPos = camera.position.clone();
    let targetControlsTarget = controls.target.clone();
    let isTransitioningCam = false;

    document.querySelectorAll('[data-cam]').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-cam]').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const preset = cameraPresets[btn.dataset.cam];
            if (!preset) return;

            targetCamPos.copy(preset.pos);
            targetControlsTarget.copy(preset.target);
            isTransitioningCam = true;
        });
    });

    // --- Fullscreen Viewport Toggle ---
    const fsBtn = document.querySelector('#toggle-scene-fs');
    if (fsBtn && viewportWrapper) {
        fsBtn.addEventListener('click', () => {
            viewportWrapper.classList.toggle('is-fullscreen');
            const isFs = viewportWrapper.classList.contains('is-fullscreen');
            fsBtn.textContent = isFs ? 'Close ✕' : 'Expand ⤢';
            onWindowResize();
        });
    }

    // --- Responsive Window Resize ---
    const onWindowResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };

    window.addEventListener('resize', onWindowResize);

    // --- Pendulum Light Physics & AR Controls ---
    let lightPhysicsActive = false;
    const physicsBtn = document.querySelector('#toggle-physics');
    if (physicsBtn) {
        physicsBtn.addEventListener('click', () => {
            lightPhysicsActive = !lightPhysicsActive;
            physicsBtn.classList.toggle('swinging', lightPhysicsActive);
            physicsBtn.querySelector('span').textContent = lightPhysicsActive 
                ? 'Lamp Physics Active (Swinging) ✦' 
                : 'Swing Brass Lamp (Physics) ✦';
            if (window.showToast) {
                window.showToast(lightPhysicsActive ? 'Brass pendulum light physics activated' : 'Light physics set to resting position');
            }
        });
    }

    // --- Camera AR Placement Mode ---
    const arBtn = document.querySelector('#toggle-ar-mode');
    const arContainer = document.querySelector('#ar-camera-container');
    const arVideo = document.querySelector('#ar-video-feed');
    let isArActive = false;
    let arStream = null;

    if (arBtn && arContainer) {
        arBtn.addEventListener('click', async () => {
            isArActive = !isArActive;
            if (isArActive) {
                arContainer.classList.add('active');
                renderer.setClearColor(0x000000, 0);
                scene.background = null;
                arBtn.classList.add('active');
                arBtn.querySelector('span').textContent = 'Exit AR Mode ✕';
                
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    try {
                        arStream = await navigator.mediaDevices.getUserMedia({
                            video: { facingMode: { ideal: 'environment' } }
                        });
                        if (arVideo) {
                            arVideo.srcObject = arStream;
                            arVideo.play();
                        }
                    } catch (err) {
                        console.log('AR camera access notice:', err);
                    }
                }
                if (window.showToast) {
                    window.showToast('AR Camera Mode Active: Point phone at floor surface');
                }
            } else {
                arContainer.classList.remove('active');
                renderer.setClearColor(0xE4DFD5, 1);
                scene.background = new THREE.Color(0xE4DFD5);
                arBtn.classList.remove('active');
                arBtn.querySelector('span').textContent = 'View in AR 📸';
                if (arStream) {
                    arStream.getTracks().forEach(track => track.stop());
                    arStream = null;
                }
                if (arVideo) arVideo.srcObject = null;
            }
        });
    }

    // --- Multi-Room 3D Switcher ---
    document.querySelectorAll('[data-3d-room]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-3d-room]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const room = btn.dataset['3dRoom'] || btn.getAttribute('data-3d-room');
            if (room === 'living') {
                targetCamPos.set(6.8, 4.2, 8.4);
                targetControlsTarget.set(0.2, 1.4, 0);
                isTransitioningCam = true;
                if (window.showToast) window.showToast('Switched to Living Room 3D Showcase');
            } else if (room === 'kitchen') {
                targetCamPos.set(0.2, 2.8, 5.5);
                targetControlsTarget.set(0, 1.2, -1.0);
                isTransitioningCam = true;
                if (window.showToast) window.showToast('Switched to Modular Kitchen 3D Showcase');
            } else if (room === 'bedroom') {
                targetCamPos.set(-3.5, 3.2, 4.5);
                targetControlsTarget.set(1.0, 1.0, 0);
                isTransitioningCam = true;
                if (window.showToast) window.showToast('Switched to Master Bedroom Suite 3D Showcase');
            }
        });
    });

    // --- Animation & Render Loop ---
    let clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Dynamic Light Physics (Pendulum swing)
        if (lightPhysicsActive) {
            const swing = Math.sin(elapsedTime * 2.2) * 0.12;
            lampGroup.rotation.z = THREE.MathUtils.lerp(lampGroup.rotation.z, swing, 0.1);
            lampLight.position.x = -3.2 + Math.sin(lampGroup.rotation.z) * 1.2;
        } else {
            lampGroup.rotation.z = THREE.MathUtils.lerp(lampGroup.rotation.z, 0, 0.08);
            lampLight.position.x = THREE.MathUtils.lerp(lampLight.position.x, -3.2, 0.08);
        }

        // Hotspots gentle bobbing animation
        hotspotMeshes.forEach((pin, idx) => {
            pin.position.y = hotspots[idx].position.y + Math.sin(elapsedTime * 2.5 + idx) * 0.05;
        });

        // Smooth camera lerping if preset selected
        if (isTransitioningCam) {
            camera.position.lerp(targetCamPos, 0.06);
            controls.target.lerp(targetControlsTarget, 0.06);

            if (camera.position.distanceTo(targetCamPos) < 0.05) {
                isTransitioningCam = false;
            }
        }

        controls.update();
        renderer.render(scene, camera);
    };

    animate();
};

// Auto start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudio);
} else {
    initStudio();
}

