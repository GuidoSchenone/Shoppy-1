/* ====== magnify.js | Comportamiento adaptado a Vithalia.store ====== */

document.addEventListener('DOMContentLoaded', () => {
  const ZOOM_RATIO = 2;
  const ZOOM_CLASS = 'image-magnify-hover';
  const OVERLAY_CLASS = 'image-magnify-full-size';

  const createOverlay = (image) => {
    const overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.backgroundImage = `url('${image.src}')`;
    overlay.style.backgroundRepeat = 'no-repeat';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '1000';
    overlay.style.cursor = 'zoom-out';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.pointerEvents = 'all';
    image.parentElement.insertBefore(overlay, image);
    setTimeout(() => (overlay.style.opacity = '1'), 10);
    return overlay;
  };

  const moveWithHover = (image, event, overlay, zoomRatio) => {
    const rect = image.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const bgWidth = image.naturalWidth * zoomRatio;
    const bgHeight = image.naturalHeight * zoomRatio;

    overlay.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
    overlay.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
  };

  const magnify = (image, zoomRatio) => {
    const overlay = createOverlay(image);

    const onMouseMove = (e) => moveWithHover(image, e, overlay, zoomRatio);
    const onMouseLeave = () => {
      overlay.style.opacity = '0';
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    };
    const onClick = () => {
      overlay.removeEventListener('mousemove', onMouseMove);
      overlay.removeEventListener('mouseleave', onMouseLeave);
      overlay.removeEventListener('click', onClick);
      onMouseLeave();
    };

    overlay.addEventListener('mousemove', onMouseMove);
    overlay.addEventListener('mouseleave', onMouseLeave);
    overlay.addEventListener('click', onClick);
  };

  const enableZoomOnHover = (zoomRatio) => {
    const images = document.querySelectorAll(`.${ZOOM_CLASS}`);
    images.forEach((image) => {
      if (!image.complete) {
        image.addEventListener('load', () => {
          image.onclick = (e) => magnify(image, zoomRatio);
        });
      } else {
        image.onclick = (e) => magnify(image, zoomRatio);
      }
    });
  };

  enableZoomOnHover(ZOOM_RATIO);
});