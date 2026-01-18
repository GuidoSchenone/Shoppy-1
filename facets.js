/* ====== facets.js | Comportamiento adaptado a Vithalia.store ====== */

class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    if (facetForm) {
      facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));
    }

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state?.searchParams || FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((el) => {
      el.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');

    const gridContainer = document.getElementById('ProductGridContainer');
    if (gridContainer) {
      gridContainer.querySelector('.collection')?.classList.add('loading');
    }

    if (countContainer) countContainer.classList.add('loading');
    if (countContainerDesktop) countContainerDesktop.classList.add('loading');

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((res) => res.text())
      .then((htmlText) => {
        const html = htmlText;
        FacetFiltersForm.filterData.push({ html, url });
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const { html } = FacetFiltersForm.filterData.find(filterDataUrl);
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
  }

  static renderProductGridContainer(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newGrid = doc.getElementById('ProductGridContainer');
    const currentGrid = document.getElementById('ProductGridContainer');
    if (newGrid && currentGrid) {
      currentGrid.innerHTML = newGrid.innerHTML;
    }
  }

  static renderProductCount(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newCount = doc.getElementById('ProductCount');
    const currentCount = document.getElementById('ProductCount');
    const currentCountDesktop = document.getElementById('ProductCountDesktop');

    if (newCount && currentCount) {
      currentCount.innerHTML = newCount.innerHTML;
      currentCount.classList.remove('loading');
    }

    if (newCount && currentCountDesktop) {
      currentCountDesktop.innerHTML = newCount.innerHTML;
      currentCountDesktop.classList.remove('loading');
    }
  }

  static renderFilters(html, event) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const facetDetails = doc.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter');
    const targetFilter = event?.target.closest('.js-filter');

    facetDetails.forEach((newFilter) => {
      const index = newFilter.dataset.index;
      const currentFilter = document.querySelector(`.js-filter[data-index="${index}"]`);
      if (currentFilter && newFilter && currentFilter !== targetFilter) {
        currentFilter.innerHTML = newFilter.innerHTML;
      }
    });

    FacetFiltersForm.renderActiveFacets(doc);
    FacetFiltersForm.renderAdditionalElements(doc);
  }

  static renderActiveFacets(html) {
    const selectors = ['.active-facets-mobile', '.active-facets-desktop'];
    selectors.forEach((selector) => {
      const newEl = html.querySelector(selector);
      const currentEl = document.querySelector(selector);
      if (newEl && currentEl) currentEl.innerHTML = newEl.innerHTML;
    });
    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const selectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];
    selectors.forEach((selector) => {
      const newEl = html.querySelector(selector);
      const currentEl = document.querySelector(selector);
      if (newEl && currentEl) currentEl.innerHTML = newEl.innerHTML;
    });

    const mobileDrawer = document.getElementById('FacetFiltersFormMobile')?.closest('menu-drawer');
    if (mobileDrawer && mobileDrawer.bindEvents) {
      mobileDrawer.bindEvents();
    }
  }

  static updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      '',
      `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`
    );
  }

  static getSections() {
    const grid = document.getElementById('product-grid');
    return grid ? [{ section: grid.dataset.id }] : [];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const form = event.target.closest('form');
    if (!form) return;

    const isMobile = form.id === 'FacetFiltersFormMobile';
    const searchParams = this.createSearchParams(form);
    this.onSubmitForm(searchParams, event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href;
    const searchParams = url.includes('?') ? url.split('?')[1] : '';
    FacetFiltersForm.renderPage(searchParams, event);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);

customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

// ====== Price Range ======
class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input').forEach((input) =>
      input.addEventListener('change', this.onRangeChange.bind(this))
    );
    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));
    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

// ====== Facet Remove ======
class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const link = this.querySelector('a');
    if (link) {
      link.setAttribute('role', 'button');
      link.addEventListener('click', this.closeFilter.bind(this));
    }
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    if (form && form.onActiveFilterClick) {
      form.onActiveFilterClick(event);
    }
  }
}

customElements.define('facet-remove', FacetRemove);