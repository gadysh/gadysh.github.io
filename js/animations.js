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
    const buttons = document.querySelectorAll("#hero .btn");
    
    // Temporarily disable CSS transitions to prevent conflicts with GSAP animation
    buttons.forEach(btn => btn.style.transition = 'none');

    const heroTl = gsap.timeline({ 
        defaults: { ease: "power3.out" },
        onComplete: () => {
            // Restore original CSS transitions for hover effects
            buttons.forEach(btn => btn.style.transition = '');
        }
    });

    heroTl.from(".hero-glow-orb", {
        duration: 1.5,
        opacity: 0,
        scale: 0.8
    })
        .from(".hero-badge", {
            duration: 1,
            y: 30,
            opacity: 0
        }, "-=1")
        .from("#hero-title", {
            duration: 1,
            y: 30,
            opacity: 0
        }, "-=0.8")
        .from("#hero-subtitle", {
            duration: 1,
            y: 20,
            opacity: 0
        }, "-=0.8")
        .from(buttons, {
            duration: 0.8,
            y: 20,
            opacity: 0,
            stagger: 0.1
        }, "-=0.6");
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
    // Set initial state via JS to support progressive enhancement (no blank cards if JS is disabled)
    gsap.set(".clean-card", { autoAlpha: 0, y: 30 });

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
        start: "top 95%"
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
