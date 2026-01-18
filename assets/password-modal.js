/* ====== password-modal.js | Comportamiento adaptado a Vithalia.store ====== */

class PasswordModal extends DetailsModal {
  constructor() {
    super();
    this.isOpen = false;
    this.trigger = this.querySelector('summary');
    this.content = this.querySelector('.password-modal__content');
    this.firstFocusable = null;
    this.lastFocusable = null;

    this.init();
  }

  init() {
    // Auto-abrir si hay error
    const invalidInput = this.querySelector('input[aria-invalid="true"]');
    if (invalidInput) {
      this.open({ target: this.querySelector('details') });
      invalidInput.focus();
    }

    // Escuchar click fuera para cerrar
    this.addEventListener('click', (e) => {
      if (e.target === this) this.close();
    });

    // Escuchar ESC para cerrar
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  open(options = {}) {
    super.open?.(options);
    this.isOpen = true;
    this.setupFocusTrap();
    this.animateIn();
  }

  close() {
    super.close?.();
    this.isOpen = false;
    this.animateOut();
  }

  setupFocusTrap() {
    const focusableElements = this.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    this.firstFocusable = focusableElements[0];
    this.lastFocusable = focusableElements[focusableElements.length - 1];

    this.addEventListener('keydown', this.handleTabKey);
    this.firstFocusable?.focus();
  }

  handleTabKey = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable.focus();
      }
    }
  };

  animateIn() {
    this.style.setProperty('--opacity', 0);
    this.style.setProperty('--scale', 0.95);
    this.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    requestAnimationFrame(() => {
      this.style.setProperty('--opacity', 1);
      this.style.setProperty('--scale', 1);
    });
  }

  animateOut() {
    this.style.setProperty('--opacity', 0);
    this.style.setProperty('--scale', 0.95);
    this.addEventListener('transitionend', () => {
      this.style.display = 'none';
    }, { once: true });
  }
}

customElements.define('password-modal', PasswordModal);