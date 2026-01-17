// GSAP Animation Controller for Enterprise Light Theme

export function initAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not found. Animations disabled.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero Section Entrance
    initHeroAnimations();

    // 2. Global Section Headers Reveal
    initSectionHeaders();

    // 3. Staggered Card Reveals (Bento Grid)
    initStaggeredReveals();
}

function initHeroAnimations() {
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl.from(".hero-visual-bg", {
        duration: 1.5,
        opacity: 0,
        x: -50,
        scale: 1.05
    })
        .from(".hero-content h1", {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: -1
        })
        .from(".hero-content p", {
            duration: 1,
            y: 20,
            opacity: 0,
            delay: -0.8
        })
        .from(".hero-actions", {
            duration: 0.8,
            y: 20,
            opacity: 0,
            delay: -0.6
        });
}

function initSectionHeaders() {
    gsap.utils.toArray('.section-head').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    });
}

function initStaggeredReveals() {
    // Reveal .clean-card elements in batches/grids
    ScrollTrigger.batch(".clean-card", {
        onEnter: batch => gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "power2.out",
            overwrite: true
        }),
        start: "top 90%"
    });

    // Also handle simple fade-ins for isolated elements
    gsap.utils.toArray('.fade-in-up').forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 90%"
            },
            y: 30,
            opacity: 0,
            duration: 0.8
        });
    });
}
