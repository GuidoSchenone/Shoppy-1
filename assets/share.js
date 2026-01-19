/**
 * Vithalia-style Share Button Component
 * Clean, conversion-focused social sharing with modern UX
 */

if (!customElements.get('share-button')) {
  customElements.define('share-button', class ShareButton extends DetailsDisclosure {
    constructor() {
      super();

      this.elements = {
        shareButton: this.querySelector('button'),
        shareSummary: this.querySelector('summary'),
        closeButton: this.querySelector('.share-button__close'),
        successMessage: this.querySelector('[id^="ShareMessage"]'),
        urlInput: this.querySelector('input'),
        copyButton: this.querySelector('.share-button__copy'),
        socialButtons: this.querySelectorAll('.share-button__social')
      };

      this.urlToShare = this.elements.urlInput ? this.elements.urlInput.value : document.location.href;
      this.shareTitle = this.dataset.shareTitle || document.title;
      this.shareText = this.dataset.shareText || document.querySelector('meta[name="description"]')?.content || '';

      this.init();
    }

    init() {
      // Modern share functionality with fallback
      if (navigator.share && navigator.canShare && navigator.canShare({ url: this.urlToShare })) {
        this.setupNativeShare();
      } else {
        this.setupFallbackShare();
      }

      // Setup social media buttons
      this.setupSocialButtons();

      // Add event listeners
      this.mainDetailsToggle.addEventListener('toggle', this.toggleDetails.bind(this));
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (this.mainDetailsToggle.open && !this.contains(e.target)) {
          this.close();
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.mainDetailsToggle.open) {
          this.close();
        }
      });
    }

    setupNativeShare() {
      // Hide fallback UI and show native share button
      this.mainDetailsToggle.setAttribute('hidden', '');
      this.elements.shareButton.classList.remove('hidden');
      
      this.elements.shareButton.addEventListener('click', async () => {
        try {
          await navigator.share({
            url: this.urlToShare,
            title: this.shareTitle,
            text: this.shareText
          });
          
          // Show success feedback
          this.showSuccess('¡Contenido compartido exitosamente!');
          
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Error sharing:', err);
            this.showError('Error al compartir. Intenta de nuevo.');
          }
        }
      });
    }

    setupFallbackShare() {
      // Show fallback UI
      this.mainDetailsToggle.removeAttribute('hidden');
      
      // Copy to clipboard functionality
      if (this.elements.copyButton) {
        this.elements.copyButton.addEventListener('click', this.copyToClipboard.bind(this));
      }
      
      if (this.elements.closeButton) {
        this.elements.closeButton.addEventListener('click', this.close.bind(this));
      }

      // Auto-select text when opening
      if (this.elements.urlInput) {
        this.mainDetailsToggle.addEventListener('toggle', () => {
          if (this.mainDetailsToggle.open) {
            setTimeout(() => {
              this.elements.urlInput.select();
            }, 100);
          }
        });
      }
    }

    setupSocialButtons() {
      // Setup individual social media buttons
      this.elements.socialButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const platform = button.dataset.platform;
          const url = button.dataset.url || this.urlToShare;
          
          this.shareOnSocial(platform, url);
        });
      });
    }

    shareOnSocial(platform, url) {
      const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(this.shareText)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(this.shareText + ' ' + url)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(this.shareText)}`,
        email: `mailto:?subject=${encodeURIComponent(this.shareTitle)}&body=${encodeURIComponent(this.shareText + '\n\n' + url)}`
      };

      const shareUrl = shareUrls[platform];
      
      if (shareUrl) {
        // Open in new window
        window.open(shareUrl, '_blank', 'width=600,height=400');
        
        // Track share event
        this.trackShare(platform);
        
        // Show success feedback
        this.showSuccess(`¡Compartido en ${platform}!`);
      }
    }

    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.elements.urlInput.value);
        
        this.showSuccess(window.accessibilityStrings.shareSuccess || '¡Enlace copiado al portapapeles!');
        
        // Visual feedback
        this.elements.copyButton.classList.add('copied');
        setTimeout(() => {
          this.elements.copyButton.classList.remove('copied');
        }, 2000);
        
        // Track copy event
        this.trackShare('copy');
        
      } catch (err) {
        console.error('Failed to copy:', err);
        this.showError('Error al copiar. Intenta de nuevo.');
      }
    }

    showSuccess(message) {
      if (this.elements.successMessage) {
        this.elements.successMessage.classList.remove('hidden');
        this.elements.successMessage.textContent = message;
        this.elements.successMessage.setAttribute('role', 'alert');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          this.elements.successMessage.classList.add('hidden');
        }, 3000);
      }
      
      // Also show as toast notification
      this.showToast(message, 'success');
    }

    showError(message) {
      this.showToast(message, 'error');
    }

    showToast(message, type = 'success') {
      // Create toast element
      const toast = document.createElement('div');
      toast.className = `share-toast share-toast--${type}`;
      toast.textContent = message;
      
      // Add to body
      document.body.appendChild(toast);
      
      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
      
      // Remove after animation
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    }

    trackShare(platform) {
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
          method: platform,
          content_type: 'page',
          item_id: this.urlToShare
        });
      }
      
      // Custom event for other analytics
      this.dispatchEvent(new CustomEvent('share', {
        detail: { platform, url: this.urlToShare }
      }));
    }

    toggleDetails() {
      if (!this.mainDetailsToggle.open) {
        // Reset state when closing
        if (this.elements.successMessage) {
          this.elements.successMessage.classList.add('hidden');
          this.elements.successMessage.textContent = '';
          this.elements.successMessage.removeAttribute('role');
        }
        
        if (this.elements.closeButton) {
          this.elements.closeButton.classList.add('hidden');
        }
        
        if (this.elements.shareSummary) {
          this.elements.shareSummary.focus();
        }
      } else {
        // Focus management when opening
        if (this.elements.copyButton) {
          this.elements.copyButton.focus();
        }
      }
    }

    close() {
      this.mainDetailsToggle.removeAttribute('open');
      
      // Return focus to trigger element
      if (this.elements.shareSummary) {
        this.elements.shareSummary.focus();
      }
    }

    updateUrl(url) {
      this.urlToShare = url;
      if (this.elements.urlInput) {
        this.elements.urlInput.value = url;
      }
      
      // Update social button URLs
      this.elements.socialButtons.forEach(button => {
        if (button.dataset.url) {
          button.dataset.url = url;
        }
      });
    }

    // Public API methods
    open() {
      this.mainDetailsToggle.setAttribute('open', '');
    }

    share() {
      if (navigator.share) {
        this.elements.shareButton.click();
      } else {
        this.open();
      }
    }
  });
}

// Add CSS for toast notifications
const shareStyles = document.createElement('style');
shareStyles.textContent = `
  .share-toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 1.5rem 2rem;
    border-radius: 8px;
    font-size: 1.4rem;
    font-weight: 500;
    z-index: 1000;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 300px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .share-toast--success {
    background: #10b981;
    color: white;
  }

  .share-toast--error {
    background: #ef4444;
    color: white;
  }

  .share-toast.show {
    transform: translateX(0);
    opacity: 1;
  }

  @media (max-width: 749px) {
    .share-toast {
      top: 1rem;
      right: 1rem;
      left: 1rem;
      max-width: none;
      transform: translateY(-100%);
    }
    
    .share-toast.show {
      transform: translateY(0);
    }
  }
`;

document.head.appendChild(shareStyles);

// Accessibility strings fallback
if (!window.accessibilityStrings) {
  window.accessibilityStrings = {};
}

if (!window.accessibilityStrings.shareSuccess) {
  window.accessibilityStrings.shareSuccess = '¡Enlace copiado exitosamente!';
}

// Auto-initialize share buttons
document.addEventListener('DOMContentLoaded', () => {
  const shareButtons = document.querySelectorAll('share-button');
  shareButtons.forEach(button => {
    // Add loading state
    button.classList.add('share-button--initialized');
  });
});

// Handle dynamic content (Shopify sections)
document.addEventListener('shopify:section:load', (event) => {
  const shareButtons = event.target.querySelectorAll('share-button:not(.share-button--initialized)');
  shareButtons.forEach(button => {
    button.classList.add('share-button--initialized');
  });
});