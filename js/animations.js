/**
 * מערכת אנימציות - גרסה עדינה ומקצועית
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

    // כיבוי מלא של אנימציות אם המשתמש מבקש reduced motion
    if (prefersReducedMotion) {
        console.log('Reduced motion detected - all animations disabled');
        return;
    }

    // אתחול ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initScrollAnimations();
    }
}

// אנימציות גלילה - עדינות בלבד
function initScrollAnimations() {
    // אנימציה עדינה לסקשנים
    gsap.utils.toArray('section').forEach((section, index) => {
        // דלג על hero - הוא לא צריך אנימציה
        if (section.id === 'hero') return;

        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none', // רק פעם אחת
            },
            opacity: 0,
            y: 12, // תזוזה קטנה מאוד
            duration: 0.6,
            ease: 'power2.out'
        });
    });

    // אנימציה לכרטיסים - עדינה מאוד
    gsap.utils.toArray('.card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 8,
            duration: 0.5,
            delay: index * 0.05, // stagger קל
            ease: 'power2.out'
        });
    });
}

// Smooth scroll לעוגנים (רק אם לא reduced motion)
export function initSmoothScroll() {
    if (prefersReducedMotion) {
        // אפילו ללא GSAP, smooth scroll native מכובה ב-CSS
        return;
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
                    gsap.registerPlugin(ScrollToPlugin);
                    gsap.to(window, {
                        duration: 0.8,
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

// אנימציה לפתיחת modal - עדינה מאוד
export function animateModal(modal, show = true) {
    if (prefersReducedMotion) {
        modal.style.display = show ? 'flex' : 'none';
        return;
    }

    if (typeof gsap === 'undefined') {
        modal.style.display = show ? 'flex' : 'none';
        return;
    }

    if (show) {
        modal.style.display = 'flex';
        gsap.fromTo(modal,
            { opacity: 0 },
            { opacity: 1, duration: 0.25, ease: 'power2.out' }
        );
        gsap.fromTo('.modal-content',
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
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

// Hover effects עדינים (CSS handles most, this is backup)
export function initHoverEffects() {
    // רוב ה-hover effects מטופלים ב-CSS
    // זה רק בשביל edge cases אם צריך
}
