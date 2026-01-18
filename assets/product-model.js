/* ====== product-model.js | Comportamiento adaptado a Vithalia.store ====== */

if (!customElements.get('product-model')) {
  customElements.define('product-model', class extends HTMLElement {
    constructor() {
      super();
      this.modelViewer = this.querySelector('model-viewer');
      this.loader = this.querySelector('[data-model-loader]');
      this.arButton = this.querySelector('[data-ar-button]');
      this.init();
    }

    init() {
      if (!this.modelViewer) return;

      this.setupModelViewer();
      this.setupAR();
      this.setupLoader();
    }

    setupModelViewer() {
      this.modelViewer.addEventListener('load', () => {
        this.hideLoader();
        this.setupControls();
      });

      this.modelViewer.addEventListener('error', () => {
        this.showError();
      });
    }

    setupControls() {
      const controls = this.querySelector('[data-model-controls]');
      if (!controls) return;

      controls.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.currentTarget.dataset.action;
          if (action === 'zoom-in') this.modelViewer.scale *= 1.1;
          if (action === 'zoom-out') this.modelViewer.scale *= 0.9;
          if (action === 'reset') this.modelViewer.scale = 1;
        });
      });
    }

    setupAR() {
      if (!this.arButton) return;

      this.arButton.addEventListener('click', () => {
        if (this.modelViewer) {
          this.modelViewer.activateAR();
        }
      });
    }

    setupLoader() {
      this.modelViewer.addEventListener('load', () => this.hideLoader());
      this.modelViewer.addEventListener('error', () => this.showError());
    }

    showLoader() {
      this.loader?.classList.remove('hidden');
    }

    hideLoader() {
      this.loader?.classList.add('hidden');
    }

    showError() {
      this.hideLoader();
      const error = this.querySelector('[data-model-error]');
      if (error) error.classList.remove('hidden');
    }
  });
}

// Carga global de modelos 3D para AR
window.ProductModel = {
  async loadShopifyXR() {
    const scripts = [
      'https://cdn.shopify.com/shopifycloud/model-viewer-ui/assets/v1.0/model-viewer-ui.js',
      'https://cdn.shopify.com/shopifycloud/shopify-xr-js/assets/v1.0/shopify-xr.js'
    ];

    for (const src of scripts) {
      if (document.querySelector(`script[src="${src}"]`)) continue;
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    }

    document.addEventListener('shopify_xr_initialized', () => {
      this.setupShopifyXR();
    });
  },

  setupShopifyXR() {
    if (!window.ShopifyXR) return;

    document.querySelectorAll('[data-model-json]').forEach(json => {
      try {
        const data = JSON.parse(json.textContent);
        window.ShopifyXR.addModels(data);
        json.remove();
      } catch (e) {
        console.warn('Invalid model JSON', e);
      }
    });

    window.ShopifyXR.setupXRElements();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.ProductModel?.loadShopifyXR();
});