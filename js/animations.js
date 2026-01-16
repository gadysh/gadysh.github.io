/**
 * מערכת אנימציות Vibrant Glass
 * כולל Parallax, Staggered Reveal, ואינטראקציות עכבר
 */

// בדיקה אם המשתמש מבקש reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initAnimations() {
    if (typeof gsap === 'undefined') return;
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    initHeroParallax();
    initStaggeredReveals();
    initGlassHoverEffects();
}

/**
 * Hero Section Parallax
 * תזוזה עדינה של הרקע והאלמנטים הוויזואליים בגלילה
 */
function initHeroParallax() {
    // רקע זז לאט
    gsap.to('.hero-bg-img', {
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        },
        y: 100,
        scale: 1.1,
        ease: 'none'
    });

    // טקסט זז קצת יותר מהר (אפקט עומק)
    gsap.to('.hero-content', {
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        },
        y: 50,
        opacity: 0.5,
        ease: 'none'
    });
}

/**
 * חשיפה מדורגת של אלמנטים (Staggered Reveal)
 */
function initStaggeredReveals() {
    // כותרות סקשנים - Fade Up + Scale
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            scale: 0.9,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });
    });

    // כרטיסי Bento Grid - Stagger
    ScrollTrigger.batch('.clean-card', {
        start: 'top 85%',
        onEnter: batch => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        },
        onLeaveBack: batch => {
            gsap.to(batch, {
                opacity: 0,
                y: 30,
                overwrite: true
            });
        }
    });

    // הגדרה התחלתית
    gsap.set('.clean-card', { opacity: 0, y: 30 });
}

/**
 * Clean Logic for Hover (CSS handles most, JS for subtle polish if needed)
 */
function initGlassHoverEffects() {
    // Removed heavy glass mouse tracking for cleaner enterprise feel
    // CSS :hover is sufficient for this style
}

// Smooth Scroll (אופציונלי - אם רוצים תחושה חלקה מלאה)
export function initSmoothScroll() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: target, offsetY: 80 },
                    ease: 'power3.inOut'
                });
            }
        });
    });
}

export function animateModal(modal, show = true) {
    if (!modal) return;

    if (show) {
        modal.style.display = 'flex';
        gsap.fromTo(modal,
            { opacity: 0, backdropFilter: 'blur(0px)' },
            { opacity: 1, backdropFilter: 'blur(20px)', duration: 0.4 }
        );
        gsap.fromTo(modal.querySelector('.modal-content'),
            { opacity: 0, scale: 0.8, y: 50 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.2)' }
        );
    } else {
        gsap.to(modal, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => modal.style.display = 'none'
        });
    }
}

// Placeholder functions for compatibility
export function initHoverEffects() { }
