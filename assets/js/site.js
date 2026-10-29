/**
 * PowOrg Prototype Interactive Behaviors
 * Spec: claude_website_spec_v2.md (§2.4, §4.3, §4.4, §5.3, §6.4)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Desktop Solutions Menu Toggle
  const solutionsBtn = document.getElementById('solutions-menu-btn');
  const solutionsMenu = document.getElementById('solutions-menu');

  if (solutionsBtn && solutionsMenu) {
    solutionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = solutionsBtn.getAttribute('aria-expanded') === 'true';
      solutionsBtn.setAttribute('aria-expanded', String(!isOpen));
      solutionsMenu.classList.toggle('is-open', !isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!solutionsMenu.contains(e.target) && e.target !== solutionsBtn) {
        solutionsBtn.setAttribute('aria-expanded', 'false');
        solutionsMenu.classList.remove('is-open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && solutionsMenu.classList.contains('is-open')) {
        solutionsBtn.setAttribute('aria-expanded', 'false');
        solutionsMenu.classList.remove('is-open');
        solutionsBtn.focus();
      }
    });
  }

  // 2. Mobile Drawer Toggle
  const drawerToggleBtn = document.getElementById('drawer-toggle-btn');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('is-open');
    if (drawerOverlay) drawerOverlay.classList.add('is-open');
    if (drawerToggleBtn) drawerToggleBtn.setAttribute('aria-expanded', 'true');
    if (drawerCloseBtn) drawerCloseBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    if (drawerOverlay) drawerOverlay.classList.remove('is-open');
    if (drawerToggleBtn) {
      drawerToggleBtn.setAttribute('aria-expanded', 'false');
      drawerToggleBtn.focus();
    }
    document.body.style.overflow = '';
  }

  if (drawerToggleBtn) drawerToggleBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // 3. Contact Form State Controller (For interactive demonstration)
  const contactForm = document.getElementById('contact-form');
  const stateRegular = document.getElementById('state-regular');
  const stateError = document.getElementById('state-error');
  const stateSuccess = document.getElementById('state-success');
  const stateFailed = document.getElementById('state-failed');

  // Check URL param ?state=
  const urlParams = new URLSearchParams(window.location.search);
  const stateParam = urlParams.get('state');

  function setContactState(state) {
    if (!contactForm && !stateSuccess && !stateFailed) return;

    if (state === 'success') {
      if (contactForm) contactForm.style.display = 'none';
      if (stateError) stateError.style.display = 'none';
      if (stateFailed) stateFailed.style.display = 'none';
      if (stateSuccess) stateSuccess.style.display = 'block';
    } else if (state === 'failed') {
      if (contactForm) contactForm.style.display = 'block';
      if (stateSuccess) stateSuccess.style.display = 'none';
      if (stateError) stateError.style.display = 'none';
      if (stateFailed) stateFailed.style.display = 'block';
    } else if (state === 'error') {
      if (contactForm) contactForm.style.display = 'block';
      if (stateSuccess) stateSuccess.style.display = 'none';
      if (stateFailed) stateFailed.style.display = 'none';
      if (stateError) stateError.style.display = 'block';
      // Mark invalid inputs
      const nameInput = document.getElementById('input-name');
      const emailInput = document.getElementById('input-email');
      const orgInput = document.getElementById('input-org');
      if (nameInput) {
        nameInput.classList.add('is-invalid');
        nameInput.setAttribute('aria-invalid', 'true');
      }
      if (emailInput) {
        emailInput.classList.add('is-invalid');
        emailInput.setAttribute('aria-invalid', 'true');
      }
      if (orgInput) {
        orgInput.classList.add('is-invalid');
        orgInput.setAttribute('aria-invalid', 'true');
      }
    } else {
      // Regular state
      if (contactForm) contactForm.style.display = 'block';
      if (stateError) stateError.style.display = 'none';
      if (stateSuccess) stateSuccess.style.display = 'none';
      if (stateFailed) stateFailed.style.display = 'none';
    }
  }

  if (stateParam) {
    setContactState(stateParam);
  }

  // Interactive buttons to switch state
  const stateButtons = document.querySelectorAll('[data-set-state]');
  stateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetState = btn.getAttribute('data-set-state');
      setContactState(targetState);
    });
  });
});
