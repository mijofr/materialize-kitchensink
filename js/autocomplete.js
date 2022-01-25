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
    isMultipleSelect: true,
    onSearch: null, // dynamic read function
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
      this.selectedValues = [];
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
      const actualValue = this.el.value.toLowerCase();
      // Don't capture enter or arrow key usage.
      if (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40) return;
      // Check if the input isn't empty
      // Check if focus triggered by tab
      if (this.oldVal !== actualValue && (M.tabPressed || e.type !== 'focus')) {
        this.open();
        if (typeof this.options.onSearch === 'function') {
          this._setLoading();
          this.options.onSearch(this.el.value, this);
        }
      }
      this.oldVal = actualValue;
    }
    _handleInputKeydown(e) {
      Autocomplete._keydown = true;
      // Arrow keys and enter key usage
      const keyCode = e.keyCode;
      const numItems = $(this.container).children('li').length;
      // select element on Enter
      if (keyCode === M.keys.ENTER && this.activeIndex >= 0) {
        const liElement = $(this.container)
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
        if (keyCode === M.keys.ARROW_UP && this.activeIndex > 0) this.activeIndex--;
        if (keyCode === M.keys.ARROW_DOWN && this.activeIndex < numItems - 1) this.activeIndex++;
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
    _resetCurrentElementPosition() {
      this.activeIndex = -1;
      this.$active.removeClass('active');
    }
    _resetAutocomplete() {
      $(this.container).empty();
      this._resetCurrentElementPosition();
      //this.oldVal = null;
      this.isOpen = false;
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
    _createDropdownItem(entry, inputText) {
      const item = document.createElement('li');
      item.setAttribute('data-id', entry.id);

      item.setAttribute(
        'style',
        'display:grid; grid-template-columns: 50px 50px auto; grid-auto-flow: column; user-select: none;'
      );
      item.innerHTML = `
        <div class="item-selection" style="align-self:center;text-align:center;">
          <label><input type="checkbox"><span style="padding-left:21px;"></span></label>
        </div>
        <div class="item-image" style="align-self:center;text-align:center;"></div>
        <div class="item-text" style="align-self:center;"></div>
      `;

      // Image
      if (entry.image) {
        const img = document.createElement('img');
        img.setAttribute('style', 'margin:0;');
        img.classList.add('circle');
        img.src = entry.image;
        item.querySelector('.item-image').appendChild(img);
      }
      // Text
      const parts = this._highlightPartialText(inputText, (entry.text || entry.id).toString());
      const div = document.createElement('div');
      div.setAttribute('style', 'line-height:1.1;font-weight:600;');
      if (this.options.allowUnsafeHTML) {
        div.innerHTML = parts[0] + '<span class="highlight">' + parts[1] + '</span>' + parts[2];
      } else {
        div.appendChild(document.createTextNode(parts[0]));
        if (parts[1]) {
          const highlight = document.createElement('span');
          highlight.textContent = parts[1];
          highlight.classList.add('highlight');
          highlight.setAttribute('style', 'color:red;');
          div.appendChild(highlight);
          div.appendChild(document.createTextNode(parts[2]));
        }
      }
      const description = document.createElement('small');
      description.setAttribute('style', 'line-height:1.3;color:grey;');
      description.innerText = 'This is a description...';

      item.querySelector('.item-text').appendChild(div);
      item.querySelector('.item-text').appendChild(description);
      return item;
    }
    _renderDropdown(inputText) {
      this._resetAutocomplete();

      let matchingData = this.options.data;
      if (!typeof this.options.onSearch) {
        // Default Search
        matchingData = this.options.data.filter(
          (entry) =>
            (entry.text || entry.id)
              .toString()
              .toLowerCase()
              .indexOf(inputText.toLowerCase()) !== -1
        );
        this.count = matchingData.length;
        // Sort
        if (this.options.sortFunction) {
          let sortFunctionBound = (a, b) => {
            return this.options.sortFunction(
              (a.text || a.id).toString().toLowerCase(),
              (b.text || b.id).toString().toLowerCase(),
              inputText.toLowerCase()
            );
          };
          matchingData.sort(sortFunctionBound);
        }
      }
      // Limit
      matchingData = matchingData.slice(0, this.options.limit);
      // Render
      for (let i = 0; i < matchingData.length; i++) {
        const item = this._createDropdownItem(matchingData[i], inputText);
        $(this.container).append(item);
      }
    }
    _setLoading() {
      const div = document.createElement('div');
      div.classList.add('status-info');
      div.setAttribute('style', 'position: absolute;right:0;top:0;');
      div.innerHTML = `<div style="height:50px;width:50px;"><svg version="1.1" id="L4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
      <circle fill="#888c" stroke="none" cx="6" cy="50" r="6"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.1"/></circle>
      <circle fill="#888c" stroke="none" cx="26" cy="50" r="6"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.2"/></circle>
      <circle fill="#888c" stroke="none" cx="46" cy="50" r="6"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite"  begin="0.3"/></circle>
    </svg></div>`;
      this._unsetLoading();
      this.el.parentElement.appendChild(div);
    }
    _unsetLoading() {
      this.el.parentElement.querySelectorAll('.status-info').forEach((el) => el.remove());
    }

    selectOption(id) {
      //console.log("Select Option...");
      const entries = this.options.data.filter((entry) => entry.id == id);
      if (entries.length === 0) return;
      const entry = entries[0];

      // Toggle Checkbox
      const li = this.container.querySelector('li[data-id="' + id + '"]');
      const checkbox = li.querySelector('input[type="checkbox"]');
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) this.selectedValues.push(entry);
      else this.selectedValues.filter((selectedEntry) => selectedEntry.id !== entry.id);
      //console.log(this);
      this.el.focus();

      //this.el.value = entry.text || entry.id;
      this.$el.trigger('change');
      if (!this.options.isMultipleSelect) {
        this._resetAutocomplete();
        this.close();
      }
      // Trigger Autocomplete Event
      if (typeof this.options.onAutocomplete === 'function')
        this.options.onAutocomplete.call(this, this.selectedValues);
    }
    open() {
      const inputText = this.el.value.toLowerCase();
      this._resetAutocomplete();
      if (inputText.length >= this.options.minLength) {
        this.isOpen = true;
        this._renderDropdown(inputText);
      }
      // Open dropdown
      if (!this.dropdown.isOpen) this.dropdown.open();
      else this.dropdown.recalculateDimensions(); // Recalculate dropdown when its already open
    }
    close() {
      this.dropdown.close();
    }
    updateData(data) {
      const inputText = this.el.value.toLowerCase();
      this.options.data = data;
      //if (this.isOpen)
      this._renderDropdown(inputText);
      this.open();
      if (typeof this.options.onSearch === 'function') {
        this._unsetLoading();
      }
    }
  }

  Autocomplete._keydown = false;
  M.Autocomplete = Autocomplete;
  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Autocomplete, 'autocomplete', 'M_Autocomplete');
  }
})(cash);
