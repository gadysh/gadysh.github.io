/**
 * PowOrg Website v2 — Core Interactive Behaviors
 * Spec: claude_website_spec_v2.md (§2.4, §4.3, §4.4, §5.3, §6.4, §7.2 WP2)
 *
 * ES Module — Dependency-free
 * Accessible disclosure menu, mobile drawer with focus trap,
 * keyboard (Esc/Tab/Space/Enter) and touch support.
 */

export function initSolutionsMenu() {
  const solutionsBtn = document.getElementById('solutions-menu-btn');
  const solutionsMenu = document.getElementById('solutions-menu');

  if (!solutionsBtn || !solutionsMenu) return;

  function closeMenu() {
    if (solutionsBtn.getAttribute('aria-expanded') === 'true') {
      solutionsBtn.setAttribute('aria-expanded', 'false');
      solutionsMenu.classList.remove('is-open');
    }
  }

  function openMenu() {
    solutionsBtn.setAttribute('aria-expanded', 'true');
    solutionsMenu.classList.add('is-open');
  }

  solutionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = solutionsBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (solutionsMenu.classList.contains('is-open')) {
      if (!solutionsMenu.contains(e.target) && e.target !== solutionsBtn) {
        closeMenu();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && solutionsMenu.classList.contains('is-open')) {
      closeMenu();
      solutionsBtn.focus();
    }
  });
}

// The drawer's visibility may still be hidden on the frame it opens, so retry until focus lands
function focusWhenVisible(el, tries = 20) {
  el.focus();
  if (document.activeElement !== el && tries > 0) {
    requestAnimationFrame(() => focusWhenVisible(el, tries - 1));
  }
}

export function initMobileDrawer() {
  const drawerToggleBtn = document.getElementById('drawer-toggle-btn');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');

  if (!mobileDrawer) return;

  function getFocusableElements() {
    return Array.from(mobileDrawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
  }

  function openDrawer() {
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (drawerOverlay) drawerOverlay.classList.add('is-open');
    if (drawerToggleBtn) drawerToggleBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');

    // Focus enters inside the drawer
    const focusable = getFocusableElements();
    const firstTarget = drawerCloseBtn || focusable[0];
    if (firstTarget) focusWhenVisible(firstTarget);
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (drawerOverlay) drawerOverlay.classList.remove('is-open');
    if (drawerToggleBtn) {
      drawerToggleBtn.setAttribute('aria-expanded', 'false');
      drawerToggleBtn.focus();
    }
    document.body.classList.remove('drawer-open');
  }

  if (drawerToggleBtn) {
    drawerToggleBtn.addEventListener('click', openDrawer);
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeDrawer);
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('touchend', (e) => {
      e.preventDefault();
      closeDrawer();
    });
  }

  // Keyboard navigation & focus trap inside mobile drawer
  document.addEventListener('keydown', (e) => {
    if (!mobileDrawer.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeDrawer();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
}

export function initContactFormStates() {
  const contactForm = document.getElementById('contact-form');
  const stateError = document.getElementById('state-error');
  const stateSuccess = document.getElementById('state-success');
  const stateFailed = document.getElementById('state-failed');

  function setContactState(state) {
    if (!contactForm && !stateSuccess && !stateFailed) return;

    if (state === 'success') {
      if (contactForm) contactForm.classList.add('is-hidden');
      if (stateError) stateError.classList.add('is-hidden');
      if (stateFailed) stateFailed.classList.add('is-hidden');
      if (stateSuccess) {
        stateSuccess.classList.remove('is-hidden');
        stateSuccess.focus();
      }
    } else if (state === 'failed') {
      if (contactForm) contactForm.classList.remove('is-hidden');
      if (stateSuccess) stateSuccess.classList.add('is-hidden');
      if (stateError) stateError.classList.add('is-hidden');
      if (stateFailed) {
        stateFailed.classList.remove('is-hidden');
        stateFailed.focus();
      }
    } else if (state === 'error') {
      if (contactForm) contactForm.classList.remove('is-hidden');
      if (stateSuccess) stateSuccess.classList.add('is-hidden');
      if (stateFailed) stateFailed.classList.add('is-hidden');
      if (stateError) {
        stateError.classList.remove('is-hidden');
        stateError.focus();
      }

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const orgInput = document.getElementById('contact-org');
      [nameInput, emailInput, orgInput].forEach(input => {
        if (input && !input.value.trim()) {
          input.classList.add('is-invalid');
          input.setAttribute('aria-invalid', 'true');
        }
      });
    } else {
      // Regular state
      if (contactForm) contactForm.classList.remove('is-hidden');
      if (stateError) stateError.classList.add('is-hidden');
      if (stateSuccess) stateSuccess.classList.add('is-hidden');
      if (stateFailed) stateFailed.classList.add('is-hidden');
    }
  }

  // Check URL param ?state=
  const urlParams = new URLSearchParams(window.location.search);
  const stateParam = urlParams.get('state');
  if (stateParam) {
    setContactState(stateParam);
  }

  // State switcher buttons if present (e.g. for testing / demo)
  const stateButtons = document.querySelectorAll('[data-set-state]');
  stateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetState = btn.getAttribute('data-set-state');
      setContactState(targetState);
    });
  });
}

// Auto-initialize when loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSolutionsMenu();
      initMobileDrawer();
      initContactFormStates();
    });
  } else {
    initSolutionsMenu();
    initMobileDrawer();
    initContactFormStates();
  }
}
