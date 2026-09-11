/**
 * SUSHIL INTERIOR — MASTER CLIENT-SIDE ENGINE
 * Saharanpur & Dehradun
 * Specialization: Kitchen Appliances, Gas Hobs, Cutlery Organizers, Slabs (Slape)
 * Production-Grade: Fast, Accessible, No audio bloat, No intrusive timers
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. Dynamic Typed.js Text Rotator
    // ==========================================================================
    const initTyped = () => {
        const typedEl = document.querySelector('#typed-kitchen-text');
        if (typedEl && typeof Typed !== 'undefined') {
            new Typed('#typed-kitchen-text', {
                strings: [
                    'Built-in Brass Gas Stoves &amp; Hobs',
                    'Handcrafted CP Teak Cutlery Compartments',
                    'Motion-Sensor Baffle Chimneys',
                    'Calibrated Quartz &amp; Granite Slabs (Slape)',
                    'Smart Convection Built-in Ovens',
                    'Articulated Blind Corner LeMans Trays'
                ],
                typeSpeed: 45,
                backSpeed: 25,
                backDelay: 2000,
                loop: true,
                showCursor: true,
                cursorChar: '|'
            });
        }
    };
    initTyped();

    // ==========================================================================
    // 2. Header, Navigation & Mobile Menu
    // ==========================================================================
    const header = document.querySelector('#site-header');
    const menuToggle = document.querySelector('#mobile-menu-toggle');
    const mobileDrawer = document.querySelector('#mobile-drawer');
    const backToTopBtn = document.querySelector('#back-to-top');

    // Sticky Header Scroll Effect
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (header) {
            header.classList.toggle('scrolled', scrolled > 30);
        }
        if (backToTopBtn) {
            backToTopBtn.classList.toggle('visible', scrolled > 500);
        }
    }, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Mobile Menu Toggle
    if (menuToggle && mobileDrawer) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.toggle('open');
            menuToggle.classList.toggle('open', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        document.querySelectorAll('.mobile-nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
                menuToggle.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // Active Navigation Highlighting on Scroll
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const updateActiveNav = () => {
        const scrollPos = window.scrollY + 120;
        sections.forEach((sec) => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    };
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // ==========================================================================
    // 3. Theme Toggle (Light / Twilight Wood Mode)
    // ==========================================================================
    const themeBtn = document.querySelector('#theme-toggle');
    const savedTheme = localStorage.getItem('si_theme') || 'light';

    const setTheme = (theme) => {
        if (theme === 'twilight') {
            document.documentElement.setAttribute('data-theme', 'twilight');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('si_theme', theme);
    };
    setTheme(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isTwilight = document.documentElement.getAttribute('data-theme') === 'twilight';
            const nextTheme = isTwilight ? 'light' : 'twilight';
            setTheme(nextTheme);
            showToast(nextTheme === 'twilight' ? 'Twilight Wood Theme Activated' : 'Natural Light Theme Activated');
        });
    }

    // ==========================================================================
    // 4. Interior Gallery Slider
    // ==========================================================================
    const initGallerySlider = () => {
        const slides = [...document.querySelectorAll('.interior-slide')];
        const countEl = document.querySelector('#slide-count');
        const progressBar = document.querySelector('#slider-progress-bar');
        const prevBtn = document.querySelector('#previous-slide');
        const nextBtn = document.querySelector('#next-slide');
        const sliderContainer = document.querySelector('.interior-slider');

        if (slides.length === 0 || !sliderContainer) return;

        let current = 0;
        let slideTimer = null;

        const updateSlide = (idx) => {
            current = (idx + slides.length) % slides.length;
            slides.forEach((s, i) => s.classList.toggle('active', i === current));
            if (countEl) countEl.textContent = `0${current + 1} / 0${slides.length}`;
            if (progressBar) progressBar.style.transform = `translateX(${current * 100}%)`;
        };

        const nextSlide = () => updateSlide(current + 1);
        const prevSlide = () => updateSlide(current - 1);

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Autoplay
        const startAutoplay = () => {
            stopAutoplay();
            slideTimer = setInterval(nextSlide, 5500);
        };
        const stopAutoplay = () => {
            if (slideTimer) clearInterval(slideTimer);
        };

        sliderContainer.addEventListener('mouseenter', stopAutoplay);
        sliderContainer.addEventListener('mouseleave', startAutoplay);
        startAutoplay();

        // Touch Swipe
        let startX = 0, startY = 0;
        sliderContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', (e) => {
            const deltaX = startX - e.changedTouches[0].clientX;
            const deltaY = startY - e.changedTouches[0].clientY;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
                if (deltaX > 0) nextSlide();
                else prevSlide();
            }
        }, { passive: true });

        updateSlide(0);
    };
    initGallerySlider();

    // ==========================================================================
    // 5. Product Catalog Filter Tabs & Consultation Bridge
    // ==========================================================================
    const tabButtons = document.querySelectorAll('.catalog-tab-btn');
    const productCards = document.querySelectorAll('.catalog-card');

    tabButtons.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabButtons.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.dataset.filter;
            productCards.forEach((card) => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.style.display = match ? 'flex' : 'none';
            });
        });
    });

    // "Ask Studio" Consultation Buttons
    document.querySelectorAll('.product-consult-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const productName = btn.dataset.product;
            const messageField = document.querySelector('#field-message');
            const serviceField = document.querySelector('#field-service');
            const consultationSec = document.querySelector('#consultation');

            if (serviceField) {
                serviceField.value = 'kitchen-accessories';
            }
            if (messageField) {
                messageField.value = `Hello Sushil Interior team,\nI am interested in the "${productName}". Please provide availability, technical specifications, and on-site setup estimate for Saharanpur/Dehradun.`;
            }
            if (consultationSec) {
                consultationSec.scrollIntoView({ behavior: 'smooth' });
            }
            showToast(`Inquiring about ${productName}`);
        });
    });

    // ==========================================================================
    // 6. Interactive Cutlery Drawer Configurator Studio
    // ==========================================================================
    const initDrawerStudio = () => {
        const visualBox = document.querySelector('#drawer-visual-box');
        const slotsContainer = document.querySelector('#drawer-slots-container');
        const widthLabel = document.querySelector('#drawer-width-label');
        const totalPriceEl = document.querySelector('#drawer-total-price');
        const widthButtons = document.querySelectorAll('[data-drawer-width]');
        const checkboxes = document.querySelectorAll('.insert-checkbox-row input');
        const addConfiguredBtn = document.querySelector('#add-configured-drawer-btn');

        if (!visualBox || !slotsContainer) return;

        let currentWidth = 600;

        const basePrices = {
            450: 3400,
            600: 3800,
            900: 4800
        };

        const updateDrawer = () => {
            visualBox.setAttribute('data-width', currentWidth);
            if (widthLabel) {
                const labelText = currentWidth === 450 ? '450 mm (Compact Tandembox)' : currentWidth === 900 ? '900 mm (Wide Island Drawer)' : '600 mm (Standard Blum Tandembox)';
                widthLabel.textContent = `Drawer Width: ${labelText}`;
            }

            let total = basePrices[currentWidth] || 3800;
            const activeInserts = [];

            slotsContainer.innerHTML = '';

            checkboxes.forEach((cb) => {
                if (cb.checked) {
                    const name = cb.dataset.addonName;
                    const price = parseInt(cb.dataset.addonPrice, 10) || 0;
                    total += price;
                    activeInserts.push({ name, price });

                    // Add simulated visual slot
                    const slot = document.createElement('div');
                    slot.className = 'drawer-slot-item';

                    // Assign grid spans based on insert type
                    if (cb.id === 'insert-cutlery') {
                        slot.style.gridColumn = currentWidth === 900 ? 'span 3' : 'span 3';
                        slot.style.gridRow = 'span 2';
                        slot.innerHTML = `<strong>🍴 Cutlery Tray</strong><span>Spoons &amp; Forks</span>`;
                    } else if (cb.id === 'insert-knife') {
                        slot.style.gridColumn = currentWidth === 900 ? 'span 3' : 'span 3';
                        slot.style.gridRow = 'span 2';
                        slot.innerHTML = `<strong>🔪 Knife Rest</strong><span>6 Chef Blades</span>`;
                    } else if (cb.id === 'insert-spice') {
                        slot.style.gridColumn = currentWidth === 900 ? 'span 3' : 'span 3';
                        slot.style.gridRow = 'span 2';
                        slot.innerHTML = `<strong>🌶️ Masala Steps</strong><span>12 Spice Jars</span>`;
                    } else if (cb.id === 'insert-belan') {
                        slot.style.gridColumn = currentWidth === 900 ? 'span 3' : 'span 3';
                        slot.style.gridRow = 'span 2';
                        slot.innerHTML = `<strong>🫓 Chakla-Belan</strong><span>Circular Dock</span>`;
                    } else if (cb.id === 'insert-foil') {
                        slot.style.gridColumn = 'span 6';
                        slot.style.gridRow = 'span 1';
                        slot.innerHTML = `<strong>📜 Foil &amp; Cling</strong><span>Sliding Cutter</span>`;
                    }
                    slotsContainer.appendChild(slot);
                }
            });

            if (totalPriceEl) {
                totalPriceEl.textContent = `₹${total.toLocaleString('en-IN')}`;
            }

            return { total, activeInserts };
        };

        widthButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                widthButtons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                currentWidth = parseInt(btn.dataset.drawerWidth, 10);
                updateDrawer();
            });
        });

        checkboxes.forEach((cb) => {
            cb.addEventListener('change', updateDrawer);
        });

        if (addConfiguredBtn) {
            addConfiguredBtn.addEventListener('click', () => {
                const { total, activeInserts } = updateDrawer();
                const insertNames = activeInserts.map((i) => i.name).join(', ');
                orderEngine.addItem({
                    id: 'custom-drawer-' + Date.now(),
                    name: `Custom ${currentWidth}mm Teak Drawer Setup`,
                    wood: `Seasoned CP Teak (${currentWidth}mm Width)`,
                    price: total,
                    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=400&q=80',
                    details: insertNames
                });
            });
        }

        updateDrawer();
    };
    initDrawerStudio();

    // ==========================================================================
    // 7. Order Listing System & Quote Basket Drawer Engine
    // ==========================================================================
    class OrderListingEngine {
        constructor() {
            this.items = JSON.parse(localStorage.getItem('si_order_items')) || [
                {
                    id: 'item-1',
                    name: 'Handcrafted CP Teak Cutlery Tray',
                    wood: 'Seasoned CP Teak',
                    price: 4800,
                    qty: 1,
                    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=400&q=80'
                }
            ];

            this.drawer = document.querySelector('#order-drawer');
            this.badge = document.querySelector('#cart-count-badge');
            this.listEl = document.querySelector('#order-items-list');
            this.totalEl = document.querySelector('#order-total-val');
            this.pincodeInput = document.querySelector('#pincode-input');
            this.pincodeBtn = document.querySelector('#pincode-btn');
            this.pincodeStatus = document.querySelector('#pincode-status');
            this.orderSubmitBtn = document.querySelector('#order-submit-btn');

            this.initListeners();
            this.render();
        }

        save() {
            localStorage.setItem('si_order_items', JSON.stringify(this.items));
            this.render();
        }

        addItem(product) {
            const existing = this.items.find((i) => i.name === product.name && i.wood === product.wood);
            if (existing) {
                existing.qty += 1;
            } else {
                this.items.push({
                    id: product.id || 'item-' + Date.now(),
                    name: product.name,
                    wood: product.wood || 'Standard Finish',
                    price: product.price,
                    qty: 1,
                    image: product.image || 'assets/kitchen-appliances-hero.png'
                });
            }
            this.save();
            this.openDrawer();
            showToast(`Added "${product.name}" to Quote Basket`);
        }

        removeItem(id) {
            this.items = this.items.filter((i) => i.id !== id);
            this.save();
        }

        updateQty(id, delta) {
            const item = this.items.find((i) => i.id === id);
            if (!item) return;
            item.qty += delta;
            if (item.qty <= 0) {
                this.removeItem(id);
            } else {
                this.save();
            }
        }

        openDrawer() {
            if (this.drawer) {
                this.drawer.classList.add('open');
                this.drawer.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }
        }

        closeDrawer() {
            if (this.drawer) {
                this.drawer.classList.remove('open');
                this.drawer.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        }

        initListeners() {
            // Cart openers
            document.querySelectorAll('[data-open-cart]').forEach((btn) => {
                btn.addEventListener('click', () => this.openDrawer());
            });

            // Cart closers
            document.querySelectorAll('[data-close-cart]').forEach((btn) => {
                btn.addEventListener('click', () => this.closeDrawer());
            });

            // Add to basket buttons in catalog cards
            document.querySelectorAll('.add-basket-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    this.addItem({
                        id: btn.dataset.id,
                        name: btn.dataset.name,
                        wood: btn.dataset.finish,
                        price: parseInt(btn.dataset.price, 10),
                        image: btn.dataset.img
                    });
                });
            });

            // Pincode Check
            if (this.pincodeBtn && this.pincodeInput) {
                this.pincodeBtn.addEventListener('click', () => {
                    const pin = this.pincodeInput.value.trim();
                    if (!this.pincodeStatus) return;

                    if (/^247\d{3}$/.test(pin) || /^248\d{3}$/.test(pin) || /^249\d{3}$/.test(pin)) {
                        this.pincodeStatus.innerHTML = '<span style="color: #4CAF50; font-weight: 600;">✓ Direct White-Glove On-Site Setup Available in Saharanpur &amp; Dehradun</span>';
                    } else if (/^\d{6}$/.test(pin)) {
                        this.pincodeStatus.innerHTML = '<span style="color: var(--color-terracotta); font-weight: 600;">✓ Insured Timber Crate Road Logistics Available</span>';
                    } else {
                        this.pincodeStatus.innerHTML = '<span style="color: #E53935;">Please enter a valid 6-digit Indian PIN code.</span>';
                    }
                });
            }

            // Transfer Cart to Consultation Inquiry Form
            if (this.orderSubmitBtn) {
                this.orderSubmitBtn.addEventListener('click', () => {
                    if (this.items.length === 0) {
                        showToast('Quote basket is empty');
                        return;
                    }

                    let message = `Kitchen Quote Basket Items:\n`;
                    let total = 0;
                    this.items.forEach((item, index) => {
                        const sub = item.price * item.qty;
                        total += sub;
                        message += `${index + 1}. ${item.name} (${item.wood}) x ${item.qty} = ₹${sub.toLocaleString('en-IN')}\n`;
                    });
                    message += `Total Estimated Quote: ₹${total.toLocaleString('en-IN')}\n`;

                    const pin = this.pincodeInput ? this.pincodeInput.value.trim() : '';
                    if (pin) message += `Delivery PIN Code: ${pin}\n`;
                    message += `Please verify item dimensions and send formal invoice.`;

                    const messageField = document.querySelector('#field-message');
                    if (messageField) {
                        messageField.value = message;
                    }

                    this.closeDrawer();
                    const consultationSec = document.querySelector('#consultation');
                    if (consultationSec) {
                        consultationSec.scrollIntoView({ behavior: 'smooth' });
                    }
                    showToast('Basket transferred to consultation form below!');
                });
            }
        }

        render() {
            const count = this.items.reduce((acc, item) => acc + item.qty, 0);
            if (this.badge) this.badge.textContent = String(count);

            if (!this.listEl) return;
            this.listEl.innerHTML = '';

            let grandTotal = 0;

            if (this.items.length === 0) {
                this.listEl.innerHTML = `
                    <div style="text-align: center; padding: 48px 20px; color: var(--color-ink-muted);">
                        <p style="font-family: var(--font-serif); font-size: 18px; margin-bottom: 8px;">Your Quote Basket is Empty</p>
                        <p style="font-size: 13px;">Browse built-in hobs, teak cutlery trays, and countertop slabs to add items.</p>
                    </div>
                `;
            } else {
                this.items.forEach((item) => {
                    const subtotal = item.price * item.qty;
                    grandTotal += subtotal;

                    const card = document.createElement('div');
                    card.className = 'order-item-card';
                    card.innerHTML = `
                        <img class="order-item-img" src="${item.image}" alt="${item.name}">
                        <div class="order-item-details">
                            <h4 class="order-item-name">${item.name}</h4>
                            <span class="order-item-finish">${item.wood}</span>
                            <div class="order-item-price">₹${subtotal.toLocaleString('en-IN')}</div>
                        </div>
                        <div class="order-item-actions">
                            <div class="qty-stepper">
                                <button class="qty-btn" data-dec="${item.id}">−</button>
                                <span class="qty-val">${item.qty}</span>
                                <button class="qty-btn" data-inc="${item.id}">+</button>
                            </div>
                            <button class="order-item-remove" data-remove="${item.id}">Remove</button>
                        </div>
                    `;

                    card.querySelector('[data-dec]').addEventListener('click', () => this.updateQty(item.id, -1));
                    card.querySelector('[data-inc]').addEventListener('click', () => this.updateQty(item.id, 1));
                    card.querySelector('[data-remove]').addEventListener('click', () => this.removeItem(item.id));

                    this.listEl.appendChild(card);
                });
            }

            if (this.totalEl) {
                this.totalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
            }
        }
    }

    const orderEngine = new OrderListingEngine();

    // ==========================================================================
    // 8. Instant Kitchen Cost & Appliance Estimator
    // ==========================================================================
    const initEstimator = () => {
        const estimator = document.querySelector('#project-estimator');
        if (!estimator) return;

        const slabButtons = estimator.querySelectorAll('[data-step="slab"] .estimator-choice');
        const stoveButtons = estimator.querySelectorAll('[data-step="stove"] .estimator-choice');
        const compButtons = estimator.querySelectorAll('[data-step="compartments"] .estimator-choice');
        const chimneyButtons = estimator.querySelectorAll('[data-step="chimney"] .estimator-choice');

        const readoutInvestment = estimator.querySelector('#est-investment');
        const readoutDuration = estimator.querySelector('#est-duration');
        const prefillBtn = estimator.querySelector('#est-prefill');

        let currentSlab = 'quartz';
        let currentStove = '4burner';
        let currentComp = 'tandem';
        let currentChimney = 'motion';

        const calculate = () => {
            let slabMin = 48000, slabMax = 75000;
            if (currentSlab === 'granite') { slabMin = 35000; slabMax = 58000; }
            else if (currentSlab === 'porcelain') { slabMin = 70000; slabMax = 120000; }

            let stoveMin = 18400, stoveMax = 24000;
            if (currentStove === '3burner') { stoveMin = 14200; stoveMax = 18000; }
            else if (currentStove === 'hybrid') { stoveMin = 28000; stoveMax = 38000; }

            let compMin = 85000, compMax = 135000;
            let durationMin = 3, durationMax = 4;
            if (currentComp === 'standard') { compMin = 45000; compMax = 70000; durationMin = 2; durationMax = 3; }
            else if (currentComp === 'bespoke') { compMin = 160000; compMax = 280000; durationMin = 4; durationMax = 5; }

            let chimneyMin = 19500, chimneyMax = 26000;
            if (currentChimney === 'curved') { chimneyMin = 14000; chimneyMax = 20000; }
            else if (currentChimney === 'island') { chimneyMin = 28000; chimneyMax = 42000; }

            const totalMin = slabMin + stoveMin + compMin + chimneyMin;
            const totalMax = slabMax + stoveMax + compMax + chimneyMax;

            const minLakh = (totalMin / 100000).toFixed(2);
            const maxLakh = (totalMax / 100000).toFixed(2);

            if (readoutInvestment) readoutInvestment.textContent = `₹${minLakh} Lakhs — ₹${maxLakh} Lakhs`;
            if (readoutDuration) readoutDuration.textContent = `${durationMin} — ${durationMax} Weeks`;
        };

        const bindStep = (buttons, onSelect) => {
            buttons.forEach((btn) => {
                btn.addEventListener('click', () => {
                    buttons.forEach((b) => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    onSelect(btn.dataset.val);
                    calculate();
                });
            });
        };

        bindStep(slabButtons, (val) => { currentSlab = val; });
        bindStep(stoveButtons, (val) => { currentStove = val; });
        bindStep(compButtons, (val) => { currentComp = val; });
        bindStep(chimneyButtons, (val) => { currentChimney = val; });
        calculate();

        if (prefillBtn) {
            prefillBtn.addEventListener('click', () => {
                const consultationSec = document.querySelector('#consultation');
                const projectNotes = document.querySelector('#field-message');
                const serviceSelect = document.querySelector('#field-service');

                if (serviceSelect) {
                    serviceSelect.value = 'kitchen-accessories';
                }

                if (projectNotes) {
                    const priceRange = readoutInvestment ? readoutInvestment.textContent : '';
                    projectNotes.value = `Estimated Kitchen Configuration:\n- Counter Slab: ${currentSlab.toUpperCase()}\n- Stove Hob: ${currentStove.toUpperCase()}\n- Cutlery & Storage: ${currentComp.toUpperCase()}\n- Chimney: ${currentChimney.toUpperCase()}\n- Investment Scope: ${priceRange}\nPlease schedule on-site laser measurement and consultation in Saharanpur/Dehradun.`;
                }

                if (consultationSec) {
                    consultationSec.scrollIntoView({ behavior: 'smooth' });
                }
                showToast('Kitchen estimate transferred to consultation form!');
            });
        }
    };
    initEstimator();

    // ==========================================================================
    // 9. Before & After Transformation Slider
    // ==========================================================================
    const initBeforeAfter = () => {
        const wrapper = document.querySelector('.before-after-wrapper');
        const overlay = document.querySelector('.before-after-overlay');
        const handle = document.querySelector('.slider-handle');
        if (!wrapper || !overlay || !handle) return;

        let isDragging = false;

        const setPosition = (clientX) => {
            const rect = wrapper.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            let percentage = (offsetX / rect.width) * 100;
            percentage = Math.max(2, Math.min(98, percentage));
            wrapper.style.setProperty('--split-pos', `${percentage}%`);
        };

        const onStart = (e) => {
            isDragging = true;
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            setPosition(x);
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            setPosition(x);
        };

        const onEnd = () => {
            isDragging = false;
        };

        wrapper.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        wrapper.addEventListener('touchstart', onStart, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onEnd, { passive: true });
    };
    initBeforeAfter();

    // ==========================================================================
    // 10. Quick Search Modal Engine
    // ==========================================================================
    const initSearchModal = () => {
        const openBtn = document.querySelector('#search-open-btn');
        const modal = document.querySelector('#search-modal');
        const closeBackdrop = document.querySelector('#search-close-backdrop');
        const closeBtn = document.querySelector('#search-close-btn');
        const input = document.querySelector('#search-modal-input');
        const resultsList = document.querySelector('#search-results-list');

        if (!modal || !input) return;

        const openModal = () => {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            input.value = '';
            input.focus();
            resultsList.innerHTML = '<div class="search-placeholder-msg">Type to search built-in hobs, teak cutlery trays, chimneys, slabs...</div>';
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        if (openBtn) openBtn.addEventListener('click', openModal);
        if (closeBackdrop) closeBackdrop.addEventListener('click', closeModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        // Keyboard Shortcut: / or Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') || (e.ctrlKey && e.key === 'k')) {
                e.preventDefault();
                openModal();
            }
            if (e.key === 'Escape') {
                closeModal();
                if (orderEngine) orderEngine.closeDrawer();
            }
        });

        // Search index
        const catalogItems = [
            { title: 'Built-in 4-Burner Glass Hob', category: 'Gas Hobs', price: '₹18,400', id: 'hob-4b' },
            { title: 'Handcrafted CP Teak Cutlery Tray', category: 'Cutlery & Drawers', price: '₹4,800', id: 'cutlery-teak' },
            { title: 'Filterless Motion-Sensor Chimney', category: 'Chimneys', price: '₹19,500', id: 'chimney-motion' },
            { title: 'Convection Built-in Oven (70L)', category: 'Built-in Ovens', price: '₹36,000', id: 'oven-70l' },
            { title: 'Nano-White Quartz Slab (Slape)', category: 'Counter Slabs', price: '₹520/sq ft', id: 'slab-quartz' },
            { title: '3-Burner Italian Flame Hob', category: 'Gas Hobs', price: '₹14,200', id: 'hob-3b' },
            { title: 'Tandem Thali & Deep Pan Drawer', category: 'Cutlery & Drawers', price: '₹6,400', id: 'drawer-thali' },
            { title: 'Blind Corner LeMans Trays', category: 'Corner Storage', price: '₹28,500', id: 'corner-lemans' },
            { title: '6-Tier Hydraulic Pantry Larder', category: 'Tall Pantry', price: '₹42,000', id: 'pantry-6t' },
            { title: 'Black Galaxy Granite Slab', category: 'Counter Slabs', price: '₹380/sq ft', id: 'slab-granite' },
            { title: 'Curved Glass Island Chimney', category: 'Chimneys', price: '₹24,800', id: 'chimney-island' },
            { title: 'Under-Sink Waste Station', category: 'Under-Sink', price: '₹8,900', id: 'sink-waste' }
        ];

        input.addEventListener('input', () => {
            const query = input.value.trim().toLowerCase();
            if (!query) {
                resultsList.innerHTML = '<div class="search-placeholder-msg">Type to search built-in hobs, teak cutlery trays, chimneys, slabs...</div>';
                return;
            }

            const matches = catalogItems.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );

            if (matches.length === 0) {
                resultsList.innerHTML = `<div class="search-placeholder-msg">No products found matching "${query}".</div>`;
                return;
            }

            resultsList.innerHTML = '';
            matches.forEach(item => {
                const row = document.createElement('div');
                row.className = 'search-result-item';
                row.innerHTML = `
                    <div>
                        <strong style="display: block; font-size: 14px;">${item.title}</strong>
                        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-ink-muted);">${item.category}</span>
                    </div>
                    <span style="font-family: var(--font-mono); font-weight: 600; color: var(--color-terracotta);">${item.price}</span>
                `;
                row.addEventListener('click', () => {
                    closeModal();
                    const targetCard = document.querySelector(`[data-id="${item.id}"]`)?.closest('.catalog-card');
                    if (targetCard) {
                        // Ensure it is visible if filtered
                        targetCard.style.display = 'flex';
                        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        targetCard.style.outline = '2px solid var(--color-terracotta)';
                        setTimeout(() => { targetCard.style.outline = ''; }, 2400);
                    }
                });
                resultsList.appendChild(row);
            });
        });
    };
    initSearchModal();

    // ==========================================================================
    // 11. Camera AR & Swatches
    // ==========================================================================
    const camera = document.querySelector('#ar-camera');
    const studioView = document.querySelector('#studio-view');
    const cameraButton = document.querySelector('#camera-button');
    const arStatus = document.querySelector('#ar-status');

    if (cameraButton && studioView && camera) {
        cameraButton.addEventListener('click', async () => {
            if (studioView.classList.contains('camera-on')) {
                if (camera.srcObject) {
                    camera.srcObject.getTracks().forEach((track) => track.stop());
                    camera.srcObject = null;
                }
                studioView.classList.remove('camera-on');
                cameraButton.textContent = '▣ View with Mobile Camera (AR)';
                if (arStatus) arStatus.innerHTML = '<span style="color: var(--color-terracotta);">✦</span><span>3D Studio Ready</span>';
                return;
            }

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                showToast('Camera AR is not supported on this browser');
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' } },
                    audio: false
                });
                camera.srcObject = stream;
                studioView.classList.add('camera-on');
                cameraButton.textContent = '✕ Close Camera AR Preview';
                if (arStatus) arStatus.innerHTML = '<span style="color: #4CAF50;">●</span><span>Camera AR Active — Place kitchen island in room</span>';
                showToast('Camera AR feed active');
            } catch (err) {
                showToast('Camera permission denied or camera unavailable');
            }
        });
    }

    // Material Swatches Listener
    document.querySelectorAll('.swatch').forEach((swatch) => {
        swatch.addEventListener('click', () => {
            document.querySelectorAll('.swatch').forEach((s) => s.classList.remove('active'));
            swatch.classList.add('active');
            const color = swatch.dataset.cabinet;
            if (window.updateCabinetMaterial) {
                window.updateCabinetMaterial(color);
            }
            showToast(`Cabinet finish: ${swatch.textContent.trim()}`);
        });
    });

    document.querySelectorAll('.floor-choice').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.floor-choice').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const slab = btn.dataset.slab;
            if (window.updateSlabMaterial) {
                window.updateSlabMaterial(slab);
            }
            showToast(`Counter slab: ${btn.textContent.trim()}`);
        });
    });

    // ==========================================================================
    // 12. Consultation Form Submission
    // ==========================================================================
    const consultationForm = document.querySelector('#consultation-form');
    if (consultationForm) {
        consultationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = consultationForm.querySelector('.submit-inquiry-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Sending Request...</span>';
            }

            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Send Consultation Request</span> <span>→</span>';
                }
                const msgEl = consultationForm.querySelector('.form-message');
                if (msgEl) {
                    msgEl.textContent = 'Dhanyavaad! Sushil Interior studio team will contact you within 24 hours.';
                }
                consultationForm.reset();
                showToast('Consultation request sent successfully!');
            }, 800);
        });
    }

    // Footer Year
    const yearSpan = document.querySelector('#footer-year');
    if (yearSpan) {
        yearSpan.textContent = String(new Date().getFullYear());
    }

    // Toast Engine
    const toastEl = document.querySelector('#toast-notice');
    window.showToast = (message) => {
        if (!toastEl) return;
        const msg = toastEl.querySelector('.toast-msg');
        if (msg) msg.textContent = message;
        toastEl.classList.add('show');
        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3200);
    };
});
