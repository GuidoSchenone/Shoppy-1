/* ====== gem-page-product.js | Comportamiento adaptado a Vithalia.store ====== */

document.addEventListener('DOMContentLoaded', () => {
  const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(animateOnScroll, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });

  // Animación: pulse (infinita)
  const pulseElements = document.querySelectorAll('.animate-pulse-infinite');
  pulseElements.forEach(el => {
    el.classList.add('animate-pulse');
    observer.observe(el);
  });

  // Animación: pulse (una vez)
  const pulseOnceElements = document.querySelectorAll('.animate-pulse-once');
  pulseOnceElements.forEach(el => {
    el.classList.add('animate-pulse-once');
    observer.observe(el);
  });
});
