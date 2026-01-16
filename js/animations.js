/**
 * מערכת אנימציות עם GSAP
 * תמיכה מלאה ב-prefers-reduced-motion
 */

// בדיקה אם המשתמש מבקש reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// אתחול GSAP עם הגדרות RTL
export function initAnimations() {
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, skipping animations');
        return;
    }

    // כיבוי אנימציות אם המשתמש מבקש reduced motion
    if (prefersReducedMotion) {
        gsap.globalTimeline.timeScale(0);
        console.log('Reduced motion detected - animations disabled');
        return;
    }

    // אתחול ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initScrollAnimations();
    }

    // אנימציית Hero
    initHeroAnimation();
}

// אנימציות גלילה
function initScrollAnimations() {
    // Fade in כללי לכל הסקשנים
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: 'power2.out'
        });
    });

    // אנימציה לכרטיסים
    gsap.utils.toArray('.card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 40,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'power2.out'
        });
    });

    // Sticky section (Process)
    const processSection = document.querySelector('#process');
    if (processSection) {
        ScrollTrigger.create({
            trigger: processSection,
            start: 'top top',
            end: 'bottom center',
            pin: '.process-sticky',
            pinSpacing: false
        });
    }
}

// אנימציית רקע Hero - gradient mesh עדין
function initHeroAnimation() {
    const hero = document.querySelector('#hero');
    if (!hero) return;

    // אנימציית gradient רקע
    const gradientAnimation = gsap.to('.hero-gradient', {
        backgroundPosition: '100% 100%',
        duration: 20,
        ease: 'none',
        repeat: -1,
        yoyo: true
    });

    // אנימציית כותרת
    gsap.from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
    });

    gsap.from('.hero-cta', {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.6,
        ease: 'power3.out'
    });
}

// Smooth scroll לעוגנים (רק אם לא reduced motion)
export function initSmoothScroll() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                if (typeof gsap !== 'undefined') {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: { y: target, offsetY: 80 },
                        ease: 'power2.inOut'
                    });
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// אנימציה לפתיחת modal
export function animateModal(modal, show = true) {
    if (prefersReducedMotion) {
        modal.style.display = show ? 'flex' : 'none';
        return;
    }

    if (show) {
        modal.style.display = 'flex';
        gsap.fromTo(modal,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        gsap.fromTo('.modal-content',
            { scale: 0.9, y: 20 },
            { scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' }
        );
    } else {
        gsap.to(modal, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => modal.style.display = 'none'
        });
    }
}

// Hover effects עדינים
export function initHoverEffects() {
    if (prefersReducedMotion) return;

    // כפתורים
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function () {
            gsap.to(this, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', function () {
            gsap.to(this, { scale: 1, duration: 0.3, ease: 'power2.out' });
        });
    });

    // כרטיסים
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            gsap.to(this, { y: -5, duration: 0.3, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', function () {
            gsap.to(this, { y: 0, duration: 0.3, ease: 'power2.out' });
        });
    });
}
