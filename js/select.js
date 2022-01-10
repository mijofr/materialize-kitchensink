(function($) {
  'use strict';

  let _defaults = {
    classes: '',
    dropdownOptions: {}
  };

  class FormSelect extends Component {
    constructor(el, options) {
      super(FormSelect, el, options);
      if (this.$el.hasClass('browser-default')) return;
      this.el.M_FormSelect = this;
      this.options = $.extend({}, FormSelect.defaults, options);
      this.isMultiple = this.$el.prop('multiple');
      this.el.tabIndex = -1;

      this._selectedValues = [];
      this._values = [];

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
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_FormSelect;
    }
    destroy() {
      this._removeEventHandlers();
      this._removeDropdown();
      this.el.M_FormSelect = undefined;
    }
    _setupEventHandlers() {
      this._handleSelectChangeBound = this._handleSelectChange.bind(this);
      this._handleOptionClickBound = this._handleOptionClick.bind(this);
      this._handleInputClickBound = this._handleInputClick.bind(this);

      $(this.dropdownOptions)
        .find('li:not(.optgroup)')
        .each((el) => {
          el.addEventListener('click', this._handleOptionClickBound);
        });
      this.el.addEventListener('change', this._handleSelectChangeBound);
      this.input.addEventListener('click', this._handleInputClickBound);
    }
    _removeEventHandlers() {
      $(this.dropdownOptions)
        .find('li:not(.optgroup)')
        .each((el) => {
          el.removeEventListener('click', this._handleOptionClickBound);
        });
      this.el.removeEventListener('change', this._handleSelectChangeBound);
      this.input.removeEventListener('click', this._handleInputClickBound);
    }
    _handleSelectChange(e) {
      this._setValueToInput();
    }
    _handleOptionClick(e) {
      e.preventDefault();
      let optionEl = $(e.target).closest('li')[0];
      this._selectOptionElement(optionEl);
      e.stopPropagation();
    }

    _selectOptionElement(optionEl) {
      let key = optionEl.id;
      if (!$(optionEl).hasClass('disabled') && !$(optionEl).hasClass('optgroup') && key.length) {
        // let selected = true;
        if (this.isMultiple) {
          // Deselect placeholder option if still selected.
          // let placeholderOption = $(this.dropdownOptions).find('li.disabled.selected');
          // if (placeholderOption.length) {
          //   placeholderOption.removeClass('selected');
          //   placeholderOption.find('input[type="checkbox"]').prop('checked', false);
          //   this._toggleEntryFromArray(placeholderOption[0].id);
          // }
          // selected =
          this._toggleEntryFromArray(key);
        } else {
          // Single-Select
          $(this.dropdownOptions)
            .find('li')
            .removeClass('selected');
          $(optionEl).toggleClass('selected', selected);
          this._selectedValues = [];
          this._selectedValues.push(optionEl);
        }
        // Set selected on original select option
        // Only trigger if selected state changed
        // let prevSelected = $(this._values[key].el).prop('selected');
        // if (prevSelected !== selected) {
        //   $(this._values[key].el).prop('selected', selected);
        //   this.$el.trigger('change');
        // }
      }
      if (!this.isMultiple) this.dropdown.close();
    }

    _handleInputClick() {
      if (this.dropdown && this.dropdown.isOpen) {
        this._setValueToInput();
        this._setSelectedStates();
      }
    }

    _setupDropdown() {
      this.wrapper = document.createElement('div');
      $(this.wrapper).addClass('select-wrapper ' + this.options.classes);
      this.$el.before($(this.wrapper));

      // Move actual select element into overflow hidden wrapper
      let $hideSelect = $('<div class="hide-select"></div>');
      $(this.wrapper).append($hideSelect);
      $hideSelect[0].appendChild(this.el);

      if (this.el.disabled) this.wrapper.classList.add('disabled');

      // Create dropdown
      this.$selectOptions = this.$el.children('option, optgroup');
      this.dropdownOptions = document.createElement('ul');
      this.dropdownOptions.id = `select-options-${M.guid()}`;
      $(this.dropdownOptions).addClass(
        'dropdown-content select-dropdown ' + (this.isMultiple ? 'multiple-select-dropdown' : '')
      );

      // Create dropdown structure
      if (this.$selectOptions.length) {
        this.$selectOptions.each((el) => {
          if ($(el).is('option')) {
            // Direct descendant option
            const option = this._createOptionWithIcon(el, this.isMultiple ? 'multiple' : undefined);
            this._addOptionToValues(el, option);
          } else if ($(el).is('optgroup')) {
            // Optgroup
            let selectOptions = $(el).children('option');
            $(this.dropdownOptions).append(
              $('<li class="optgroup"><span>' + el.getAttribute('label') + '</span></li>')[0]
            );
            selectOptions.each((el) => {
              const option = this._createOptionWithIcon(el, 'optgroup-option');
              this._addOptionToValues(el, option);
            });
          }
        });
      }
      $(this.wrapper).append(this.dropdownOptions);

      // Add input dropdown
      this.input = document.createElement('input');
      $(this.input).addClass('select-dropdown dropdown-trigger');
      this.input.setAttribute('type', 'text');
      this.input.setAttribute('readonly', 'true');
      this.input.setAttribute('data-target', this.dropdownOptions.id);
      if (this.el.disabled) $(this.input).prop('disabled', 'true');

      $(this.wrapper).prepend(this.input);
      this._setValueToInput();

      // Add caret
      let dropdownIcon = $(
        '<svg class="caret" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
      );
      $(this.wrapper).prepend(dropdownIcon[0]);
      // Initialize dropdown
      if (!this.el.disabled) {
        let dropdownOptions = $.extend({}, this.options.dropdownOptions);
        let userOnOpenEnd = dropdownOptions.onOpenEnd;
        // Add callback for centering selected option when dropdown content is scrollable
        dropdownOptions.onOpenEnd = (el) => {
          let selectedOption = $(this.dropdownOptions)
            .find('.selected')
            .first();
          if (selectedOption.length) {
            // Focus selected option in dropdown
            M.keyDown = true;
            this.dropdown.focusedIndex = selectedOption.index();
            this.dropdown._focusFocusedItem();
            M.keyDown = false;
            // Handle scrolling to selected option
            if (this.dropdown.isScrollable) {
              let scrollOffset =
                selectedOption[0].getBoundingClientRect().top -
                this.dropdownOptions.getBoundingClientRect().top; // scroll to selected option
              scrollOffset -= this.dropdownOptions.clientHeight / 2; // center in dropdown
              this.dropdownOptions.scrollTop = scrollOffset;
            }
          }
          // Handle user declared onOpenEnd if needed
          if (userOnOpenEnd && typeof userOnOpenEnd === 'function')
            userOnOpenEnd.call(this.dropdown, this.el);
        };
        // Prevent dropdown from closing too early
        dropdownOptions.closeOnClick = false;
        this.dropdown = M.Dropdown.init(this.input, dropdownOptions);
      }
      // Add initial selections
      this._setSelectedStates();
    }

    _addOptionToValues(el, optionEl) {
      let index = this._values.length;
      let key = this.dropdownOptions.id + index;
      optionEl.id = key;
      this._values.push({ el, optionEl });
    }

    _removeDropdown() {
      $(this.wrapper)
        .find('.caret')
        .remove();
      $(this.input).remove();
      $(this.dropdownOptions).remove();
      $(this.wrapper).before(this.$el);
      $(this.wrapper).remove();
    }

    _createOptionWithIcon(option, type) {
      let disabledClass = option.disabled ? 'disabled ' : '';
      let optgroupClass = type === 'optgroup-option' ? 'optgroup-option ' : '';
      let multipleCheckbox = this.isMultiple
        ? `<label><input type="checkbox"${disabledClass}"/><span>${option.innerHTML}</span></label>`
        : option.innerHTML;
      let li = $('<li></li>');
      let span = $('<span></span>');
      span.html(multipleCheckbox);
      li.addClass(`${disabledClass} ${optgroupClass}`);
      li.append(span);
      // add icons
      let iconUrl = option.getAttribute('data-icon');
      let classes = option.getAttribute('class');
      if (iconUrl) {
        const img = $(`<img alt="" class="${classes}" src="${iconUrl}">`);
        li.prepend(img);
      }
      // Check for multiple type.
      $(this.dropdownOptions).append(li[0]);
      return li[0];
    }

    _toggleEntryFromArray(key) {
      const li = this._values.filter((value) => value.optionEl.id === key)[0];
      const isNotSelected =
        this._selectedValues.filter((value) => value.optionEl.id === key).length === 0;
      if (isNotSelected) {
        this._selectedValues.push(li);
      } else {
        this._selectedValues = this._selectedValues.filter((value) => value.optionEl.id !== key);
      }
      li.toggleClass('selected', isNotSelected);
      li.find('input[type="checkbox"]').prop('checked', isNotSelected);
      // use notAdded instead of true (to detect if the option is selected or not)
      li.prop('selected', isNotSelected);
      return isNotSelected;
    }

    _setValueToInput() {
      let values = [];
      let options = this.$el.find('option');
      options.each((el) => {
        if ($(el).prop('selected')) {
          let text = $(el)
            .text()
            .trim();
          values.push(text);
        }
      });
      if (!values.length) {
        let firstDisabled = this.$el.find('option:disabled').eq(0);
        if (firstDisabled.length && firstDisabled[0].value === '')
          values.push(firstDisabled.text());
      }
      this.input.value = values.join(', ');
    }

    _setSelectedStates() {
      this._selectedValues = [];
      this._values.forEach((option) => {
        const optionIsSelected = $(option.el).prop('selected');
        $(option.optionEl)
          .find('input[type="checkbox"]')
          .prop('checked', optionIsSelected);
        if (optionIsSelected) {
          this._activateOption($(this.dropdownOptions), $(option.optionEl));
          this._selectedValues.push(option);
        } else $(option.optionEl).removeClass('selected');
      });
    }

    // Make option as selected and scroll to selected position
    _activateOption(collection, newOption) {
      if (!newOption) return;
      if (!this.isMultiple) collection.find('li.selected').removeClass('selected');
      $(newOption).addClass('selected');
    }

    getSelectedValues() {
      return this._selectedValues;
    }
  }

  M.FormSelect = FormSelect;

  if (M.jQueryLoaded) M.initializeJqueryWrapper(FormSelect, 'formSelect', 'M_FormSelect');
})(cash);
