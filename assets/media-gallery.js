/* ====== media-gallery.js | Comportamiento adaptado a Vithalia.store ====== */

if (!customElements.get('media-gallery')) {
  customElements.define('media-gallery', class MediaGallery extends HTMLElement {
    constructor() {
      super();
      this.elements = {
        viewer: this.querySelector('[data-media-viewer]'),
        thumbnails: this.querySelector('[data-media-thumbnails]'),
      };

      if (!this.elements.viewer) return;

      this.currentIndex = 0;
      this.setupEventListeners();
      this.setupKeyboardNav();
    }

    setupEventListeners() {
      if (this.elements.thumbnails) {
        this.elements.thumbnails.querySelectorAll('[data-target]').forEach((thumb) => {
          thumb.addEventListener('click', (e) => {
            e.preventDefault();
            this.setActiveMedia(thumb.dataset.target);
          });
        });
      }

      // Soporte para swipe en móvil
      let touchStartX = 0;
      this.elements.viewer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
      });

      this.elements.viewer.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? this.nextMedia() : this.prevMedia();
        }
      });
    }

    setupKeyboardNav() {
      this.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.prevMedia();
        if (e.key === 'ArrowRight') this.nextMedia();
      });
    }

    setActiveMedia(mediaId) {
      const items = this.elements.viewer.querySelectorAll('[data-media-id]');
      const activeItem = this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`);
      if (!activeItem) return;

      items.forEach(item => item.classList.remove('is-active'));
      activeItem.classList.add('is-active');

      this.currentIndex = Array.from(items).indexOf(activeItem);

      this.updateThumbnail(mediaId);
      this.scrollToMedia(activeItem);
      this.announceMedia(activeItem);
      this.playMedia(activeItem);
    }

    updateThumbnail(mediaId) {
      if (!this.elements.thumbnails) return;
      const thumbs = this.elements.thumbnails.querySelectorAll('[data-target]');
      thumbs.forEach(thumb => {
        thumb.classList.toggle('is-active', thumb.dataset.target === mediaId);
        thumb.setAttribute('aria-current', thumb.dataset.target === mediaId ? 'true' : 'false');
      });
    }

    scrollToMedia(media) {
      media.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    announceMedia(media) {
      const liveRegion = this.querySelector('[data-live-region]');
      if (!liveRegion) return;

      const position = Array.from(media.parentElement.children).indexOf(media) + 1;
      liveRegion.textContent = `Imagen ${position} de ${media.parentElement.children.length}`;
      liveRegion.setAttribute('aria-live', 'polite');
    }

    playMedia(media) {
      const video = media.querySelector('video');
      if (video) {
        video.play();
      }
    }

    nextMedia() {
      const items = this.elements.viewer.querySelectorAll('[data-media-id]');
      const nextIndex = (this.currentIndex + 1) % items.length;
      this.setActiveMedia(items[nextIndex].dataset.mediaId);
    }

    prevMedia() {
      const items = this.elements.viewer.querySelectorAll('[data-media-id]');
      const prevIndex = (this.currentIndex - 1 + items.length) % items.length;
      this.setActiveMedia(items[prevIndex].dataset.mediaId);
    }
  });
}