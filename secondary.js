// Vithalia-style Product Page JavaScript
// Focused on clean, conversion-optimized product experience

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (entries[0].isIntersecting) {
        observer.unobserve(this);
        fetch(this.dataset.url)
          .then(response => response.text())
          .then(text => {
            const html = document.createElement('div');
            html.innerHTML = text;
            const recommendations = html.querySelector('product-recommendations');
            if (recommendations && recommendations.innerHTML.trim().length) {
              this.innerHTML = recommendations.innerHTML;
            }
            if (!this.querySelector('slideshow-component') && this.classList.contains('complementary-products')) {
              this.remove();
            }
            if (html.querySelector('.grid__item')) {
              this.classList.add('product-recommendations--loaded');
            }
          })
          .catch(e => console.error(e));
      }
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: '0px 0px 400px 0px'
    }).observe(this);
  }
}
customElements.define('product-recommendations', ProductRecommendations);

// Simplified Menu Drawer for Vithalia-style navigation
class MenuDrawer extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => 
      summary.addEventListener('click', this.onSummaryClick.bind(this))
    );
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;
    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;
    
    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary'))
      : this.closeSubmenu(openDetailsElement);
  }

  onFocusOut() {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) {
        this.closeMenuDrawer();
      }
    });
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');

    if (detailsElement === this.mainDetailsToggle) {
      event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => this.mainDetailsToggle.classList.add('menu-opening'));
    summaryElement.setAttribute('aria-expanded', true);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event) {
      this.mainDetailsToggle.classList.remove('menu-opening');
      this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      });
      document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
      this.closeAnimation(this.mainDetailsToggle);
    }
  }

  closeAnimation(detailsElement) {
    let animationStart;
    const handleAnimation = (time) => {
      if (animationStart === undefined) animationStart = time;
      const elapsedTime = time - animationStart;
      
      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    };
    window.requestAnimationFrame(handleAnimation);
  }
}
customElements.define('menu-drawer', MenuDrawer);

// Product Image Gallery (Vithalia-style)
class ProductGallery extends HTMLElement {
  constructor() {
    super();
    this.currentImage = 0;
    this.images = this.querySelectorAll('.product-gallery__image');
    this.thumbnails = this.querySelectorAll('.product-gallery__thumbnail');
    this.navPrev = this.querySelector('.gallery-nav--prev');
    this.navNext = this.querySelector('.gallery-nav--next');
    
    this.initGallery();
  }

  initGallery() {
    this.thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => this.showImage(index));
    });

    if (this.navPrev) {
      this.navPrev.addEventListener('click', () => this.previousImage());
    }
    if (this.navNext) {
      this.navNext.addEventListener('click', () => this.nextImage());
    }

    // Touch/swipe support
    let startX = 0;
    this.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    this.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.nextImage() : this.previousImage();
      }
    });
  }

  showImage(index) {
    this.images.forEach(img => img.classList.remove('active'));
    this.thumbnails.forEach(thumb => thumb.classList.remove('active'));
    
    this.images[index].classList.add('active');
    this.thumbnails[index].classList.add('active');
    this.currentImage = index;
  }

  nextImage() {
    const nextIndex = (this.currentImage + 1) % this.images.length;
    this.showImage(nextIndex);
  }

  previousImage() {
    const prevIndex = (this.currentImage - 1 + this.images.length) % this.images.length;
    this.showImage(prevIndex);
  }
}
customElements.define('product-gallery', ProductGallery);

// FAQ Accordion (Vithalia-style)
class FaqAccordion extends HTMLElement {
  constructor() {
    super();
    this.items = this.querySelectorAll('.faq-item');
    this.initAccordion();
  }

  initAccordion() {
    this.items.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        
        // Close all items
        this.items.forEach(i => i.classList.remove('open'));
        
        // Open clicked item if it wasn't open
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }
}
customElements.define('faq-accordion', FaqAccordion);

// Add to Cart Button with Loading State
class AddToCartButton extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('button');
    this.originalText = this.button.textContent;
    
    this.button.addEventListener('click', this.handleAddToCart.bind(this));
  }

  async handleAddToCart(event) {
    event.preventDefault();
    
    this.button.disabled = true;
    this.button.textContent = 'Añadiendo...';
    this.button.classList.add('loading');

    try {
      // Simulate add to cart (replace with actual Shopify cart API)
      await this.addToCart();
      
      this.button.textContent = '¡Añadido!';
      this.button.classList.remove('loading');
      this.button.classList.add('success');
      
      setTimeout(() => {
        this.button.disabled = false;
        this.button.textContent = this.originalText;
        this.button.classList.remove('success');
      }, 2000);
    } catch (error) {
      this.button.textContent = 'Error';
      this.button.classList.remove('loading');
      this.button.classList.add('error');
      
      setTimeout(() => {
        this.button.disabled = false;
        this.button.textContent = this.originalText;
        this.button.classList.remove('error');
      }, 2000);
    }
  }

  async addToCart() {
    // Replace with actual Shopify cart API call
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}
customElements.define('add-to-cart-button', AddToCartButton);

// Price Display with Discount
class PriceDisplay extends HTMLElement {
  constructor() {
    super();
    this.originalPrice = this.querySelector('.price--original');
    this.salePrice = this.querySelector('.price--sale');
    this.discountBadge = this.querySelector('.discount-badge');
    
    this.updatePriceDisplay();
  }

  updatePriceDisplay() {
    const original = parseFloat(this.dataset.originalPrice);
    const sale = parseFloat(this.dataset.salePrice);
    const discount = Math.round(((original - sale) / original) * 100);
    
    if (this.discountBadge) {
      this.discountBadge.textContent = `-${discount}%`;
    }
  }
}
customElements.define('price-display', PriceDisplay);

// Stock Counter (Vithalia-style)
class StockCounter extends HTMLElement {
  constructor() {
    super();
    this.counter = this.querySelector('.stock-counter__number');
    this.updateCounter();
  }

  updateCounter() {
    const currentStock = parseInt(this.dataset.stock);
    const maxStock = parseInt(this.dataset.maxStock) || 50;
    const displayStock = Math.min(currentStock, maxStock);
    
    this.counter.textContent = displayStock;
    
    if (currentStock <= 10) {
      this.classList.add('low-stock');
    }
  }
}
customElements.define('stock-counter', StockCounter);

// Notification System
class NotificationSystem extends HTMLElement {
  constructor() {
    super();
    this.notifications = [];
  }

  show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <span class="notification__message">${message}</span>
      <button class="notification__close" aria-label="Cerrar">×</button>
    `;
    
    this.appendChild(notification);
    
    // Auto-hide after duration
    const timeout = setTimeout(() => {
      this.hide(notification);
    }, duration);
    
    // Manual close
    notification.querySelector('.notification__close').addEventListener('click', () => {
      clearTimeout(timeout);
      this.hide(notification);
    });
    
    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
  }

  hide(notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    setTimeout(() => {
      notification.remove();
    }, 300);
  }
}
customElements.define('notification-system', NotificationSystem);

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create notification system if it doesn't exist
  if (!document.querySelector('notification-system')) {
    const notifications = document.createElement('notification-system');
    document.body.appendChild(notifications);
  }
});

// Shopify-specific functionality
if (typeof Shopify !== 'undefined') {
  // Handle Shopify section loading
  document.addEventListener('shopify:section:load', (event) => {
    const section = event.target;
    
    // Re-initialize components in loaded section
    section.querySelectorAll('product-gallery, faq-accordion, add-to-cart-button').forEach(element => {
      if (element.disconnectedCallback) {
        element.disconnectedCallback();
      }
      if (element.connectedCallback) {
        element.connectedCallback();
      }
    });
  });
}

// Mobile menu toggle
class MobileMenuToggle extends HTMLElement {
  constructor() {
    super();
    this.toggle = this.querySelector('.mobile-menu-toggle');
    this.menu = this.querySelector('.mobile-menu');
    
    this.toggle.addEventListener('click', () => this.toggleMenu());
  }

  toggleMenu() {
    const isOpen = this.menu.classList.contains('open');
    
    if (isOpen) {
      this.menu.classList.remove('open');
      this.toggle.classList.remove('active');
      document.body.classList.remove('menu-open');
    } else {
      this.menu.classList.add('open');
      this.toggle.classList.add('active');
      document.body.classList.add('menu-open');
    }
  }
}
customElements.define('mobile-menu-toggle', MobileMenuToggle);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.benefit-card, .testimonial, .faq-item').forEach(el => {
  observer.observe(el);
});