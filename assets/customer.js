/* ====== customer.js | Comportamiento adaptado a Vithalia.store ====== */

const selectors = {
  customerAddresses: '[data-customer-addresses]',
  addressCountrySelect: '[data-address-country-select]',
  addressContainer: '[data-address]',
  toggleAddressButton: 'button[aria-expanded]',
  cancelAddressButton: 'button[type="reset"]',
  deleteAddressButton: 'button[data-confirm-message]'
};

const attributes = {
  expanded: 'aria-expanded',
  confirmMessage: 'data-confirm-message'
};

class CustomerAddresses {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupCountries();
    this._setupEventListeners();
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses);
    return container ? {
      container,
      addressContainer: container.querySelector(selectors.addressContainer),
      toggleButtons: document.querySelectorAll(selectors.toggleAddressButton),
      cancelButtons: container.querySelectorAll(selectors.cancelAddressButton),
      deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
      countrySelects: container.querySelectorAll(selectors.addressCountrySelect)
    } : {};
  }

  _setupCountries() {
    if (window.Shopify && window.Shopify.CountryProvinceSelector) {
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew'
      });

      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`
        });
      });
    }
  }

  _setupEventListeners() {
    this.elements.toggleButtons.forEach((btn) => {
      btn.addEventListener('click', this._handleToggleClick);
    });

    this.elements.cancelButtons.forEach((btn) => {
      btn.addEventListener('click', this._handleCancelClick);
    });

    this.elements.deleteButtons.forEach((btn) => {
      btn.addEventListener('click', this._handleDeleteClick);
    });
  }

  _handleToggleClick = ({ currentTarget }) => {
    const isExpanded = currentTarget.getAttribute(attributes.expanded) === 'true';
    currentTarget.setAttribute(attributes.expanded, String(!isExpanded));
  }

  _handleCancelClick = ({ currentTarget }) => {
    const container = currentTarget.closest(selectors.addressContainer);
    const toggle = container.querySelector(`[${attributes.expanded}]`);
    if (toggle) {
      toggle.setAttribute(attributes.expanded, 'false');
    }
  }

  _handleDeleteClick = ({ currentTarget }) => {
    const message = currentTarget.getAttribute(attributes.confirmMessage);
    if (message && confirm(message)) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: { _method: 'delete' }
      });
    }
  }
}

// Inicializar solo si existe el contenedor
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector(selectors.customerAddresses)) {
    new CustomerAddresses();
  }
});