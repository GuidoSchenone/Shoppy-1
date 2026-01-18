// ===========================================================
// Cart Drawer Mini (Vithalia-style)
// Reemplaza cart-notification.js
// Despliega un mini carrito lateral al agregar producto
// ===========================================================

class CartDrawerMini extends HTMLElement {
  constructor() {
    super();

    this.drawer = document.getElementById('cart-drawer-mini');
    this.header = document.querySelector('sticky-header');
    this.onBodyClick = this.handleBodyClick.bind(this);

    this.drawer.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
      closeButton.addEventListener('click', this.close.bind(this))
    );
  }

  open() {
    this.drawer.classList.add('active');
    document.body.classList.add('overflow-hidden');

    this.drawer.addEventListener('transitionend', () => {
      this.drawer.focus();
      trapFocus(this.drawer);
    }, { once: true });

    document.body.addEventListener('click', this.onBodyClick);
  }

  close() {
    this.drawer.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
    document.body.removeEventListener('click', this.onBodyClick);
    removeTrapFocus(this.activeElement);
  }

  renderContents(parsedState) {
    this.cartItemKey = parsedState.key;

    this.getSectionsToRender().forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        element.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
      }
    });

    if (this.header) this.header.reveal();
    this.open();
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer-mini-product',
        selector: `[id="cart-drawer-mini-product-${this.cartItemKey}"]`,
      },
      {
        id: 'cart-drawer-mini-footer',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector(selector)?.innerHTML || '';
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target !== this.drawer && !target.closest('cart-drawer-mini')) {
      const disclosure = target.closest('details-disclosure, header-menu');
      this.activeElement = disclosure ? disclosure.querySelector('summary') : null;
      this.close();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer-mini', CartDrawerMini);