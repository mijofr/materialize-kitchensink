(function($) {
  'use strict';

  let _defaults = {
    data: [], // Autocomplete data set
    limit: Infinity, // Limit of results the autocomplete shows
    onAutocomplete: null, // Callback for when autocompleted
    dropdownOptions: {
      // Default dropdown options
      autoFocus: false,
      closeOnClick: false,
      coverTrigger: false
    },
    minLength: 1, // Min characters before autocomplete starts
    sortFunction: function(a, b, inputString) {
      // Sort function for sorting autocomplete results
      return a.indexOf(inputString) - b.indexOf(inputString);
    },
    allowUnsafeHTML: false
  };

  class Autocomplete extends Component {
    constructor(el, options) {
      super(Autocomplete, el, options);
      this.el.M_Autocomplete = this;
      this.options = $.extend({}, Autocomplete.defaults, options);
      // Setup
      this.isOpen = false;
      this.count = 0;
      this.activeIndex = -1;
      this.oldVal;
      this.$inputField = this.$el.closest('.input-field');
      this.$active = $();
      this._mousedown = false;
      this._setupDropdown();
      this._setupEventHandlers();
    }
    static get defaults() {
      return _defaults;
    }
    static init(els, options) {
      return super.init(this, els, options);
    }
    static getInstance(el) {
      let domElem = el.jquery ? el[0] : el;
      return domElem.M_Autocomplete;
    }
    destroy() {
      this._removeEventHandlers();
      this._removeDropdown();
      this.el.M_Autocomplete = undefined;
    }

    _setupEventHandlers() {
      this._handleInputBlurBound = this._handleInputBlur.bind(this);
      this._handleInputKeyupAndFocusBound = this._handleInputKeyupAndFocus.bind(this);
      this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
      this._handleInputClickBound = this._handleInputClick.bind(this);
      this._handleContainerMousedownAndTouchstartBound = this._handleContainerMousedownAndTouchstart.bind(
        this
      );
      this._handleContainerMouseupAndTouchendBound = this._handleContainerMouseupAndTouchend.bind(
        this
      );
      this.el.addEventListener('blur', this._handleInputBlurBound);
      this.el.addEventListener('keyup', this._handleInputKeyupAndFocusBound);
      this.el.addEventListener('focus', this._handleInputKeyupAndFocusBound);
      this.el.addEventListener('keydown', this._handleInputKeydownBound);
      this.el.addEventListener('click', this._handleInputClickBound);
      this.container.addEventListener(
        'mousedown',
        this._handleContainerMousedownAndTouchstartBound
      );
      this.container.addEventListener('mouseup', this._handleContainerMouseupAndTouchendBound);
      if (typeof window.ontouchstart !== 'undefined') {
        this.container.addEventListener(
          'touchstart',
          this._handleContainerMousedownAndTouchstartBound
        );
        this.container.addEventListener('touchend', this._handleContainerMouseupAndTouchendBound);
      }
    }
    _removeEventHandlers() {
      this.el.removeEventListener('blur', this._handleInputBlurBound);
      this.el.removeEventListener('keyup', this._handleInputKeyupAndFocusBound);
      this.el.removeEventListener('focus', this._handleInputKeyupAndFocusBound);
      this.el.removeEventListener('keydown', this._handleInputKeydownBound);
      this.el.removeEventListener('click', this._handleInputClickBound);
      this.container.removeEventListener(
        'mousedown',
        this._handleContainerMousedownAndTouchstartBound
      );
      this.container.removeEventListener('mouseup', this._handleContainerMouseupAndTouchendBound);

      if (typeof window.ontouchstart !== 'undefined') {
        this.container.removeEventListener(
          'touchstart',
          this._handleContainerMousedownAndTouchstartBound
        );
        this.container.removeEventListener(
          'touchend',
          this._handleContainerMouseupAndTouchendBound
        );
      }
    }
    _setupDropdown() {
      this.container = document.createElement('ul');
      this.container.id = `autocomplete-options-${M.guid()}`;
      $(this.container).addClass('autocomplete-content dropdown-content');
      this.$inputField.append(this.container);
      this.el.setAttribute('data-target', this.container.id);
      // Initialize dropdown
      let dropdownOptions = $.extend(
        {},
        Autocomplete.defaults.dropdownOptions,
        this.options.dropdownOptions
      );
      let userOnItemClick = dropdownOptions.onItemClick;
      // Ensuring the select Option call when user passes custom onItemClick function to dropdown
      dropdownOptions.onItemClick = (li) => {
        const entryID = li.getAttribute('data-id');
        this.selectOption(entryID);
        // Handle user declared onItemClick if needed
        if (userOnItemClick && typeof userOnItemClick === 'function')
          userOnItemClick.call(this.dropdown, this.el);
      };
      this.dropdown = M.Dropdown.init(this.el, dropdownOptions);
      // Sketchy removal of dropdown click handler
      this.el.removeEventListener('click', this.dropdown._handleClickBound);
      // Set Value if already set in HTML
      if (this.el.value) this.selectOption(this.el.value);
    }
    _removeDropdown() {
      this.container.parentNode.removeChild(this.container);
    }
    _handleInputBlur() {
      if (!this._mousedown) {
        this.close();
        this._resetAutocomplete();
      }
    }
    _handleInputKeyupAndFocus(e) {
      if (e.type === 'keyup') Autocomplete._keydown = false;
      this.count = 0;
      let val = this.el.value.toLowerCase();
      // Don't capture enter or arrow key usage.
      if (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40) return;
      // Check if the input isn't empty
      // Check if focus triggered by tab
      if (this.oldVal !== val && (M.tabPressed || e.type !== 'focus')) this.open();
      // Update oldVal
      this.oldVal = val;
    }
    _handleInputKeydown(e) {
      Autocomplete._keydown = true;
      // Arrow keys and enter key usage
      let keyCode = e.keyCode,
        liElement,
        numItems = $(this.container).children('li').length;
      // select element on Enter
      if (keyCode === M.keys.ENTER && this.activeIndex >= 0) {
        liElement = $(this.container)
          .children('li')
          .eq(this.activeIndex);
        if (liElement.length) {
          this.selectOption(liElement[0].getAttribute('data-id'));
          e.preventDefault();
        }
        return;
      }
      // Capture up and down key
      if (keyCode === M.keys.ARROW_UP || keyCode === M.keys.ARROW_DOWN) {
        e.preventDefault();
        if (keyCode === M.keys.ARROW_UP && this.activeIndex > 0) {
          this.activeIndex--;
        }
        if (keyCode === M.keys.ARROW_DOWN && this.activeIndex < numItems - 1) {
          this.activeIndex++;
        }
        this.$active.removeClass('active');
        if (this.activeIndex >= 0) {
          this.$active = $(this.container)
            .children('li')
            .eq(this.activeIndex);
          this.$active.addClass('active');
          // Focus selected
          this.container.children[this.activeIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }
    }
    _handleInputClick(e) {
      this.open();
    }
    _handleContainerMousedownAndTouchstart(e) {
      this._mousedown = true;
    }
    _handleContainerMouseupAndTouchend(e) {
      this._mousedown = false;
    }
    _highlightPartialText(input, label) {
      const start = label.toLowerCase().indexOf('' + input.toLowerCase() + '');
      const end = start + input.length - 1;
      //custom filters may return results where the string does not match any part
      if (start == -1 || end == -1) {
        return [label, '', ''];
      }
      return [label.slice(0, start), label.slice(start, end + 1), label.slice(end + 1)];
    }
    _resetCurrentElementPosition() {
      this.activeIndex = -1;
      this.$active.removeClass('active');
    }
    _resetAutocomplete() {
      $(this.container).empty();
      this._resetCurrentElementPosition();
      this.oldVal = null;
      this.isOpen = false;
      this._mousedown = false;
    }
    _renderDropdown(data, selectedValue) {
      this._resetAutocomplete();

      let matchingData = data.filter(
        (entry) => (entry.text || entry.id).toLowerCase().indexOf(selectedValue) !== -1
      );
      this.count = matchingData.length;

      // Sort
      if (this.options.sortFunction) {
        let sortFunctionBound = (a, b) => {
          return this.options.sortFunction(
            (a.text || a.id).toLowerCase(),
            (b.text || b.id).toLowerCase(),
            selectedValue.toLowerCase()
          );
        };
        matchingData.sort(sortFunctionBound);
      }
      // Limit
      matchingData = matchingData.slice(0, this.options.limit);

      // Render
      for (let i = 0; i < matchingData.length; i++) {
        const entry = matchingData[i];
        const item = document.createElement('li');
        item.setAttribute('data-id', entry.id);
        if (entry.image) {
          const img = document.createElement('img');
          img.classList.add('right', 'circle');
          img.src = entry.image;
          item.appendChild(img);
        }
        const parts = this._highlightPartialText(selectedValue, entry.text || entry.id);
        const span = document.createElement('span');
        if (this.options.allowUnsafeHTML) {
          span.innerHTML = parts[0] + '<span class="highlight">' + parts[1] + '</span>' + parts[2];
        } else {
          span.appendChild(document.createTextNode(parts[0]));
          if (parts[1]) {
            const highlight = document.createElement('span');
            highlight.textContent = parts[1];
            highlight.classList.add('highlight');
            span.appendChild(highlight);
            span.appendChild(document.createTextNode(parts[2]));
          }
        }
        item.appendChild(span);
        $(this.container).append(item);
      }
    }

    selectOption(id) {
      const entries = this.options.data.filter((entry) => entry.id == id);
      if (entries.length === 0) return;
      const entry = entries[0];
      this.el.value = entry.text || entry.id;
      this.$el.trigger('change');
      this._resetAutocomplete();
      this.close();
      // Trigger Autocomplete Event
      if (typeof this.options.onAutocomplete === 'function')
        this.options.onAutocomplete.call(this, entry);
    }
    open() {
      const selectedValue = this.el.value.toLowerCase();
      this._resetAutocomplete();
      if (selectedValue.length >= this.options.minLength) {
        this.isOpen = true;
        this._renderDropdown(this.options.data, selectedValue);
      }
      // Open dropdown
      if (!this.dropdown.isOpen) this.dropdown.open();
      else this.dropdown.recalculateDimensions(); // Recalculate dropdown when its already open
    }
    close() {
      this.dropdown.close();
    }
    updateData(data) {
      let selectedValue = this.el.value.toLowerCase();
      this.options.data = data;
      if (this.isOpen) this._renderDropdown(data, selectedValue);
    }
  }

  Autocomplete._keydown = false;
  M.Autocomplete = Autocomplete;
  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Autocomplete, 'autocomplete', 'M_Autocomplete');
  }
})(cash);
