/* ====== main-search.js | Comportamiento adaptado a Vithalia.store ====== */

class MainSearch extends SearchForm {
  constructor() {
    super();
    this.allSearchInputs = document.querySelectorAll('input[type="search"]');
    this.setupEventListeners();
  }

  setupEventListeners() {
    const allSearchForms = Array.from(this.allSearchInputs).map(input => input.form).filter(Boolean);

    this.input?.addEventListener('focus', this.onInputFocus.bind(this));

    if (allSearchForms.length < 2) return;

    allSearchForms.forEach(form => {
      form.addEventListener('reset', this.onFormReset.bind(this));
    });

    this.allSearchInputs.forEach(input => {
      input.addEventListener('input', this.onInput.bind(this));
    });
  }

  onFormReset(event) {
    super.onFormReset(event);
    if (super.shouldResetForm?.()) {
      this.keepInSync('', this.input);
    }
  }

  onInput(event) {
    const target = event.target;
    this.keepInSync(target.value, target);
  }

  onInputFocus() {
    const isSmallScreen = window.innerWidth < 768;
    if (isSmallScreen) {
      this.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  keepInSync(value, target) {
    this.allSearchInputs.forEach(input => {
      if (input !== target) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }
}

customElements.define('main-search', MainSearch);