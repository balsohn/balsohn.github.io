/**
 * README Modal Module
 * Controls opening/closing, ESC handling, click outside, and focus trapping
 */

const ReadmeModal = (function () {
  let overlay, modal, openBtn, closeBtn, lastFocused;

  function init() {
    overlay = document.getElementById('readme-modal');
    modal = overlay ? overlay.querySelector('.modal-window') : null;
    openBtn = document.getElementById('open-readme-modal');
    closeBtn = document.getElementById('readme-close');

    if (!overlay || !modal || !openBtn || !closeBtn) return;

    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });

    closeBtn.addEventListener('click', close);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        close();
      }
    });

    // Basic focus trap within modal
    overlay.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  function open() {
    lastFocused = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => modal.focus(), 0);
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  return { init };
})();

