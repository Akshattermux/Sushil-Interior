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

    // Fluted Wood Kitchen Backsplash Wall Panel
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

    // --- Materials for Kitchen Slabs, Stoves & Compartments ---
    const quartzSlabMaterial = new THREE.MeshStandardMaterial({
        color: 0xF4F0EA,
        roughness: 0.18,
        metalness: 0.12
    });

    const blackGlassMaterial = new THREE.MeshStandardMaterial({
        color: 0x141414,
        roughness: 0.08,
        metalness: 0.9
    });

    const teakCabinetMaterial = new THREE.MeshStandardMaterial({
        color: 0x4A2810,
        roughness: 0.45,
        metalness: 0.05
    });

    const stainlessSteelMaterial = new THREE.MeshStandardMaterial({
        color: 0xC8CBCF,
        roughness: 0.25,
        metalness: 0.88
    });

    const castIronMaterial = new THREE.MeshStandardMaterial({
        color: 0x1E1E1E,
        roughness: 0.6,
        metalness: 0.4
    });

    window.updateCabinetMaterial = (colorHex) => {
        teakCabinetMaterial.color.set(colorHex);
    };

    window.updateSlabMaterial = (slabType) => {
        if (slabType === 'quartz') {
            quartzSlabMaterial.color.set(0xF4F0EA);
            quartzSlabMaterial.roughness = 0.18;
            quartzSlabMaterial.metalness = 0.12;
        } else if (slabType === 'granite') {
            quartzSlabMaterial.color.set(0x1A1A1A);
            quartzSlabMaterial.roughness = 0.25;
            quartzSlabMaterial.metalness = 0.35;
        } else if (slabType === 'porcelain') {
            quartzSlabMaterial.color.set(0xEFE6D8);
            quartzSlabMaterial.roughness = 0.12;
            quartzSlabMaterial.metalness = 0.15;
        }
    };

    // --- Modular Kitchen Counter Base & Cabinet Body ---
    const kitchenIslandGroup = new THREE.Group();

    // Base Cabinet Plinth (Saharanpur Teak Cabinetry)
    const cabinetBody = new THREE.Mesh(new THREE.BoxGeometry(7.6, 2.3, 2.4), teakCabinetMaterial);
    cabinetBody.position.set(0, 1.15, -0.6);
    cabinetBody.castShadow = true;
    cabinetBody.receiveShadow = true;
    kitchenIslandGroup.add(cabinetBody);

    // --- Kitchen Countertop Slab (Slape) with Waterfall Edge ---
    // Top Slab (Polished Quartz Slape)
    const countertopSlab = new THREE.Mesh(new THREE.BoxGeometry(7.85, 0.18, 2.65), quartzSlabMaterial);
    countertopSlab.position.set(0, 2.39, -0.6);
    countertopSlab.castShadow = true;
    countertopSlab.receiveShadow = true;
    kitchenIslandGroup.add(countertopSlab);

    // Left Waterfall Slab Edge
    const leftWaterfall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.48, 2.65), quartzSlabMaterial);
    leftWaterfall.position.set(-3.925, 1.24, -0.6);
    leftWaterfall.castShadow = true;
    leftWaterfall.receiveShadow = true;
    kitchenIslandGroup.add(leftWaterfall);

    // Right Waterfall Slab Edge
    const rightWaterfall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.48, 2.65), quartzSlabMaterial);
    rightWaterfall.position.set(3.925, 1.24, -0.6);
    rightWaterfall.castShadow = true;
    rightWaterfall.receiveShadow = true;
    kitchenIslandGroup.add(rightWaterfall);

    // --- Built-in 4-Burner Toughened Glass Stove Hob ---
    const stoveGroup = new THREE.Group();

    // Glass Hob Bed
    const hobGlass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 1.6), blackGlassMaterial);
    hobGlass.position.set(-1.6, 2.5, -0.6);
    hobGlass.castShadow = true;
    stoveGroup.add(hobGlass);

    // Hob Stainless Bevel Trim
    const hobTrim = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.02, 1.64), stainlessSteelMaterial);
    hobTrim.position.set(-1.6, 2.48, -0.6);
    stoveGroup.add(hobTrim);

    // 4 Burners with Brass Core & Cast Iron Pan Support Grates
    const burnerOffsets = [
        { x: -2.1, z: -0.9, r: 0.18 },
        { x: -1.1, z: -0.9, r: 0.15 },
        { x: -2.1, z: -0.3, r: 0.15 },
        { x: -1.1, z: -0.3, r: 0.22 }
    ];

    burnerOffsets.forEach(b => {
        // Brass inner flame ring
        const brassCore = new THREE.Mesh(new THREE.CylinderGeometry(b.r * 0.7, b.r * 0.7, 0.04, 24), brassMaterial);
        brassCore.position.set(b.x, 2.54, b.z);
        brassCore.castShadow = true;
        stoveGroup.add(brassCore);

        // Cast iron burner cap
        const burnerCap = new THREE.Mesh(new THREE.CylinderGeometry(b.r, b.r * 1.05, 0.03, 24), castIronMaterial);
        burnerCap.position.set(b.x, 2.56, b.z);
        burnerCap.castShadow = true;
        stoveGroup.add(burnerCap);

        // Pan Support Cross Grate
        const grate1 = new THREE.Mesh(new THREE.BoxGeometry(b.r * 2.3, 0.04, 0.04), castIronMaterial);
        grate1.position.set(b.x, 2.58, b.z);
        grate1.castShadow = true;
        stoveGroup.add(grate1);

        const grate2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, b.r * 2.3), castIronMaterial);
        grate2.position.set(b.x, 2.58, b.z);
        grate2.castShadow = true;
        stoveGroup.add(grate2);
    });

    // 4 Rotary Stove Knobs on Front Slab Fascia
    for (let k = 0; k < 4; k++) {
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16), darkMetalMaterial);
        knob.rotation.x = Math.PI / 2;
        knob.position.set(-2.05 + k * 0.3, 2.3, 0.73);
        knob.castShadow = true;
        stoveGroup.add(knob);

        const knobPointer = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.04, 0.02), brassMaterial);
        knobPointer.position.set(-2.05 + k * 0.3, 2.32, 0.75);
        stoveGroup.add(knobPointer);
    }

    kitchenIslandGroup.add(stoveGroup);

    // --- Stainless Steel Undermount Kitchen Sink & Gooseneck Faucet ---
    const sinkGroup = new THREE.Group();

    // Sink Basin Trim
    const sinkRim = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.02, 1.5), stainlessSteelMaterial);
    sinkRim.position.set(1.6, 2.49, -0.6);
    sinkGroup.add(sinkRim);

    // Main Sink Basin
    const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.01, 1.25), darkMetalMaterial);
    sinkBasin.position.set(1.6, 2.47, -0.6);
    sinkGroup.add(sinkBasin);

    // Gooseneck Mixer Faucet (Vertical post + curved arched spout)
    const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.55, 16), stainlessSteelMaterial);
    faucetBase.position.set(1.6, 2.75, -1.25);
    faucetBase.castShadow = true;
    sinkGroup.add(faucetBase);

    const faucetArch = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 12, 24, Math.PI), stainlessSteelMaterial);
    faucetArch.rotation.z = Math.PI;
    faucetArch.rotation.y = Math.PI / 2;
    faucetArch.position.set(1.6, 3.02, -1.0);
    faucetArch.castShadow = true;
    sinkGroup.add(faucetArch);

    const faucetLever = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.06), brassMaterial);
    faucetLever.position.set(1.72, 2.78, -1.25);
    faucetLever.rotation.z = -0.3;
    sinkGroup.add(faucetLever);

    kitchenIslandGroup.add(sinkGroup);

    // --- Modular Drawer Compartments (Front Fascia) ---
    // Top, Middle, Bottom tiers of drawer compartments
    const drawerFaceMaterial = new THREE.MeshStandardMaterial({
        color: 0x3E220D,
        roughness: 0.5,
        metalness: 0.05
    });

    const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0xC6A473,
        roughness: 0.25,
        metalness: 0.85
    });

    const drawerCols = [-2.5, -1.0, 0.6, 2.2];
    const drawerRows = [1.85, 1.25, 0.6];
    const drawerHeights = [0.42, 0.42, 0.52];

    drawerCols.forEach(colX => {
        drawerRows.forEach((rowY, rIdx) => {
            const dFace = new THREE.Mesh(new THREE.BoxGeometry(1.36, drawerHeights[rIdx], 0.05), drawerFaceMaterial);
            dFace.position.set(colX, rowY, 0.62);
            dFace.castShadow = true;
            kitchenIslandGroup.add(dFace);

            // Sleek Horizontal Bar Handle
            const dHandle = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.025, 0.04), handleMaterial);
            dHandle.position.set(colX, rowY + 0.05, 0.66);
            dHandle.castShadow = true;
            kitchenIslandGroup.add(dHandle);
        });
    });

    scene.add(kitchenIslandGroup);

    // --- Overhead Stainless Steel Kitchen Chimney Hood ---
    const chimneyGroup = new THREE.Group();

    // Broad intake canopy directly over the stove
    const chimneyCanopy = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 1.8), stainlessSteelMaterial);
    chimneyCanopy.position.set(-1.6, 4.8, -0.6);
    chimneyCanopy.castShadow = true;
    chimneyGroup.add(chimneyCanopy);

    // Inset baffle grease filters
    const chimneyFilter = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.03, 1.5), darkMetalMaterial);
    chimneyFilter.position.set(-1.6, 4.7, -0.6);
    chimneyGroup.add(chimneyFilter);

    // Vertical Exhaust Flue Duct to Ceiling
    const chimneyFlue = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.6, 0.75), stainlessSteelMaterial);
    chimneyFlue.position.set(-1.6, 6.1, -0.6);
    chimneyFlue.castShadow = true;
    chimneyGroup.add(chimneyFlue);

    scene.add(chimneyGroup);

    // --- Brass Counter Pendant Light (with Physics Support) ---
    const lampGroup = new THREE.Group();

    // Suspension ceiling mount & thin cable
    const lampCord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.2, 8), darkMetalMaterial);
    lampCord.position.set(1.6, 5.8, -0.6);
    lampGroup.add(lampCord);

    // Spun Brass Counter Bell Shade directly illuminating the sink & slab
    const lampShade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.38, 0.35, 32, 1, false),
        brassMaterial
    );
    lampShade.position.set(1.6, 4.6, -0.6);
    lampShade.castShadow = true;
    lampGroup.add(lampShade);

    scene.add(lampGroup);

    // Reposition Lamp Spotlight directly onto the cooking slab
    lampLight.position.set(1.6, 4.4, -0.6);

    // --- 3D Interactive Hotspot Pins ---
    const hotspots = [
        {
            name: 'Quartz Kitchen Slab (Slape)',
            spec: '20mm Seamless Stain-Proof Nano-White Countertop with Waterfall Edge',
            position: new THREE.Vector3(0, 2.6, -0.6),
            targetId: 'hotspot-slab'
        },
        {
            name: 'Built-in 4-Burner Stove Hob',
            spec: 'Toughened Black Glass with Heavy-Duty Brass Burners & Auto-Ignition',
            position: new THREE.Vector3(-1.6, 2.7, -0.6),
            targetId: 'hotspot-stove'
        },
        {
            name: 'Tandem Drawer Compartments',
            spec: 'Blum Legrabox Soft-Close with Seasoned Teak Cutlery Organizers',
            position: new THREE.Vector3(0.6, 1.4, 0.65),
            targetId: 'hotspot-compartment'
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
            renderer.toneMappingExposure = mode.exposure;
        });
    });

    let targetCamPos = camera.position.clone();
    let targetControlsTarget = controls.target.clone();
    let isTransitioningCam = false;

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
            if (room === 'island') {
                targetCamPos.set(6.8, 4.2, 8.4);
                targetControlsTarget.set(0.2, 1.4, 0);
                isTransitioningCam = true;
                if (window.showToast) window.showToast('Switched to Island Kitchen 3D Showcase');
            } else if (room === 'lshape') {
                targetCamPos.set(0.2, 2.8, 5.5);
                targetControlsTarget.set(0, 1.2, -1.0);
                isTransitioningCam = true;
                if (window.showToast) window.showToast('Switched to L-Shape Corner 3D Showcase');
            } else if (room === 'parallel') {
                targetCamPos.set(-3.5, 3.2, 4.5);
                targetControlsTarget.set(1.0, 1.0, 0);
                isTransitioningCam = true;
                if (window.showToast) window.showToast('Switched to Parallel Galley 3D Showcase');
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
            lampLight.position.x = 1.6 + Math.sin(lampGroup.rotation.z) * 1.2;
        } else {
            lampGroup.rotation.z = THREE.MathUtils.lerp(lampGroup.rotation.z, 0, 0.08);
            lampLight.position.x = THREE.MathUtils.lerp(lampLight.position.x, 1.6, 0.08);
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

