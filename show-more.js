/**
 * Vithalia-style Show More Button Component
 * Enhanced show/hide functionality with smooth animations and modern UX
 */

class ShowMoreButton extends HTMLElement {
  constructor() {
    super();
    
    this.config = {
      animationDuration: 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      autoFocus: true,
      preserveHeight: true,
      loadMore: false,
      itemSelector: '.show-more-item',
      buttonSelector: 'button',
      hiddenClass: 'hidden',
      loadingClass: 'loading',
      expandedClass: 'expanded'
    };

    this.isExpanded = false;
    this.isAnimating = false;
    this.hiddenItems = [];
    this.button = null;
    this.parentDisplay = null;
    this.parentWrap = null;
    
    this.init();
  }

  init() {
    this.setupConfig();
    this.findElements();
    this.setupEventListeners();
    this.setupAccessibility();
    this.checkInitialState();
  }

  setupConfig() {
    // Override config with data attributes
    Object.keys(this.config).forEach(key => {
      const attrValue = this.dataset[key];
      if (attrValue !== undefined) {
        if (attrValue === 'true' || attrValue === 'false') {
          this.config[key] = attrValue === 'true';
        } else if (!isNaN(attrValue)) {
          this.config[key] = parseInt(attrValue);
        } else {
          this.config[key] = attrValue;
        }
      }
    });
  }

  findElements() {
    this.button = this.querySelector(this.config.buttonSelector);
    this.parentDisplay = this.closest('.parent-display') || this.parentElement;
    this.parentWrap = this.parentDisplay.querySelector('.parent-wrap') || this.parentDisplay;
    
    if (!this.button) {
      console.error('ShowMoreButton: Button element not found');
      return;
    }

    this.findHiddenItems();
  }

  findHiddenItems() {
    this.hiddenItems = Array.from(this.parentDisplay.querySelectorAll(this.config.itemSelector));
    
    // If loadMore is enabled, check for dynamic content
    if (this.config.loadMore) {
      this.checkForDynamicContent();
    }
  }

  checkForDynamicContent() {
    // Check if there's a data-source for loading more items
    const dataSource = this.dataset.source;
    if (dataSource) {
      this.loadMoreEnabled = true;
      this.dataSource = dataSource;
    }
  }

  setupEventListeners() {
    this.button.addEventListener('click', this.handleClick.bind(this));
    
    // Handle keyboard events
    this.button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleClick(e);
      }
    });

    // Handle window resize for height calculations
    window.addEventListener('resize', debounce(() => {
      if (this.isExpanded) {
        this.updateMaxHeight();
      }
    }, 250));
  }

  setupAccessibility() {
    // Setup ARIA attributes
    this.setAttribute('role', 'button');
    this.setAttribute('aria-expanded', 'false');
    this.setAttribute('aria-controls', this.parentDisplay.id || this.generateId());
    
    // Setup button accessibility
    this.button.setAttribute('aria-expanded', 'false');
    this.button.setAttribute('aria-controls', this.parentDisplay.id || this.generateId());
    
    // Add loading state
    this.button.setAttribute('aria-busy', 'false');
  }

  generateId() {
    const id = `show-more-${Math.random().toString(36).substr(2, 9)}`;
    this.parentDisplay.id = id;
    return id;
  }

  checkInitialState() {
    // Check if any items are initially hidden
    const hasHiddenItems = this.hiddenItems.some(item => item.classList.contains(this.config.hiddenClass));
    
    if (!hasHiddenItems && !this.config.loadMore) {
      this.style.display = 'none';
      return;
    }

    // Setup initial button text
    this.updateButtonText();
  }

  async handleClick(event) {
    event.preventDefault();
    
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.button.setAttribute('aria-busy', 'true');
    this.button.classList.add(this.config.loadingClass);

    try {
      if (this.config.loadMore && this.loadMoreEnabled && !this.isExpanded) {
        await this.loadMoreItems();
      } else {
        await this.toggleShowMore();
      }
    } catch (error) {
      console.error('ShowMoreButton: Error during expansion', error);
    } finally {
      this.isAnimating = false;
      this.button.setAttribute('aria-busy', 'false');
      this.button.classList.remove(this.config.loadingClass);
    }
  }

  async toggleShowMore() {
    if (this.isExpanded) {
      await this.collapse();
    } else {
      await this.expand();
    }
  }

  async expand() {
    this.isExpanded = true;
    this.classList.add(this.config.expandedClass);
    this.setAttribute('aria-expanded', 'true');
    this.button.setAttribute('aria-expanded', 'true');

    // Show hidden items with animation
    await this.animateItems('show');
    
    // Update button text
    this.updateButtonText();
    
    // Focus management
    if (this.config.autoFocus) {
      this.focusFirstItem();
    }

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('showmore:expanded', {
      detail: { items: this.hiddenItems }
    }));
  }

  async collapse() {
    this.isExpanded = false;
    this.classList.remove(this.config.expandedClass);
    this.setAttribute('aria-expanded', 'false');
    this.button.setAttribute('aria-expanded', 'false');

    // Hide items with animation
    await this.animateItems('hide');
    
    // Update button text
    this.updateButtonText();

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('showmore:collapsed', {
      detail: { items: this.hiddenItems }
    }));
  }

  async animateItems(action) {
    const items = this.hiddenItems.filter(item => 
      action === 'show' ? item.classList.contains(this.config.hiddenClass) : !item.classList.contains(this.config.hiddenClass)
    );

    if (items.length === 0) return;

    // Set up animation
    if (action === 'show') {
      await this.animateShow(items);
    } else {
      await this.animateHide(items);
    }
  }

  async animateShow(items) {
    // Remove hidden class to make items visible for measurement
    items.forEach(item => {
      item.classList.remove(this.config.hiddenClass);
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
    });

    // Animate each item with stagger
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          item.style.transition = `opacity ${this.config.animationDuration}ms ${this.config.easing}, transform ${this.config.animationDuration}ms ${this.config.easing}`;
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
          
          setTimeout(resolve, this.config.animationDuration / items.length);
        });
      });
    }

    // Clean up
    setTimeout(() => {
      items.forEach(item => {
        item.style.opacity = '';
        item.style.transform = '';
        item.style.transition = '';
      });
    }, this.config.animationDuration);
  }

  async animateHide(items) {
    // Animate each item with stagger (reverse order)
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          item.style.transition = `opacity ${this.config.animationDuration}ms ${this.config.easing}, transform ${this.config.animationDuration}ms ${this.config.easing}`;
          item.style.opacity = '0';
          item.style.transform = 'translateY(-20px)';
          
          setTimeout(() => {
            item.classList.add(this.config.hiddenClass);
            resolve();
          }, this.config.animationDuration / items.length);
        });
      });
    }

    // Clean up
    setTimeout(() => {
      items.forEach(item => {
        item.style.opacity = '';
        item.style.transform = '';
        item.style.transition = '';
      });
    }, this.config.animationDuration);
  }

  async loadMoreItems() {
    if (!this.dataSource) return;

    // Show loading state
    this.button.textContent = 'Cargando...';
    
    try {
      // Simulate API call (replace with actual data fetching)
      const newItems = await this.fetchMoreItems();
      
      if (newItems.length > 0) {
        this.addNewItems(newItems);
        await this.expand();
      } else {
        this.showMessage('No hay más elementos para mostrar');
        this.updateButtonText();
      }
    } catch (error) {
      console.error('Error loading more items:', error);
      this.showMessage('Error al cargar más elementos');
    }
  }

  async fetchMoreItems() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data (replace with actual API call)
    return [
      { id: 'item-4', title: 'Nuevo elemento 4' },
      { id: 'item-5', title: 'Nuevo elemento 5' },
      { id: 'item-6', title: 'Nuevo elemento 6' }
    ];
  }

  addNewItems(items) {
    const fragment = document.createDocumentFragment();
    
    items.forEach(itemData => {
      const item = document.createElement('div');
      item.className = this.config.itemSelector.replace('.', '');
      item.id = itemData.id;
      item.innerHTML = `
        <h3>${itemData.title}</h3>
        <p>Descripción del nuevo elemento...</p>
      `;
      fragment.appendChild(item);
    });
    
    this.parentWrap.appendChild(fragment);
    
    // Update hidden items list
    this.hiddenItems = Array.from(this.parentDisplay.querySelectorAll(this.config.itemSelector));
  }

  updateButtonText() {
    const labelElements = this.querySelectorAll('.label-text');
    const isExpanded = this.isExpanded;
    const hasMore = this.config.loadMore && this.loadMoreEnabled;
    
    labelElements.forEach(element => {
      if (element.classList.contains('show-more')) {
        element.style.display = isExpanded || hasMore ? 'none' : 'inline';
      } else if (element.classList.contains('show-less')) {
        element.style.display = isExpanded && !hasMore ? 'inline' : 'none';
      } else if (element.classList.contains('load-more')) {
        element.style.display = !isExpanded && hasMore ? 'inline' : 'none';
      }
    });
  }

  focusFirstItem() {
    const firstVisibleItem = this.hiddenItems.find(item => 
      !item.classList.contains(this.config.hiddenClass)
    );
    
    if (firstVisibleItem) {
      const focusableElement = firstVisibleItem.querySelector('input, button, a, [tabindex]');
      if (focusableElement) {
        focusableElement.focus();
      } else {
        firstVisibleItem.focus();
      }
    }
  }

  updateMaxHeight() {
    if (this.isExpanded && this.config.preserveHeight) {
      const visibleItems = this.hiddenItems.filter(item => 
        !item.classList.contains(this.config.hiddenClass)
      );
      
      if (visibleItems.length > 0) {
        const totalHeight = visibleItems.reduce((sum, item) => sum + item.offsetHeight, 0);
        this.parentWrap.style.maxHeight = `${totalHeight + 100}px`;
      }
    }
  }

  showMessage(message) {
    // Create and show a temporary message
    const messageEl = document.createElement('div');
    messageEl.className = 'show-more-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: absolute;
      top: -2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(var(--color-foreground), 0.9);
      color: rgb(var(--color-background));
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.9rem;
      white-space: nowrap;
      z-index: 10;
    `;
    
    this.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }

  // Public API methods
  expand() {
    if (!this.isExpanded) {
      this.handleClick(new Event('expand'));
    }
  }

  collapse() {
    if (this.isExpanded) {
      this.handleClick(new Event('collapse'));
    }
  }

  toggle() {
    this.handleClick(new Event('toggle'));
  }

  getState() {
    return {
      isExpanded: this.isExpanded,
      itemCount: this.hiddenItems.length,
      visibleCount: this.hiddenItems.filter(item => 
        !item.classList.contains(this.config.hiddenClass)
      ).length
    };
  }
}

// Utility function for debouncing
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

// Add CSS for enhanced animations
const showMoreStyles = document.createElement('style');
showMoreStyles.textContent = `
  show-more-button {
    display: block;
    position: relative;
    margin: 2rem 0;
  }

  show-more-button .label-text {
    transition: opacity 0.3s ease;
  }

  show-more-button button {
    padding: 1rem 2rem;
    font-size: 1.6rem;
    font-weight: 600;
    background: rgb(var(--accent-color, 59, 130, 246));
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  show-more-button button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--accent-color, 59, 130, 246), 0.3);
  }

  show-more-button button:active {
    transform: translateY(0);
  }

  show-more-button button:focus {
    outline: 2px solid rgb(var(--accent-color, 59, 130, 246));
    outline-offset: 2px;
  }

  show-more-button button[aria-busy="true"] {
    position: relative;
    color: transparent;
  }

  show-more-button button[aria-busy="true"]::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid white;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  show-more-button button .icon {
    transition: transform 0.3s ease;
  }

  show-more-button.expanded button .icon {
    transform: rotate(180deg);
  }

  .show-more-item {
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .show-more-item.hidden {
    opacity: 0;
    transform: translateY(-20px);
    pointer-events: none;
  }

  @keyframes spin {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    show-more-button button,
    .show-more-item,
    show-more-button button .icon {
      transition: none;
    }
    
    show-more-button button[aria-busy="true"]::after {
      animation: none;
    }
  }
`;

document.head.appendChild(showMoreStyles);

// Auto-initialize show-more buttons
document.addEventListener('DOMContentLoaded', () => {
  const showMoreButtons = document.querySelectorAll('show-more-button:not([data-initialized])');
  showMoreButtons.forEach(button => {
    button.setAttribute('data-initialized', 'true');
  });
});

// Handle dynamic content (Shopify sections)
document.addEventListener('shopify:section:load', (event) => {
  const showMoreButtons = event.target.querySelectorAll('show-more-button:not([data-initialized])');
  showMoreButtons.forEach(button => {
    button.setAttribute('data-initialized', 'true');
  });
});

// Accessibility strings
if (!window.accessibilityStrings) {
  window.accessibilityStrings = {};
}

// Add Spanish translations
Object.assign(window.accessibilityStrings, {
  showMore: 'Mostrar más',
  showLess: 'Mostrar menos',
  loadMore: 'Cargar más',
  loading: 'Cargando...',
  noMoreItems: 'No hay más elementos para mostrar',
  shareSuccess: '¡Enlace copiado exitosamente!'
});