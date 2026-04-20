/* ============================================
   BookOrbit — Interactive Engine v3
   5 Premium Effects + Flipbook + Particles
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════════
    // NEW EFFECT: Preloader & Splash Screen
    // ═══════════════════════════════════════════════
    const preloader = document.getElementById('preloader');
    const plCounter = document.getElementById('plCounter');
    
    // Auto-split hero description for typography animation
    // (Removed heroDesc per user request)

    if (preloader && plCounter) {
        let pct = 0;
        const iv = setInterval(() => {
            pct += Math.random() * 15;
            if (pct >= 100) {
                pct = 100;
                clearInterval(iv);
                plCounter.textContent = '100';
                
                setTimeout(() => {
                    preloader.classList.add('loaded');
                    document.body.classList.add('app-loaded');
                    
                    // Allow time for CSS transform to finish
                    setTimeout(triggerHeroAnimations, 600);
                }, 400); 
            } else {
                plCounter.textContent = Math.floor(pct).toString().padStart(3, '0');
            }
        }, 70);
    } else {
        document.body.classList.add('app-loaded');
        setTimeout(triggerHeroAnimations, 200);
    }

    // ═══════════════════════════════════════════════
    // EFFECT 1: Lenis Physics-Based Smooth Scroll
    // ═══════════════════════════════════════════════
    const programmingBookCovers = [
        { title: "Clean Code", author: "Robert C. Martin", cover: "https://covers.openlibrary.org/b/olid/OL34878707M-L.jpg?default=false", source: "https://openlibrary.org/books/OL34878707M/Clean_Code" },
        { title: "Code Complete", author: "Steve McConnell", cover: "https://covers.openlibrary.org/b/olid/OL17628528M-L.jpg?default=false", source: "https://openlibrary.org/books/OL17628528M/Code_complete" },
        { title: "Introduction to Algorithms", author: "Thomas H. Cormen et al.", cover: "https://covers.openlibrary.org/b/olid/OL3946060M-L.jpg?default=false", source: "https://openlibrary.org/books/OL3946060M/Introduction_to_algorithms" },
        { title: "The Pragmatic Programmer", author: "Andy Hunt and Dave Thomas", cover: "https://covers.openlibrary.org/b/olid/OL27533114M-L.jpg?default=false", source: "https://openlibrary.org/books/OL27533114M/The_Pragmatic_Programmer" },
        { title: "Design Patterns", author: "Erich Gamma et al.", cover: "https://covers.openlibrary.org/b/olid/OL7408317M-L.jpg?default=false", source: "https://openlibrary.org/books/OL7408317M/Design_Patterns" },
        { title: "Refactoring", author: "Martin Fowler", cover: "https://covers.openlibrary.org/b/olid/OL26629721M-L.jpg?default=false", source: "https://openlibrary.org/books/OL26629721M/Refactoring" },
        { title: "Structure and Interpretation of Computer Programs", author: "Harold Abelson and Gerald Jay Sussman", cover: "https://covers.openlibrary.org/b/olid/OL2847540M-L.jpg?default=false", source: "https://openlibrary.org/books/OL2847540M/Structure_and_interpretation_of_computer_programs" },
        { title: "Working Effectively with Legacy Code", author: "Michael C. Feathers", cover: "https://covers.openlibrary.org/b/olid/OL26223631M-L.jpg?default=false", source: "https://openlibrary.org/books/OL26223631M/Working_Effectively_with_Legacy_Code" },
        { title: "Domain-Driven Design", author: "Eric Evans", cover: "https://covers.openlibrary.org/b/olid/OL9548519M-L.jpg?default=false", source: "https://openlibrary.org/books/OL9548519M/Domain-Driven_Design" },
        { title: "Programming Pearls", author: "Jon Bentley", cover: "https://covers.openlibrary.org/b/olid/OL2539105M-L.jpg?default=false", source: "https://openlibrary.org/books/OL2539105M/Programming_pearls" },
        { title: "The C Programming Language", author: "Brian W. Kernighan and Dennis M. Ritchie", cover: "https://covers.openlibrary.org/b/olid/OL10080015M-L.jpg?default=false", source: "https://openlibrary.org/books/OL10080015M/C_Programming_Language" },
        { title: "Eloquent JavaScript", author: "Marijn Haverbeke", cover: "https://covers.openlibrary.org/b/olid/OL26832992M-L.jpg?default=false", source: "https://openlibrary.org/books/OL26832992M/Eloquent_JavaScript" },
        { title: "JavaScript: The Good Parts", author: "Douglas Crockford", cover: "https://covers.openlibrary.org/b/olid/OL10781042M-L.jpg?default=false", source: "https://openlibrary.org/books/OL10781042M/JavaScript_The_Good_Parts" },
        { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", cover: "https://covers.openlibrary.org/b/olid/OL59752338M-L.jpg?default=false", source: "https://openlibrary.org/books/OL59752338M/Designing_Data-Intensive_Applications" },
        { title: "Effective Java", author: "Joshua Bloch", cover: "https://covers.openlibrary.org/b/olid/OL31838212M-L.jpg?default=false", source: "https://openlibrary.org/books/OL31838212M/Effective_Java" },
        { title: "Fluent Python", author: "Luciano Ramalho", cover: "https://covers.openlibrary.org/b/olid/OL27112900M-L.jpg?default=false", source: "https://openlibrary.org/books/OL27112900M/Fluent_Python" },
        { title: "Learning Python", author: "Mark Lutz", cover: "https://covers.openlibrary.org/b/olid/OL27149108M-L.jpg?default=false", source: "https://openlibrary.org/books/OL27149108M/Learning_Python" },
        { title: "Head First Java", author: "Kathy Sierra and Bert Bates", cover: "https://covers.openlibrary.org/b/olid/OL34193104M-L.jpg?default=false", source: "https://openlibrary.org/books/OL34193104M/Head_First_Java" },
        { title: "Head First Design Patterns", author: "Eric Freeman and Elisabeth Robson", cover: "https://covers.openlibrary.org/b/olid/OL34022572M-L.jpg?default=false", source: "https://openlibrary.org/books/OL34022572M/Head_First_Design_Patterns" },
        { title: "Python Crash Course", author: "Eric Matthes", cover: "https://covers.openlibrary.org/b/olid/OL34011705M-L.jpg?default=false", source: "https://openlibrary.org/books/OL34011705M/Python_Crash_Course" },
        { title: "Patterns of Enterprise Application Architecture", author: "Martin Fowler", cover: "https://covers.openlibrary.org/b/olid/OL18180195M-L.jpg?default=false", source: "https://openlibrary.org/books/OL18180195M/Patterns_of_enterprise_application_architecture" },
        { title: "The Clean Coder", author: "Robert C. Martin", cover: "https://covers.openlibrary.org/b/olid/OL25108903M-L.jpg?default=false", source: "https://openlibrary.org/books/OL25108903M/The_Clean_Coder" },
        { title: "Clean Architecture", author: "Robert C. Martin", cover: "https://covers.openlibrary.org/b/olid/OL34758280M-L.jpg?default=false", source: "https://openlibrary.org/books/OL34758280M/Clean_Architecture" },
        { title: "You Don't Know JS", author: "Kyle Simpson", cover: "https://covers.openlibrary.org/b/olid/OL36722110M-L.jpg?default=false", source: "https://openlibrary.org/books/OL36722110M/You_Don%27t_Know_Js" },
        { title: "Hands-On Machine Learning", author: "Aurelien Geron", cover: "https://covers.openlibrary.org/b/olid/OL40322335M-L.jpg?default=false", source: "https://openlibrary.org/books/OL40322335M/Hands-On_Machine_Learning_with_Scikit-Learn_Keras_and_TensorFlow" },
        { title: "Grokking Algorithms", author: "Aditya Y. Bhargava", cover: "https://covers.openlibrary.org/b/olid/OL34983324M-L.jpg?default=false", source: "https://openlibrary.org/books/OL34983324M/Grokking_Algorithms" },
        { title: "Deep Learning with Python", author: "Francois Chollet", cover: "https://covers.openlibrary.org/b/olid/OL34161622M-L.jpg?default=false", source: "https://openlibrary.org/books/OL34161622M/Deep_Learning_with_Python_Second_Edition" },
        { title: "The Mythical Man-Month", author: "Frederick P. Brooks Jr.", cover: "https://covers.openlibrary.org/b/olid/OL5044740M-L.jpg?default=false", source: "https://openlibrary.org/books/OL5044740M/The_mythical_man-month" },
        { title: "Computer Systems: A Programmer's Perspective", author: "Randal E. Bryant and David R. O'Hallaron", cover: "https://covers.openlibrary.org/b/olid/OL26835960M-L.jpg?default=false", source: "https://openlibrary.org/books/OL26835960M" },
        { title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell and Peter Norvig", cover: "https://covers.openlibrary.org/b/olid/OL24990984M-L.jpg?default=false", source: "https://openlibrary.org/books/OL24990984M/Artificial_Intelligence_A_Modern_Approach" }
    ];

    const stackBooks = Array.from(document.querySelectorAll('.st-book'));

    function shuffleItems(items) {
        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = reject;
            img.src = url;
        });
    }

    async function applyRandomBookCovers() {
        if (!stackBooks.length) return;

        const selected = [];
        const candidates = shuffleItems(programmingBookCovers);

        for (const candidate of candidates) {
            try {
                await preloadImage(candidate.cover);
                selected.push(candidate);
            } catch (error) {
                // Try the next candidate when a remote cover fails to load.
            }

            if (selected.length === stackBooks.length) break;
        }

        selected.forEach((bookData, index) => {
            const book = stackBooks[index];
            if (!book) return;

            const coverEl = book.querySelector('.st-cover');
            const spineText = book.querySelector('.spine-text');
            const fallbackTitle = book.querySelector('.st-title');
            const fallbackAuthor = book.querySelector('.st-author');

            book.classList.add('has-real-cover');
            book.style.setProperty('--book-image', `url("${bookData.cover}")`);
            book.dataset.bookTitle = bookData.title;
            book.dataset.bookSource = bookData.source;

            if (coverEl) {
                coverEl.setAttribute('aria-label', `${bookData.title} by ${bookData.author}`);
                coverEl.setAttribute('title', `${bookData.title} by ${bookData.author}`);
            }

            if (spineText) {
                spineText.textContent = bookData.title.replace(/:.*$/, '').slice(0, 28);
            }

            if (fallbackTitle) {
                fallbackTitle.innerHTML = bookData.title.replace(': ', '<br>');
            }

            if (fallbackAuthor) {
                fallbackAuthor.textContent = bookData.author;
            }
        });
    }

    applyRandomBookCovers();

    const featuresSub = document.querySelector('#features .section-sub');
    const showcaseSub = document.querySelector('#showcase .section-sub');

    if (featuresSub) {
        featuresSub.textContent = 'Clear logistics, real accountability, and a friendlier way to borrow than random campus groups or chaotic DMs.';
    }

    if (showcaseSub) {
        showcaseSub.textContent = 'Each screen is designed to answer one question quickly: what book is available, who can be trusted, and what happens next.';
    }

    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,
            touchMultiplier: 1.5,
        });

        // Connect to RAF
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Connect to anchor links for smooth scrolling via Lenis
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', function (e) {
                const id = this.getAttribute('href');
                if (id === '#') return;
                const target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    lenis.scrollTo(target, { offset: -70 });
                }
            });
        });
    }

    // ═══════════════════════════════════════════════
    // EFFECT 3: Glassmorphic Lens Cursor
    // ═══════════════════════════════════════════════
    const glow = document.getElementById('cursorGlow');
    const trail = document.getElementById('cursorTrail');
    const cursorMedia = document.getElementById('cursorMedia');
    const heroSection = document.getElementById('hero');

    let mx = 0, my = 0, gx = 0, gy = 0, tx = 0, ty = 0, cmx = 0, cmy = 0;

    if (glow && trail && heroSection && window.innerWidth > 1024) {
        heroSection.addEventListener('mouseenter', () => {
            document.body.classList.add('hero-cursor-active');
        });

        heroSection.addEventListener('mouseleave', () => {
            document.body.classList.remove('hero-cursor-active');
            trail.classList.remove('hovering');
        });

        document.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
        });

        (function animCursor() {
            // Slow-follow glow
            gx += (mx - gx) * 0.05;
            gy += (my - gy) * 0.05;
            // Faster trail (lens)
            tx += (mx - tx) * 0.12;
            ty += (my - ty) * 0.12;
            // Media cursor
            cmx += (mx - cmx) * 0.08;
            cmy += (my - cmy) * 0.08;

            glow.style.left = gx + 'px';
            glow.style.top = gy + 'px';
            trail.style.left = tx + 'px';
            trail.style.top = ty + 'px';

            if (cursorMedia) {
                cursorMedia.style.left = cmx + 'px';
                cursorMedia.style.top = cmy + 'px';
            }

            requestAnimationFrame(animCursor);
        })();

        // Hover expansion on interactive elements
        const hoverables = heroSection.querySelectorAll(
            'a, button, .book-stack-container, .scene-wrapper'
        );
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => trail.classList.add('hovering'));
            el.addEventListener('mouseleave', () => trail.classList.remove('hovering'));
        });
    }

    // ═══════════════════════════════════════════════
    // EFFECT 4: Image Peek Cursor
    // ═══════════════════════════════════════════════
    if (cursorMedia && window.innerWidth > 768) {
        const peekTargets = document.querySelectorAll('[data-cursor-image]');

        peekTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                const imgUrl = el.getAttribute('data-cursor-image');
                if (imgUrl) {
                    cursorMedia.style.backgroundImage = `url(${imgUrl})`;
                    cursorMedia.classList.add('active');
                    // Hide the default trail when media is showing
                    if (trail) trail.style.opacity = '0';
                }
            });

            el.addEventListener('mouseleave', () => {
                cursorMedia.classList.remove('active');
                if (trail) trail.style.opacity = '1';
            });
        });
    }

    // ═══════════════════════════════════════════════
    // EFFECT 2: Scroll-tied Text Scrubbing
    // ═══════════════════════════════════════════════
    const scrubElements = document.querySelectorAll('[data-scrub]');

    scrubElements.forEach(el => {
        // Split text into individually targetable words
        const text = el.textContent.trim();
        const words = text.split(/\s+/);
        el.innerHTML = words.map(w => `<span class="scrub-word">${w}</span>`).join(' ');
    });

    function updateScrub() {
        const viewH = window.innerHeight;
        scrubElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const wordEls = el.querySelectorAll('.scrub-word');
            if (!wordEls.length) return;

            // Element progress: 0 when bottom of viewport aligns with element top,
            // 1 when element center passes viewport center
            const elCenter = rect.top + rect.height / 2;
            const progress = 1 - Math.max(0, Math.min(1, (elCenter - viewH * 0.3) / (viewH * 0.5)));

            // How many words should be lit
            const litCount = Math.floor(progress * wordEls.length);

            wordEls.forEach((word, i) => {
                word.classList.toggle('lit', i < litCount);
            });
        });
    }

    // Hook into Lenis scroll or fallback to native scroll
    if (lenis) {
        lenis.on('scroll', updateScrub);
    } else {
        window.addEventListener('scroll', updateScrub, { passive: true });
    }
    // Initial check
    updateScrub();

    // ═══════════════════════════════════════════════
    // EFFECT 5: Diorama 3D Parallax Cards
    // ═══════════════════════════════════════════════
    if (window.innerWidth > 768) {
        const dioramaCards = document.querySelectorAll('.feat-card-diorama');

        dioramaCards.forEach(card => {
            const layers = card.querySelectorAll('.diorama-layer');

            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                // Card tilt (subtle)
                card.style.transform = `translateY(-4px) perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;

                // Move each layer based on its depth
                layers.forEach(layer => {
                    const depth = parseFloat(layer.dataset.depth) || 0.05;
                    const moveX = x * depth * 800;
                    const moveY = y * depth * 800;
                    layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
                });
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                layers.forEach(layer => {
                    layer.style.transform = 'translate(0, 0)';
                });
            });
        });
    }

    // ═══════════════════════════════════════════════
    // NEW EFFECT: Theme Toggle & Circular Reveal
    // ═══════════════════════════════════════════════
    const themeBtn = document.getElementById('themeToggle');
    const themeReveal = document.getElementById('themeReveal');
    let isLight = false;

    if (themeBtn && themeReveal) {
        themeBtn.addEventListener('click', (e) => {
            const rect = themeBtn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            themeReveal.style.left = x + 'px';
            themeReveal.style.top = y + 'px';
            
            // Calculate max distance to screen corner
            const maxDist = Math.max(
                Math.hypot(x, y),
                Math.hypot(window.innerWidth - x, y),
                Math.hypot(x, window.innerHeight - y),
                Math.hypot(window.innerWidth - x, window.innerHeight - y)
            );
            
            themeReveal.style.width = maxDist * 2 + 'px';
            themeReveal.style.height = maxDist * 2 + 'px';
            themeReveal.style.transform = `translate(-50%, -50%) scale(0)`;
            
            isLight = !isLight;
            themeReveal.style.backgroundColor = isLight ? '#f8faf9' : '#0c120f';
            
            // Force redraw
            themeReveal.offsetHeight;
            
            themeReveal.classList.add('expanding');
            
            setTimeout(() => {
                document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
                document.querySelector('.theme-icon-moon').style.display = isLight ? 'none' : 'block';
                document.querySelector('.theme-icon-sun').style.display = isLight ? 'block' : 'none';
                
                themeReveal.classList.remove('expanding');
            }, 500); // the peak of expansion
        });
    }

    // ═══════════════════════════════════════════════
    // NEW EFFECT: Horizontal Scroll Gallery
    // ═══════════════════════════════════════════════
    const t = document.getElementById('hscrollTrack');
    const s = document.getElementById('hscrollSlides');
    const p = document.getElementById('hscrollBar');

    if (t && s && p) {
        let isDown = false, startX, scrollLeft;

        t.addEventListener('mousedown', (e) => {
            isDown = true;
            t.classList.add('active');
            startX = e.pageX - t.offsetLeft;
            scrollLeft = t.scrollLeft;
        });
        t.addEventListener('mouseleave', () => { isDown = false; t.classList.remove('active'); });
        t.addEventListener('mouseup', () => { isDown = false; t.classList.remove('active'); });
        t.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - t.offsetLeft;
            const walk = (x - startX) * 2;
            t.scrollLeft = scrollLeft - walk;
        });

        const updateProgress = () => {
            const scrollPx = t.scrollLeft;
            const maxScroll = t.scrollWidth - t.clientWidth;
            const progress = (scrollPx / maxScroll) * 100;
            p.style.width = `${progress}%`;
        };
        t.addEventListener('scroll', updateProgress);
        // Bind to wheel for horizontal scrolling
        t.addEventListener('wheel', (e) => {
            e.preventDefault();
            t.scrollLeft += e.deltaY;
        }, { passive: false });
    }

    // ═══════════════════════════════════════════════
    // EXISTING: Navbar Scroll
    // ═══════════════════════════════════════════════
    const navbar = document.getElementById('navbar');
    const handleNavScroll = () => {
        navbar.classList.toggle('scrolled', window.pageYOffset > 50);
    };
    if (lenis) {
        lenis.on('scroll', handleNavScroll);
    } else {
        window.addEventListener('scroll', handleNavScroll);
    }

    // ═══════════════════════════════════════════════
    // EXISTING: Mobile Menu
    // ═══════════════════════════════════════════════
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        mobileMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                mobileBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ═══════════════════════════════════════════════
    // EXISTING: Scroll Reveal
    // ═══════════════════════════════════════════════
    const reveals = document.querySelectorAll('[data-reveal]');
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const parent = entry.target.parentElement;
                const siblings = parent ? parent.querySelectorAll('[data-reveal]') : [];
                let delay = 0;
                siblings.forEach((s, i) => { if (s === entry.target) delay = i * 120; });
                setTimeout(() => entry.target.classList.add('revealed'), delay);
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => revealObs.observe(el));

    // Force hero reveals
    function triggerHeroAnimations() {
        // Standard reveals
        document.querySelectorAll('.hero [data-reveal]').forEach((el, i) => {
            setTimeout(() => el.classList.add('revealed'), i * 150);
        });
        
        // Split-text reveals
        document.querySelectorAll('.split-reveal-group').forEach((group, gi) => {
            // Apply staggered delays
            group.querySelectorAll('.split-inner').forEach((el, i) => {
                el.style.transitionDelay = `${i * 0.04}s`;
            });
            setTimeout(() => {
                group.classList.add('revealed');
            }, gi * 200 + 100);
        });
    }

    // ═══════════════════════════════════════════════
    // NEW: 360 Degree Drag Rotation for Book Stack
    // ═══════════════════════════════════════════════
    const scene = document.getElementById('sceneWrapper');
    const stackBody = document.getElementById('stackBody');
    const stackGlow = document.querySelector('.stack-glow');
    const stackShadow = document.querySelector('.stack-shadow');
    
    if (scene && stackBody) {
        let isDragging = false;
        let startX, startY;
        const defaultRotX = 18;
        const defaultRotY = -24;
        let startRotX = defaultRotX, startRotY = defaultRotY;
        let currentRotX = defaultRotX, currentRotY = defaultRotY;
        let targetRotX = defaultRotX, targetRotY = defaultRotY;

        scene.style.cursor = 'grab';

        function renderStack() {
            if (!isDragging) {
                currentRotX += (targetRotX - currentRotX) * 0.12;
                currentRotY += (targetRotY - currentRotY) * 0.12;
                stackBody.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
            }
            requestAnimationFrame(renderStack);
        }
        requestAnimationFrame(renderStack);

        const startDrag = (x, y) => {
            isDragging = true;
            startX = x; startY = y;
            startRotX = currentRotX; startRotY = currentRotY;
            scene.style.cursor = 'grabbing';
            stackBody.style.transition = 'none';
        };
        
        const onDrag = (x, y) => {
            if (!isDragging) return;
            const dx = x - startX;
            const dy = y - startY;
            currentRotY = startRotY + dx * 0.5;
            currentRotX = startRotX - dy * 0.5;
            targetRotY = currentRotY;
            targetRotX = currentRotX;
            stackBody.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
        };
        
        const stopDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            scene.style.cursor = 'grab';
            stackBody.style.transition = 'transform 0.5s ease-out';
        };

        scene.addEventListener('mousemove', (e) => {
            if (isDragging) return;
            const rect = scene.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;

            targetRotY = defaultRotY + px * 12;
            targetRotX = defaultRotX - py * 10;

            if (stackGlow) {
                stackGlow.style.transform = `translate(${px * 24 - 50}%, ${py * 14 - 50}%) scale(${1 + Math.abs(px) * 0.08})`;
            }

            if (stackShadow) {
                stackShadow.style.transform = `translateX(calc(-50% + ${px * 18}px)) rotateX(88deg) scale(${1 - Math.abs(py) * 0.05})`;
            }
        });

        scene.addEventListener('mouseleave', () => {
            if (!isDragging) {
                targetRotX = defaultRotX;
                targetRotY = defaultRotY;
            }
            if (stackGlow) stackGlow.style.transform = 'translate(-50%, -50%)';
            if (stackShadow) stackShadow.style.transform = 'translateX(-50%) rotateX(88deg)';
        });

        scene.addEventListener('mousedown', e => { e.preventDefault(); startDrag(e.clientX, e.clientY); });
        window.addEventListener('mousemove', e => onDrag(e.clientX, e.clientY));
        window.addEventListener('mouseup', stopDrag);

        scene.addEventListener('touchstart', e => { startDrag(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});
        window.addEventListener('touchmove', e => { onDrag(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});
        window.addEventListener('touchend', stopDrag);
    }

    // ═══════════════════════════════════════════════
    // EXISTING: Particle Canvas
    // ═══════════════════════════════════════════════
    // ═══════════════════════════════════════════════
    // EXISTING: Counter Animation
    // ═══════════════════════════════════════════════
    document.querySelectorAll('[data-count]').forEach(el => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(el.dataset.count);
                    const dur = 2200, start = performance.now();
                    (function tick(now) {
                        const p = Math.min((now - start) / dur, 1);
                        el.textContent = Math.floor((1 - Math.pow(1 - p, 4)) * target).toLocaleString();
                        if (p < 1) requestAnimationFrame(tick);
                        else el.textContent = target.toLocaleString();
                    })(start);
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        obs.observe(el);
    });

    // ═══════════════════════════════════════════════
    // EXISTING: Magnetic CTA Button
    // ═══════════════════════════════════════════════
    const heroCta = document.getElementById('heroCta');
    if (heroCta && window.innerWidth > 768) {
        heroCta.addEventListener('mousemove', e => {
            const r = heroCta.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            heroCta.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px) translateY(-2px)`;
        });
        heroCta.addEventListener('mouseleave', () => { heroCta.style.transform = ''; });
    }

    // ═══════════════════════════════════════════════
    // EXISTING: Badge Text Cycling
    // ═══════════════════════════════════════════════
    const badgeText = document.querySelector('.badge-text');
    if (badgeText) {
        badgeText.textContent = 'Verified campus exchange';
    }

    // ═══════════════════════════════════════════════
    // EXISTING: Status Cards Parallax
    // ═══════════════════════════════════════════════
    if (window.innerWidth > 768) {
        const scene = document.getElementById('sceneWrapper');
        const statusCards = document.querySelectorAll('.status-card');
        if (scene) {
            document.addEventListener('mousemove', e => {
                const rect = scene.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / rect.width;
                const dy = (e.clientY - cy) / rect.height;
                statusCards.forEach((card, i) => {
                    const f = (i + 1) * 5;
                    card.style.transform = `translate(${dx * f}px, ${dy * f}px)`;
                });
            });
        }
    }

    // ═══════════════════════════════════════════════
    // EXISTING: Orbiting Books Click
    // ═══════════════════════════════════════════════
    document.querySelectorAll('.orbit-book').forEach(book => {
        book.addEventListener('click', () => {
            book.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            book.style.transform = 'scale(1.3) rotate(10deg)';
            setTimeout(() => { book.style.transform = ''; }, 600);
        });
    });

});
