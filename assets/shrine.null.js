// Vithalia Product Page - Adapted from shrine.null.js
// Shopify OS 2.0 Compatible

const VithaliaProduct = {
  // Configuration for Vithalia colageno product
  productHandle: 'colageno',
  variantOptions: ['Sabor', 'Presentación'],
  price: '$590.00',
  comparePrice: '$699.00',
  
  // Benefits sections (acordeón style)
  benefits: [
    {
      title: "Beneficios para la Piel",
      content: "El colágeno hidrolizado ayuda a mejorar la elasticidad y firmeza de la piel, reduciendo la aparición de arrugas y líneas finas."
    },
    {
      title: "Apoyo Articular",
      content: "Fortalece las articulaciones y cartílagos, mejorando la movilidad y reduciendo el dolor articular."
    },
    {
      title: "Salud del Cabello y Uñas",
      content: "Promueve el crecimiento saludable del cabello y fortalece las uñas, previniendo su rotura."
    }
  ],
  
  // Nutritional information
  nutrition: {
    servingSize: "10g (1 cucharada)",
    servingsPerContainer: "30",
    ingredients: [
      { name: "Colágeno Hidrolizado", amount: "9g" },
      { name: "Vitamina C", amount: "60mg" },
      { name: "Ácido Hialurónico", amount: "50mg" }
    ]
  }
};

// Custom element for Vithalia product benefits
class VithaliaBenefits extends HTMLElement {
  constructor() {
    super();
    this.benefits = VithaliaProduct.benefits;
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <div class="vithalia-benefits">
        <h2 class="benefits-title">Beneficios del Colágeno</h2>
        <div class="benefits-accordion">
          ${this.benefits.map((benefit, index) => `
            <div class="benefit-item">
              <button class="benefit-header" aria-expanded="false">
                <span>${benefit.title}</span>
                <svg class="benefit-icon" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
              <div class="benefit-content">
                <p>${benefit.content}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    const headers = this.querySelectorAll('.benefit-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const expanded = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', !expanded);
        const content = header.nextElementSibling;
        content.style.maxHeight = expanded ? '0' : content.scrollHeight + 'px';
      });
    });
  }
}

// Custom element for Vithalia nutrition table
class VithaliaNutrition extends HTMLElement {
  constructor() {
    super();
    this.nutrition = VithaliaProduct.nutrition;
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <div class="vithalia-nutrition">
        <h3 class="nutrition-title">Información Nutrimental</h3>
        <div class="nutrition-table">
          <div class="nutrition-header">
            <span>Tamaño de porción: ${this.nutrition.servingSize}</span>
            <span>Porciones por envase: ${this.nutrition.servingsPerContainer}</span>
          </div>
          <div class="nutrition-body">
            ${this.nutrition.ingredients.map(ingredient => `
              <div class="nutrition-row">
                <span class="ingredient-name">${ingredient.name}</span>
                <span class="ingredient-amount">${ingredient.amount}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

// Enhanced product form for Vithalia
class VithaliaProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.variantSelects = this.querySelectorAll('.product-form__input');
    this.priceElement = this.querySelector('.product-price');
    this.comparePriceElement = this.querySelector('.product-compare-price');
    
    this.init();
  }
  
  init() {
    this.updatePrice();
    this.variantSelects.forEach(select => {
      select.addEventListener('change', () => this.updatePrice());
    });
  }
  
  updatePrice() {
    // Simulate price updates based on variant selection
    const selectedVariant = Array.from(this.variantSelects).map(select => select.value).join(' / ');
    
    // Update price display
    if (this.priceElement) {
      this.priceElement.textContent = VithaliaProduct.price;
    }
    
    if (this.comparePriceElement) {
      this.comparePriceElement.textContent = VithaliaProduct.comparePrice;
    }
  }
}

// Testimonials carousel
class VithaliaTestimonials extends HTMLElement {
  constructor() {
    super();
    this.testimonials = [
      {
        name: "María G.",
        rating: 5,
        text: "Excelente producto, noté mejoría en mi piel desde la primera semana.",
        verified: true
      },
      {
        name: "Carlos R.",
        rating: 5,
        text: "Me ayudó mucho con el dolor de rodillas. Lo recomiendo ampliamente.",
        verified: true
      },
      {
        name: "Ana L.",
        rating: 5,
        text: "Mi cabello y uñas nunca habían estado tan fuertes. Muy satisfecha.",
        verified: true
      }
    ];
    this.currentIndex = 0;
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <div class="vithalia-testimonials">
        <h2 class="testimonials-title">Lo que dicen nuestros clientes</h2>
        <div class="testimonials-carousel">
          <div class="testimonials-container">
            ${this.testimonials.map((testimonial, index) => `
              <div class="testimonial-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="testimonial-rating">
                  ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                </div>
                <p class="testimonial-text">"${testimonial.text}"</p>
                <div class="testimonial-author">
                  <span class="author-name">${testimonial.name}</span>
                  ${testimonial.verified ? '<span class="verified-badge">✓ Verificado</span>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
          <button class="carousel-btn prev" aria-label="Anterior">‹</button>
          <button class="carousel-btn next" aria-label="Siguiente">›</button>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    const prevBtn = this.querySelector('.carousel-btn.prev');
    const nextBtn = this.querySelector('.carousel-btn.next');
    
    prevBtn.addEventListener('click', () => this.showPrev());
    nextBtn.addEventListener('click', () => this.showNext());
  }
  
  showPrev() {
    this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
    this.updateCarousel();
  }
  
  showNext() {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
    this.updateCarousel();
  }
  
  updateCarousel() {
    const items = this.querySelectorAll('.testimonial-item');
    items.forEach((item, index) => {
      item.classList.toggle('active', index === this.currentIndex);
    });
  }
}

// Register custom elements
customElements.define('vithalia-benefits', VithaliaBenefits);
customElements.define('vithalia-nutrition', VithaliaNutrition);
customElements.define('vithalia-product-form', VithaliaProductForm);
customElements.define('vithalia-testimonials', VithaliaTestimonials);

// Initialize Vithalia-specific functionality
document.addEventListener('DOMContentLoaded', () => {
  // Add Vithalia styling
  const style = document.createElement('style');
  style.textContent = `
    /* Vithalia Product Page Styles */
    .vithalia-benefits {
      margin: 2rem 0;
      padding: 0 1rem;
    }
    
    .benefits-title {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .benefits-accordion {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .benefit-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      overflow: hidden;
    }
    
    .benefit-header {
      width: 100%;
      padding: 1rem;
      background: #f8f8f8;
      border: none;
      text-align: left;
      font-size: 1.1rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.3s;
    }
    
    .benefit-header:hover {
      background: #f0f0f0;
    }
    
    .benefit-icon {
      width: 24px;
      height: 24px;
      fill: #666;
      transition: transform 0.3s;
    }
    
    .benefit-header[aria-expanded="true"] .benefit-icon {
      transform: rotate(180deg);
    }
    
    .benefit-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      background: white;
    }
    
    .benefit-content p {
      padding: 1rem;
      margin: 0;
      line-height: 1.6;
      color: #555;
    }
    
    .vithalia-nutrition {
      margin: 2rem 0;
      padding: 0 1rem;
    }
    
    .nutrition-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }
    
    .nutrition-table {
      border: 2px solid #333;
      border-radius: 8px;
      overflow: hidden;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .nutrition-header {
      background: #333;
      color: white;
      padding: 0.75rem;
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    
    .nutrition-body {
      background: white;
    }
    
    .nutrition-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    
    .nutrition-row:last-child {
      border-bottom: none;
    }
    
    .ingredient-name {
      font-weight: 500;
    }
    
    .ingredient-amount {
      color: #666;
    }
    
    .vithalia-testimonials {
      margin: 3rem 0;
      padding: 0 1rem;
    }
    
    .testimonials-title {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 2rem;
      text-align: center;
    }
    
    .testimonials-carousel {
      position: relative;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .testimonials-container {
      display: flex;
      overflow: hidden;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .testimonial-item {
      min-width: 100%;
      padding: 2rem;
      background: white;
      text-align: center;
      display: none;
    }
    
    .testimonial-item.active {
      display: block;
    }
    
    .testimonial-rating {
      color: #ffc107;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .testimonial-text {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #555;
      margin-bottom: 1.5rem;
      font-style: italic;
    }
    
    .testimonial-author {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }
    
    .author-name {
      font-weight: 600;
      color: #333;
    }
    
    .verified-badge {
      background: #4caf50;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    
    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: white;
      border: 2px solid #ddd;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }
    
    .carousel-btn:hover {
      background: #f5f5f5;
      border-color: #999;
    }
    
    .carousel-btn.prev {
      left: -50px;
    }
    
    .carousel-btn.next {
      right: -50px;
    }
    
    @media (max-width: 768px) {
      .carousel-btn {
        position: static;
        transform: none;
        margin: 1rem 0.5rem;
      }
      
      .carousel-btn.prev,
      .carousel-btn.next {
        left: auto;
        right: auto;
      }
    }
  `;
  document.head.appendChild(style);
});