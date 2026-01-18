/* ====== product-modal.js | Comportamiento adaptado a Vithalia.store ====== */

if (!customElements.get('product-modal')) {
  customElements.define('product-modal', class extends HTMLElement {
    constructor() {
      super();
      this.isOpen = false;
      this.trigger = null;
      this.content = this.querySelector('[data-modal-content]');
      this.closeBtn = this.querySelector('[data-modal-close]');
      this.backdrop = this.querySelector('[data-modal-backdrop]');

      this.init();
    }

    init() {
      // Escuchar clicks en triggers
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal-trigger]');
        if (!trigger) return;
        e.preventDefault();
        this.show(trigger);
      });

      // Cerrar con botón o backdrop
      this.closeBtn?.addEventListener('click', () => this.hide());
      this.backdrop?.addEventListener('click', () => this.hide());

      // ESC para cerrar
      this.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.hide();
      });
    }

    show(trigger) {
      if (this.isOpen) return;
      this.trigger = trigger;
      this.isOpen = true;

      const mediaId = trigger.dataset.mediaId;
      this.setActiveMedia(mediaId);

      document.body.appendChild(this);
      document.body.classList.add('product-modal-open');
      this.setAttribute('open', '');

      this.setupFocusTrap();
      this.animateIn();
    }

    hide() {
      if (!this.isOpen) return;
      this.isOpen = false;

      this.animateOut(() => {
        this.removeAttribute('open');
        document.body.classList.remove('product-modal-open');
        this.trigger?.focus();
        this.remove();
      });
    }

    setActiveMedia(mediaId) {
      const items = this.querySelectorAll('[data-media-id]');
      items.forEach(item => item.classList.remove('is-active'));

      const activeItem = this.querySelector(`[data-media-id="${mediaId}"]`);
      if (!activeItem) return;

      activeItem.classList.add('is-active');

      // Auto-reproducir video si existe
      const video = activeItem.querySelector('video');
      if (video) video.play();

      // Centrar imagen horizontalmente
      const img = activeItem.querySelector('img');
      if (img) {
        img.onload = () => {
          const container = this.querySelector('[data-modal-content]');
          container.scrollLeft = (img.naturalWidth - container.clientWidth) / 2;
        };
        if (img.complete) img.onload();
      }
    }

    setupFocusTrap() {
      const focusable = Array.from(this.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
      this.firstFocusable = focusable[0];
      this.lastFocusable = focusable[focusable.length - 1];
      this.firstFocusable?.focus();
    }

    handleKeyDown = (e) => {
      if (e.key === 'Escape') this.hide();
      if (e.key === 'Tab') this.handleTabTrap(e);
    };

    handleTabTrap(e) {
      if (e.shiftKey && document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable.focus();
      }
    }

    animateIn() {
      this.style.setProperty('--opacity', 0);
      this.style.setProperty('--scale', 0.95);
      requestAnimationFrame(() => {
        this.style.setProperty('--opacity', 1);
        this.style.setProperty('--scale', 1);
      });
    }

    animateOut(callback) {
      this.style.setProperty('--opacity', 0);
      this.style.setProperty('--scale', 0.95);
      this.addEventListener('transitionend', callback, { once: true });
    }
  });
}