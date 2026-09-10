/**
 * SUSHIL INTERIOR — CLIENT-SIDE INTERACTION ENGINE
 * Saharanpur, UP (India)
 * Features: First-Page Hero Showcase Slider, Order Listing Cart, Room Tabs, AR View Controller
 * Clean & Production-Grade (Zero audio/music bloat, zero intrusive timers)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Enable smooth reveal animations progressively
    document.body.classList.add('js-reveal-active');

    // ==========================================================================
    // 1. First-Page Hero Showcase Slider
    // ==========================================================================
    const initHeroSlider = () => {
        const sliderWrap = document.querySelector('#hero-slider-wrap');
        const slides = document.querySelectorAll('.hero-slide');
        const prevBtn = document.querySelector('#hero-slider-prev');
        const nextBtn = document.querySelector('#hero-slider-next');
        const dotsContainer = document.querySelector('#hero-slider-dots');

        if (!sliderWrap || slides.length === 0) return;

        let currentSlide = 0;
        let autoPlayInterval = null;

        // Build dots
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, idx) => {
                const dot = document.createElement('button');
                dot.className = 'hero-slider-dot' + (idx === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
                dot.addEventListener('click', () => goToSlide(idx));
                dotsContainer.appendChild(dot);
            });
        }

        const updateDots = () => {
            const dots = dotsContainer ? dotsContainer.querySelectorAll('.hero-slider-dot') : [];
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentSlide);
            });
        };

        const goToSlide = (idx) => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (idx + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            updateDots();
        };

        const nextSlide = () => goToSlide(currentSlide + 1);
        const prevSlide = () => goToSlide(currentSlide - 1);

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Autoplay
        const startAutoPlay = () => {
            stopAutoPlay();
            autoPlayInterval = setInterval(nextSlide, 5000);
        };

        const stopAutoPlay = () => {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
        };

        sliderWrap.addEventListener('mouseenter', stopAutoPlay);
        sliderWrap.addEventListener('mouseleave', startAutoPlay);
        startAutoPlay();

        // Touch swipe support
        let touchStartX = 0;
        sliderWrap.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        sliderWrap.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
        }, { passive: true });
    };
    initHeroSlider();

    // ==========================================================================
    // 3. Order Listing System & Quote Basket
    // ==========================================================================
    class OrderListingEngine {
        constructor() {
            this.items = JSON.parse(localStorage.getItem('si_order_items')) || [
                {
                    id: 'item-1',
                    name: 'Royal Saharanpur Teak Dining Set',
                    wood: 'Natural CP Teak',
                    price: 145000,
                    qty: 1,
                    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=300&q=80'
                }
            ];

            this.drawer = document.querySelector('#order-drawer');
            this.badge = document.querySelector('#cart-count-badge');
            this.listEl = document.querySelector('#order-items-list');
            this.totalEl = document.querySelector('#order-total-val');
            this.pincodeInput = document.querySelector('#pincode-input');
            this.pincodeBtn = document.querySelector('#pincode-btn');
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
                    id: 'item-' + Date.now(),
                    name: product.name,
                    wood: product.wood || 'Natural CP Teak',
                    price: product.price,
                    qty: 1,
                    image: product.image
                });
            }
            this.save();
            this.openDrawer();
            showToast(`Added "${product.name}" to inquiry basket`);
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

        updateFinish(id, newWood) {
            const item = this.items.find((i) => i.id === id);
            if (item) {
                item.wood = newWood;
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
            document.querySelectorAll('[data-open-cart]').forEach((btn) => {
                btn.addEventListener('click', () => this.openDrawer());
            });

            document.querySelectorAll('[data-close-cart]').forEach((btn) => {
                btn.addEventListener('click', () => this.closeDrawer());
            });

            // Add to Order buttons
            document.querySelectorAll('.add-to-order-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const card = btn.closest('.catalog-item-card, .room-card');
                    if (!card) return;

                    const titleEl = card.querySelector('.catalog-item-title, .room-card-title');
                    const priceEl = card.querySelector('.catalog-price, .room-card-price');
                    const imgEl = card.querySelector('img');

                    if (!titleEl || !priceEl || !imgEl) return;

                    const title = titleEl.textContent.trim();
                    const priceStr = priceEl.textContent.replace(/[^0-9]/g, '');

                    this.addItem({
                        name: title,
                        price: parseInt(priceStr, 10) || 50000,
                        wood: 'Natural CP Teak',
                        image: imgEl.src
                    });
                });
            });

            // Pincode Delivery Estimator
            if (this.pincodeBtn && this.pincodeInput) {
                this.pincodeBtn.addEventListener('click', () => {
                    const pin = this.pincodeInput.value.trim();
                    if (!/^\d{6}$/.test(pin)) {
                        showToast('Please enter a valid 6-digit Indian PIN code');
                        return;
                    }

                    if (pin.startsWith('247')) {
                        showToast(`Pincode ${pin}: Saharanpur Studio local — direct workshop inspection & express delivery!`);
                    } else if (pin.startsWith('248')) {
                        showToast(`Pincode ${pin}: Dehradun Studio local — direct architectural consultation & white-glove setup.`);
                    } else {
                        showToast(`Pincode ${pin}: Saharanpur & Dehradun studio team dispatch with insured timber crates.`);
                    }
                });
            }

            // Order Inquiry Generator & Consultation Prefill
            if (this.orderSubmitBtn) {
                this.orderSubmitBtn.addEventListener('click', () => {
                    if (this.items.length === 0) {
                        showToast('Your order inquiry list is empty. Add items first.');
                        return;
                    }

                    let message = `Requested Bespoke Furniture Scope:\n`;
                    let grandTotal = 0;
                    this.items.forEach((item, index) => {
                        const sub = item.price * item.qty;
                        grandTotal += sub;
                        message += `${index + 1}. ${item.name} (${item.wood}) x${item.qty} - ₹${sub.toLocaleString('en-IN')}\n`;
                    });

                    message += `Total Estimated Investment: ₹${grandTotal.toLocaleString('en-IN')}\n`;
                    const pin = this.pincodeInput ? this.pincodeInput.value.trim() : '';
                    if (pin) message += `Delivery Pincode: ${pin}\n`;
                    message += `Please provide formal quotation and wood finishing schedule.`;

                    const messageField = document.querySelector('#field-message');
                    if (messageField) {
                        messageField.value = message;
                    }

                    this.closeCart();
                    const contactSection = document.querySelector('#contact');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    showToast('Order items populated in consultation inquiry below!');
                });
            }
        }

        render() {
            const count = this.items.reduce((sum, item) => sum + item.qty, 0);
            if (this.badge) this.badge.textContent = count;

            if (!this.listEl) return;
            this.listEl.innerHTML = '';

            let grandTotal = 0;

            if (this.items.length === 0) {
                this.listEl.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: var(--color-ink-muted);">
                        <p style="font-family: var(--font-serif); font-size: 18px; margin-bottom: 8px;">Your inquiry list is empty</p>
                        <p style="font-size: 13px;">Explore our handcrafted Saharanpur collections below to add items.</p>
                    </div>
                `;
            } else {
                this.items.forEach((item) => {
                    const subtotal = item.price * item.qty;
                    grandTotal += subtotal;

                    const row = document.createElement('div');
                    row.className = 'order-item-card';
                    row.innerHTML = `
                        <img class="order-item-img" src="${item.image}" alt="${item.name}">
                        <div class="order-item-details">
                            <h4 class="order-item-name">${item.name}</h4>
                            <select class="order-item-finish-select" data-finish-id="${item.id}">
                                <option value="Natural CP Teak" ${item.wood === 'Natural CP Teak' ? 'selected' : ''}>Natural CP Teak</option>
                                <option value="Indian Rosewood (Sheesham)" ${item.wood === 'Indian Rosewood (Sheesham)' ? 'selected' : ''}>Indian Rosewood (Sheesham)</option>
                                <option value="Smoked Walnut" ${item.wood === 'Smoked Walnut' ? 'selected' : ''}>Smoked Walnut</option>
                                <option value="Honey Teak Finish" ${item.wood === 'Honey Teak Finish' ? 'selected' : ''}>Honey Teak Finish</option>
                            </select>
                            <span class="order-item-price">₹${subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div class="order-item-actions">
                            <div class="qty-stepper">
                                <button class="qty-btn" data-qty-dec="${item.id}">−</button>
                                <span class="qty-val">${item.qty}</span>
                                <button class="qty-btn" data-qty-inc="${item.id}">+</button>
                            </div>
                            <button class="order-item-remove" data-remove="${item.id}">Remove</button>
                        </div>
                    `;

                    row.querySelector('[data-finish-id]').addEventListener('change', (e) => {
                        this.updateFinish(item.id, e.target.value);
                    });

                    row.querySelector('[data-qty-dec]').addEventListener('click', () => this.updateQty(item.id, -1));
                    row.querySelector('[data-qty-inc]').addEventListener('click', () => this.updateQty(item.id, 1));
                    row.querySelector('[data-remove]').addEventListener('click', () => this.removeItem(item.id));

                    this.listEl.appendChild(row);
                });
            }

            if (this.totalEl) {
                this.totalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
            }

            if (window.attachHoverListeners) window.attachHoverListeners();
        }
    }

    const orderEngine = new OrderListingEngine();

    // ==========================================================================
    // 4. Whole House Room Category Tab Filter
    // ==========================================================================
    const roomTabs = document.querySelectorAll('.room-tab-btn');
    const roomCards = document.querySelectorAll('.room-card');

    roomTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            roomTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.dataset.room;
            roomCards.forEach((card) => {
                const match = filter === 'all' || card.dataset.roomType === filter;
                card.style.display = match ? 'flex' : 'none';
            });
        });
    });

    // ==========================================================================
    // 5. Before & After Renovation Slider
    // ==========================================================================
    const initBeforeAfter = () => {
        const wrapper = document.querySelector('.before-after-wrapper');
        const overlay = document.querySelector('.before-after-overlay');
        const handle = document.querySelector('.slider-handle');
        if (!wrapper || !overlay || !handle) return;

        let isDragging = false;

        const updatePosition = (clientX) => {
            const rect = wrapper.getBoundingClientRect();
            const x = clientX - rect.left;
            let percentage = (x / rect.width) * 100;
            percentage = Math.max(2, Math.min(98, percentage));
            overlay.style.width = `${percentage}%`;
            handle.style.left = `${percentage}%`;
        };

        wrapper.addEventListener('mousedown', (e) => {
            isDragging = true;
            updatePosition(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) updatePosition(e.clientX);
        });

        window.addEventListener('mouseup', () => { isDragging = false; });

        wrapper.addEventListener('touchstart', (e) => {
            isDragging = true;
            updatePosition(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (isDragging) updatePosition(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('touchend', () => { isDragging = false; });
    };
    initBeforeAfter();

    // ==========================================================================
    // 6. Design Scope & Cost Estimator (INR / Lakhs)
    // ==========================================================================
    const initEstimator = () => {
        const estimator = document.querySelector('#project-estimator');
        if (!estimator) return;

        const scopeChoices = estimator.querySelectorAll('[data-step="scope"] .estimator-choice');
        const sizeChoices = estimator.querySelectorAll('[data-step="size"] .estimator-choice');
        const timelineChoices = estimator.querySelectorAll('[data-step="timeline"] .estimator-choice');

        const readoutInvestment = estimator.querySelector('#est-investment');
        const readoutDuration = estimator.querySelector('#est-duration');
        const prefillBtn = estimator.querySelector('#est-prefill');

        let currentScope = 'full';
        let currentSize = 'medium';
        let currentTimeline = 'standard';

        const calculate = () => {
            let minLakh = 14;
            let maxLakh = 32;
            let weeksMin = 10;
            let weeksMax = 18;

            if (currentScope === 'kitchen') {
                minLakh = 4.5;
                maxLakh = 9.5;
                weeksMin = 4;
                weeksMax = 7;
            } else if (currentScope === 'villa') {
                minLakh = 35;
                maxLakh = 85;
                weeksMin = 18;
                weeksMax = 32;
            }

            if (currentSize === 'small') {
                minLakh = Math.round(minLakh * 0.75 * 10) / 10;
                maxLakh = Math.round(maxLakh * 0.75 * 10) / 10;
            } else if (currentSize === 'large') {
                minLakh = Math.round(minLakh * 1.5 * 10) / 10;
                maxLakh = Math.round(maxLakh * 1.7 * 10) / 10;
                weeksMin += 4;
                weeksMax += 8;
            }

            if (readoutInvestment) readoutInvestment.textContent = `₹${minLakh} Lakhs — ₹${maxLakh} Lakhs`;
            if (readoutDuration) readoutDuration.textContent = `${weeksMin} — ${weeksMax} Weeks`;
        };

        const setupStep = (buttons, onSelect) => {
            buttons.forEach((btn) => {
                btn.addEventListener('click', () => {
                    buttons.forEach((b) => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    onSelect(btn.dataset.val);
                    calculate();
                });
            });
        };

        setupStep(scopeChoices, (val) => { currentScope = val; });
        setupStep(sizeChoices, (val) => { currentSize = val; });
        setupStep(timelineChoices, (val) => { currentTimeline = val; });
        calculate();

        if (prefillBtn) {
            prefillBtn.addEventListener('click', () => {
                const contactSection = document.querySelector('#contact');
                const projectNotes = document.querySelector('#field-message');
                const serviceSelect = document.querySelector('#field-service');

                if (serviceSelect) {
                    if (currentScope === 'kitchen') serviceSelect.value = 'modular-kitchen';
                    else if (currentScope === 'villa') serviceSelect.value = 'turnkey-villa';
                    else serviceSelect.value = 'full-residential';
                }

                if (projectNotes) {
                    projectNotes.value = `Estimated Project: ${currentScope.toUpperCase()} | Scale: ${currentSize.toUpperCase()} | Delivery: ${currentTimeline.toUpperCase()}. We would like to schedule an initial consultation with Sushil Interior.`;
                }

                if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
                showToast('Consultation scope pre-filled below');
            });
        }
    };
    initEstimator();

    // ==========================================================================
    // 7. Theme Toggle & Scroll Engines
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
            setTheme(isTwilight ? 'light' : 'twilight');
            showToast(isTwilight ? 'Natural Day Mode' : 'Twilight Wood Mode');
        });
    }

    const progressBar = document.querySelector('.scroll-progress');
    const header = document.querySelector('.site-header');
    const backToTopBtn = document.querySelector('#back-to-top');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (scrolled / totalHeight) * 100 : 0;

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (header) header.classList.toggle('scrolled', scrolled > 40);
        if (backToTopBtn) backToTopBtn.classList.toggle('visible', scrolled > 600);
    }, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Scroll Reveal Engine
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

    // Mobile Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileDrawer = document.querySelector('#mobile-drawer');

    if (menuToggle && mobileDrawer) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.toggle('open');
            menuToggle.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        document.querySelectorAll('.mobile-nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
                menuToggle.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // Video Story Modal
    const videoModal = document.querySelector('#video-modal');
    const videoEl = videoModal ? videoModal.querySelector('video') : null;

    const openVideo = () => {
        if (!videoModal) return;
        videoModal.classList.add('open');
        videoModal.setAttribute('aria-hidden', 'false');
        if (videoEl) videoEl.play();
        document.body.style.overflow = 'hidden';
    };

    const closeVideo = () => {
        if (!videoModal) return;
        videoModal.classList.remove('open');
        videoModal.setAttribute('aria-hidden', 'true');
        if (videoEl) videoEl.pause();
        document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-video-open]').forEach((b) => b.addEventListener('click', openVideo));
    document.querySelectorAll('[data-video-close]').forEach((b) => b.addEventListener('click', closeVideo));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVideo();
            if (orderEngine) orderEngine.closeDrawer();
            if (mobileDrawer && mobileDrawer.classList.contains('open')) {
                mobileDrawer.classList.remove('open');
                if (menuToggle) menuToggle.classList.remove('open');
                document.body.style.overflow = '';
            }
        }
    });

    // Toast System
    const toastNotice = document.querySelector('#toast-notice');
    window.showToast = (message) => {
        if (!toastNotice) return;
        toastNotice.querySelector('.toast-msg').textContent = message;
        toastNotice.classList.add('show');
        setTimeout(() => {
            toastNotice.classList.remove('show');
        }, 3400);
    };

    // Contact Form Submission
    const contactForm = document.querySelector('#inquiry-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending Studio Inquiry...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Send Consultation Request</span> <span class="arrow">→</span>';
                contactForm.reset();
                showToast('Dhanyavaad! Sushil Interior studio team will contact you within 24 hours.');
            }, 900);
        });
    }
});
