document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation & Routing
    const navLinks = document.querySelectorAll('.nav-links a, .footer-links a, a.logo');
    const sections = document.querySelectorAll('.section');
    const hamburger = document.querySelector('.hamburger');
    const navLinksContainer = document.querySelector('.nav-links');

    function navigateToSection(targetId) {
        // Remove active class from all links and sections
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${targetId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
                window.scrollTo(0, 0);
            } else {
                section.classList.remove('active');
            }
        });

        // Close mobile menu if open
        navLinksContainer.classList.remove('active');
    }

    // Nav link click events
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            navigateToSection(targetId);
            history.pushState(null, null, `#${targetId}`);
        });
    });

    // Handle initial routing based on URL hash
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        navigateToSection(initialHash);
    } else {
        navigateToSection('home');
    }

    // Sticky Header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
        });
    }

    // 2. Countdown Timer (Bulletproof Local Time Parsing)
    // Event date: July 21st, 2026 09:00:00 AM local time
    // Constructor parameters: Year, Month Index (6 = July), Day, Hour, Min, Sec
    const targetDate = new Date(2026, 6, 21, 9, 0, 0).getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        const dVal = document.getElementById('days-val');
        const hVal = document.getElementById('hours-val');
        const mVal = document.getElementById('minutes-val');
        const sVal = document.getElementById('seconds-val');

        // Safe check to verify all elements exist in DOM before setting values
        if (!dVal || !hVal || !mVal || !sVal) return;

        if (isNaN(difference) || difference < 0) {
            dVal.textContent = '00';
            hVal.textContent = '00';
            mVal.textContent = '00';
            sVal.textContent = '00';
            const countdownTitle = document.querySelector('.hero-sub');
            if (countdownTitle) countdownTitle.textContent = "/// SYSTEM LIVE: INFINITUS HAS BEGUN ///";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        dVal.textContent = String(days).padStart(2, '0');
        hVal.textContent = String(hours).padStart(2, '0');
        mVal.textContent = String(minutes).padStart(2, '0');
        sVal.textContent = String(seconds).padStart(2, '0');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call

    // 3. Stats Counter Animation (IntersectionObserver + requestAnimationFrame EaseOut)
    let statsAnimated = false;
    function startStatsAnimation() {
        if (statsAnimated) return;
        statsAnimated = true; // Set instantly to avoid multiple triggers
        
        const stats = [
            { id: 'stat-participants', target: 350, suffix: '+' },
            { id: 'stat-schools', target: 40, suffix: '+' },
            { id: 'stat-events', target: 6, suffix: '' }
        ];

        stats.forEach(stat => {
            const el = document.getElementById(stat.id);
            if (!el) return;
            
            const target = stat.target;
            const duration = 2000; // Animation duration of 2 seconds
            const startTime = performance.now();

            function animate(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out quad formula for super smooth deceleration
                const easeProgress = progress * (2 - progress);
                
                const current = Math.floor(easeProgress * target);
                el.textContent = current + stat.suffix;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.textContent = target + stat.suffix;
                }
            }

            requestAnimationFrame(animate);
        });
    }

    // Trigger stats animation only when stats layout enters viewport
    const statsLayout = document.querySelector('.stats-layout');
    if (statsLayout) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startStatsAnimation();
                    observer.unobserve(entry.target); // Stop observing once triggered
                }
            });
        }, { threshold: 0.1 });
        observer.observe(statsLayout);
    }


    // 5. Events Filtration & Search
    const searchInput = document.getElementById('event-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventCards = document.querySelectorAll('.event-card');

    function filterEvents() {
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');

        eventCards.forEach(card => {
            const eventName = card.querySelector('.event-name').textContent.toLowerCase();
            const eventDesc = card.querySelector('.event-description').textContent.toLowerCase();
            const matchesSearch = eventName.includes(query) || eventDesc.includes(query);
            
            const eventMode = card.getAttribute('data-mode'); // 'online' or 'offline'
            const eventEligibility = card.getAttribute('data-eligibility'); // 'middle' or 'high'

            let matchesFilter = false;
            if (activeFilter === 'all') {
                matchesFilter = true;
            } else if (activeFilter === 'online' && eventMode === 'online') {
                matchesFilter = true;
            } else if (activeFilter === 'offline' && eventMode === 'offline') {
                matchesFilter = true;
            } else if (activeFilter === 'middle' && eventEligibility === 'middle') {
                matchesFilter = true;
            } else if (activeFilter === 'high' && eventEligibility === 'high') {
                matchesFilter = true;
            }

            if (matchesSearch && matchesFilter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterEvents);
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterEvents();
        });
    });

});
