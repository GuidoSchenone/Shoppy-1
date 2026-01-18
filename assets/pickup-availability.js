/* ====== pickup-availability.js | Comportamiento adaptado a Vithilia.store ====== */

if (!customElements.get('pickup-availability')) {
  customElements.define('pickup-availability', class extends HTMLElement {
    constructor() {
      super();
      if (!this.hasAttribute('available')) return;

      this.errorTemplate = this.querySelector('template')?.content.cloneNode(true);
      this.onRefresh = this.fetchAvailability.bind(this);
      this.fetchAvailability(this.dataset.variantId);
    }

    async fetchAvailability(variantId) {
      const rootUrl = (this.dataset.rootUrl || '').replace(/\/$/, '');
      const url = `${rootUrl}/variants/${variantId}/?section_id=pickup-availability`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network error');
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        this.renderPreview(doc);
      } catch (err) {
        this.renderError();
      }
    }

    renderPreview(doc) {
      const preview = doc.querySelector('[data-pickup-preview]');
      const drawer = doc.querySelector('[data-pickup-drawer]');

      if (!preview) {
        this.innerHTML = '';
        this.removeAttribute('available');
        return;
      }

      this.innerHTML = preview.outerHTML;
      this.setAttribute('available', '');

      if (drawer) {
        document.body.appendChild(drawer);
        const btn = this.querySelector('[data-pickup-open]');
        btn?.addEventListener('click', () => {
          document.querySelector('pickup-availability-drawer')?.show(btn);
        });
      }
    }

    renderError() {
      this.innerHTML = '';
      if (this.errorTemplate) this.appendChild(this.errorTemplate);
      this.querySelector('[data-pickup-retry]')?.addEventListener('click', this.onRefresh);
    }
  });
}

if (!customElements.get('pickup-availability-drawer')) {
  customElements.define('pickup-availability-drawer', class extends HTMLElement {
    constructor() {
      super();
      this.focusElement = null;
      this.onBackdropClick = this.handleBackdropClick.bind(this);
      this.onKeyDown = this.handleKeyDown.bind(this);
    }

    connectedCallback() {
      this.innerHTML = `
        <div class="pickup-drawer__backdrop" data-pickup-backdrop></div>
        <div class="pickup-drawer__content" data-pickup-content>
          <button class="pickup-drawer__close" data-pickup-close aria-label="Cerrar">
            <svg width="20" height="20" fill="currentColor"><use href="#icon-close"/></svg>
          </button>
          <div class="pickup-drawer__body">${this.innerHTML}</div>
        </div>
      `;

      this.backdrop = this.querySelector('[data-pickup-backdrop]');
      this.content = this.querySelector('[data-pickup-content]');
      this.closeBtn = this.querySelector('[data-pickup-close]');

      this.closeBtn.addEventListener('click', () => this.hide());
      this.backdrop.addEventListener('click', this.onBackdropClick);
    }

    show(focusElement) {
      this.focusElement = focusElement;
      document.body.appendChild(this);
      document.body.classList.add('pickup-drawer-open');
      this.setAttribute('open', '');
      this.setupFocusTrap();
      this.animateIn();
      this.addEventListener('keydown', this.onKeyDown);
    }

    hide() {
      this.animateOut(() => {
        this.removeAttribute('open');
        document.body.classList.remove('pickup-drawer-open');
        this.removeEventListener('keydown', this.onKeyDown);
        this.focusElement?.focus();
        this.remove();
      });
    }

    setupFocusTrap() {
      const focusable = Array.from(this.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
      this.firstFocusable = focusable[0];
      this.lastFocusable = focusable[focusable.length - 1];
      this.firstFocusable?.focus();
    }

    handleKeyDown(e) {
      if (e.key === 'Escape') this.hide();
      if (e.key === 'Tab') this.handleTabTrap(e);
    }

    handleTabTrap(e) {
      if (e.shiftKey && document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable.focus();
      }
    }

    handleBackdropClick(e) {
      if (e.target === this.backdrop) this.hide();
    }

    animateIn() {
      this.style.setProperty('--opacity', 0);
      this.content.style.setProperty('--translate', '100%');
      requestAnimationFrame(() => {
        this.style.setProperty('--opacity', 1);
        this.content.style.setProperty('--translate', '0');
      });
    }

    animateOut(callback) {
      this.style.setProperty('--opacity', 0);
      this.content.style.setProperty('--translate', '100%');
      this.addEventListener('transitionend', callback, { once: true });
    }
  });
}