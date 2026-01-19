/**
 * theme-editor.js - Enhanced Theme Editor for Premium Themes
 * Shopify OS 2.0 Compatible - Inspired by Vithalia's premium functionality
 * 
 * Handles all theme editor events, section management, and live preview functionality
 */

(function() {
  'use strict';

  // ===== CONSTANTS =====
  const EDITOR_EVENTS = {
    BLOCK_SELECT: 'shopify:block:select',
    BLOCK_DESELECT: 'shopify:block:deselect',
    SECTION_LOAD: 'shopify:section:load',
    SECTION_REORDER: 'shopify:section:reorder',
    SECTION_SELECT: 'shopify:section:select',
    SECTION_DESELECT: 'shopify:section:deselect',
    INSPECTOR_ACTIVATE: 'shopify:inspector:activate',
    INSPECTOR_DEACTIVATE: 'shopify:inspector:deactivate'
  };

  const ANIMATION_DURATION = 300;
  const SCROLL_OFFSET = 100;

  // ===== EDITOR MANAGER =====
  class ThemeEditorManager {
    constructor() {
      this.isEditor = Boolean(window.Shopify && window.Shopify.designMode);
      this.activeModals = new Set();
      this.activeSlideshows = new Map();
      this.zoomScripts = new Map();
      this.observers = new Map();
      
      this.init();
    }

    init() {
      if (!this.isEditor) return;
      
      this.bindEvents();
      this.setupObservers();
      this.initializeExistingSections();
      console.log('🎨 Premium Theme Editor initialized');
    }

    /**
     * Bind all Shopify theme editor events
     */
    bindEvents() {
      // Block events
      document.addEventListener(EDITOR_EVENTS.BLOCK_SELECT, this.handleBlockSelect.bind(this));
      document.addEventListener(EDITOR_EVENTS.BLOCK_DESELECT, this.handleBlockDeselect.bind(this));
      
      // Section events
      document.addEventListener(EDITOR_EVENTS.SECTION_LOAD, this.handleSectionLoad.bind(this));
      document.addEventListener(EDITOR_EVENTS.SECTION_REORDER, this.handleSectionReorder.bind(this));
      document.addEventListener(EDITOR_EVENTS.SECTION_SELECT, this.handleSectionSelect.bind(this));
      document.addEventListener(EDITOR_EVENTS.SECTION_DESELECT, this.handleSectionDeselect.bind(this));
      
      // Inspector events
      document.addEventListener(EDITOR_EVENTS.INSPECTOR_ACTIVATE, this.handleInspectorActivate.bind(this));
      document.addEventListener(EDITOR_EVENTS.INSPECTOR_DEACTIVATE, this.handleInspectorDeactivate.bind(this));
      
      // Additional editor events
      document.addEventListener('shopify:editor:ready', this.handleEditorReady.bind(this));
      document.addEventListener('shopify:section:unload', this.handleSectionUnload.bind(this));
    }

    /**
     * Handle block selection with smooth animations
     */
    handleBlockSelect(event) {
      this.hideAllModals();
      
      const block = event.target;
      const isSlide = block.classList.contains('slideshow__slide');
      const isProductCard = block.classList.contains('product-card');
      const isAccordionItem = block.classList.contains('accordion-item');
      
      if (isSlide) {
        this.handleSlideSelection(block);
      } else if (isProductCard) {
        this.handleProductCardSelection(block);
      } else if (isAccordionItem) {
        this.handleAccordionSelection(block);
      }
      
      // Add visual feedback
      this.addSelectionHighlight(block);
      
      // Scroll to block with offset
      this.scrollToElement(block);
    }

    /**
     * Handle block deselection
     */
    handleBlockDeselect(event) {
      const block = event.target;
      const isSlide = block.classList.contains('slideshow__slide');
      
      if (isSlide) {
        const slideshow = block.closest('slideshow-component');
        if (slideshow && slideshow.autoplayButtonIsSetToPlay) {
          slideshow.play();
        }
      }
      
      // Remove visual feedback
      this.removeSelectionHighlight(block);
    }

    /**
     * Handle section load with enhanced functionality
     */
    handleSectionLoad(event) {
      this.hideAllModals();
      
      const section = event.target;
      const sectionId = section.dataset.sectionId || section.id;
      
      console.log(`📦 Section loaded: ${sectionId}`);
      
      // Reinitialize components
      this.reinitializeZoom(section);
      this.reinitializeSlideshows(section);
      this.reinitializeAccordions(section);
      this.reinitializeModals(section);
      this.reinitializeAnimations(section);
      
      // Setup intersection observer for lazy loading
      this.setupIntersectionObserver(section);
      
      // Add entrance animation
      this.addEntranceAnimation(section);
    }

    /**
     * Handle section reorder
     */
    handleSectionReorder(event) {
      this.hideAllModals();
      this.updateSectionOrder();
    }

    /**
     * Handle section selection
     */
    handleSectionSelect(event) {
      this.hideAllModals();
      const section = event.target;
      
      // Add selection border
      this.addSectionSelection(section);
      
      // Scroll to section
      this.scrollToElement(section, { offset: -50 });
    }

    /**
     * Handle section deselection
     */
    handleSectionDeselect(event) {
      const section = event.target;
      this.removeSectionSelection(section);
    }

    /**
     * Handle inspector activation
     */
    handleInspectorActivate(event) {
      this.hideAllModals();
      document.body.classList.add('inspector-active');
    }

    /**
     * Handle inspector deactivation
     */
    handleInspectorDeactivate(event) {
      document.body.classList.remove('inspector-active');
    }

    /**
     * Handle editor ready event
     */
    handleEditorReady(event) {
      console.log('✨ Theme Editor is ready');
      this.addEditorStyles();
    }

    /**
     * Handle section unload
     */
    handleSectionUnload(event) {
      const section = event.target;
      this.cleanupSection(section);
    }

    // ===== SPECIFIC COMPONENT HANDLERS =====

    /**
     * Handle slide selection in slideshows
     */
    handleSlideSelection(slide) {
      const slideshow = slide.closest('slideshow-component');
      if (!slideshow) return;
      
      slideshow.pause();
      
      // Smooth scroll to slide
      setTimeout(() => {
        slideshow.slider.scrollTo({
          left: slide.offsetLeft,
          behavior: 'smooth'
        });
      }, 200);
      
      // Add slide indicator
      this.updateSlideIndicator(slideshow, slide);
    }

    /**
     * Handle product card selection
     */
    handleProductCardSelection(card) {
      // Add subtle animation
      card.style.transform = 'scale(1.02)';
      card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
      card.style.transition = 'all 0.3s ease';
      
      // Show quick actions if available
      const quickActions = card.querySelector('.product-card__quick-actions');
      if (quickActions) {
        quickActions.style.opacity = '1';
        quickActions.style.transform = 'translateY(0)';
      }
    }

    /**
     * Handle accordion item selection
     */
    handleAccordionSelection(item) {
      const content = item.querySelector('.accordion-content');
      if (content) {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
      }
    }

    /**
     * Handle product modal hiding with animation
     */
    hideAllModals() {
      const modals = document.querySelectorAll('product-modal[open], .modal--active, [data-modal-open]');
      
      modals.forEach(modal => {
        if (modal.hide) {
          modal.hide();
        } else {
          modal.classList.remove('modal--active');
          modal.removeAttribute('data-modal-open');
        }
      });
      
      // Remove modal backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.style.opacity = '0';
        setTimeout(() => backdrop.remove(), 300);
      }
    }

    // ===== INITIALIZATION METHODS =====

    /**
     * Initialize existing sections on page load
     */
    initializeExistingSections() {
      const sections = document.querySelectorAll('[data-section-id], [id^="shopify-section"]');
      
      sections.forEach(section => {
        this.setupIntersectionObserver(section);
        this.addEntranceAnimation(section);
      });
    }

    /**
     * Reinitialize zoom functionality
     */
    reinitializeZoom(section) {
      const zoomScript = section.querySelector('[id^="EnableZoomOnHover"]');
      if (!zoomScript) return;
      
      // Create new script tag to reinitialize zoom
      const newScript = document.createElement('script');
      newScript.src = zoomScript.src;
      newScript.id = zoomScript.id + '-reloaded';
      
      zoomScript.parentNode.replaceChild(newScript, zoomScript);
    }

    /**
     * Reinitialize slideshows
     */
    reinitializeSlideshows(section) {
      const slideshows = section.querySelectorAll('slideshow-component');
      
      slideshows.forEach(slideshow => {
        if (slideshow.reinitialize) {
          slideshow.reinitialize();
        }
      });
    }

    /**
     * Reinitialize accordions
     */
    reinitializeAccordions(section) {
      const accordions = section.querySelectorAll('.accordion, details-accordion');
      
      accordions.forEach(accordion => {
        const items = accordion.querySelectorAll('.accordion-item');
        items.forEach(item => {
          if (item.reset) item.reset();
        });
      });
    }

    /**
     * Reinitialize modals
     */
    reinitializeModals(section) {
      const modals = section.querySelectorAll('[data-modal], product-modal');
      
      modals.forEach(modal => {
        if (modal.setup) modal.setup();
      });
    }

    /**
     * Reinitialize animations
     */
    reinitializeAnimations(section) {
      const animatedElements = section.querySelectorAll('[data-animate]');
      
      animatedElements.forEach(element => {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = null;
      });
    }

    // ===== UTILITY METHODS =====

    /**
     * Add selection highlight to elements
     */
    addSelectionHighlight(element) {
      element.classList.add('editor-selected');
      element.style.outline = '2px solid #006aff';
      element.style.outlineOffset = '2px';
      element.style.transition = 'outline 0.2s ease';
    }

    /**
     * Remove selection highlight
     */
    removeSelectionHighlight(element) {
      element.classList.remove('editor-selected');
      element.style.outline = '';
      element.style.outlineOffset = '';
    }

    /**
     * Add section selection styling
     */
    addSectionSelection(section) {
      section.classList.add('section-selected');
      section.style.position = 'relative';
      
      // Add selection indicator
      const indicator = document.createElement('div');
      indicator.className = 'section-selection-indicator';
      indicator.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 3px solid #006aff;
        border-radius: 8px;
        pointer-events: none;
        z-index: 999;
        animation: pulse 2s infinite;
      `;
      
      section.appendChild(indicator);
    }

    /**
     * Remove section selection
     */
    removeSectionSelection(section) {
      section.classList.remove('section-selected');
      const indicator = section.querySelector('.section-selection-indicator');
      if (indicator) indicator.remove();
    }

    /**
     * Scroll to element with smooth animation
     */
    scrollToElement(element, options = {}) {
      const offset = options.offset || -SCROLL_OFFSET;
      const behavior = options.behavior || 'smooth';
      
      const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
      const scrollPosition = elementTop + offset;
      
      window.scrollTo({
        top: scrollPosition,
        behavior: behavior
      });
    }

    /**
     * Setup intersection observer for lazy loading
     */
    setupIntersectionObserver(section) {
      const images = section.querySelectorAll('img[data-src]');
      const videos = section.querySelectorAll('video[data-src]');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const src = element.dataset.src;
            
            if (src) {
              element.src = src;
              element.removeAttribute('data-src');
              observer.unobserve(element);
            }
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });
      
      [...images, ...videos].forEach(element => {
        observer.observe(element);
      });
      
      // Store observer for cleanup
      this.observers.set(section, observer);
    }

    /**
     * Add entrance animation to sections
     */
    addEntranceAnimation(section) {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      requestAnimationFrame(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      });
    }

    /**
     * Update section order after reorder
     */
    updateSectionOrder() {
      const sections = document.querySelectorAll('[data-section-id]');
      
      sections.forEach((section, index) => {
        section.style.transition = 'transform 0.3s ease';
        section.dataset.order = index;
      });
    }

    /**
     * Update slide indicator
     */
    updateSlideIndicator(slideshow, activeSlide) {
      const slides = slideshow.querySelectorAll('.slideshow__slide');
      const indicators = slideshow.querySelectorAll('.slideshow__indicator');
      
      slides.forEach((slide, index) => {
        if (slide === activeSlide) {
          indicators[index]?.classList.add('active');
        } else {
          indicators[index]?.classList.remove('active');
        }
      });
    }

    /**
     * Add custom editor styles
     */
    addEditorStyles() {
      const style = document.createElement('style');
      style.textContent = `
        /* Editor-specific styles */
        .editor-selected {
          position: relative;
        }
        
        .section-selected {
          outline: 3px solid #006aff !important;
          outline-offset: 2px !important;
          border-radius: 8px !important;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .inspector-active {
          cursor: crosshair;
        }
        
        /* Smooth transitions for editor changes */
        .shopify-section {
          transition: all 0.3s ease;
        }
        
        /* Highlight draggable elements */
        [draggable="true"]:hover {
          cursor: move;
          opacity: 0.8;
        }
      `;
      document.head.appendChild(style);
    }

    /**
     * Cleanup section when unloaded
     */
    cleanupSection(section) {
      // Remove intersection observer
      const observer = this.observers.get(section);
      if (observer) {
        observer.disconnect();
        this.observers.delete(section);
      }
      
      // Remove selection indicators
      const indicators = section.querySelectorAll('.section-selection-indicator');
      indicators.forEach(indicator => indicator.remove());
      
      console.log(`🧹 Cleaned up section: ${section.id || section.dataset.sectionId}`);
    }

    /**
     * Setup observers for performance monitoring
     */
    setupObservers() {
      // Monitor performance
      if ('PerformanceObserver' in window) {
        const perfObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
              console.warn('⚠️ Long task detected:', entry.duration + 'ms');
            }
          }
        });
        perfObserver.observe({ entryTypes: ['longtask'] });
      }
    }
  }

  // ===== INITIALIZATION =====
  document.addEventListener('DOMContentLoaded', () => {
    // Only initialize in theme editor
    if (window.Shopify && window.Shopify.designMode) {
      window.themeEditorManager = new ThemeEditorManager();
    }
  });

  // ===== EXPORT FOR GLOBAL ACCESS =====
  window.ThemeEditorUtils = {
    hideModals: () => {
      if (window.themeEditorManager) {
        window.themeEditorManager.hideAllModals();
      }
    },
    scrollToSection: (selector) => {
      const element = document.querySelector(selector);
      if (element && window.themeEditorManager) {
        window.themeEditorManager.scrollToElement(element);
      }
    }
  };

})();

// ===== ADDITIONAL HELPER FUNCTIONS =====

/**
 * Debounce function for performance optimization
 */
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

/**
 * Throttle function for scroll events
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element with offset
 */
function smoothScrollTo(element, offset = 0, duration = 1000) {
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset + offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    const easeInOutCubic = progress => progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }
  
  requestAnimationFrame(animation);
}