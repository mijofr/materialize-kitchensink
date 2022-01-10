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
      let virtualOption = $(e.target).closest('li')[0];
      this._selectOptionElement(virtualOption);
      e.stopPropagation();
    }
    _selectOptionElement(virtualOption) {
      console.log('Selected an Option Element');
      console.log(virtualOption);
      //const key = optionElement.id;
      //console.log(key);
      if (
        !$(virtualOption).hasClass('disabled') &&
        !$(virtualOption).hasClass('optgroup') /* && key.length*/
      ) {
        //console.log(">>>");
        const value = this._values.filter((value) => value.optionEl === virtualOption)[0];
        //console.log(value);

        let selected = true;
        if (this.isMultiple) {
          // Deselect placeholder option if still selected.
          // let placeholderOption = $(this.dropdownOptions).find('li.disabled.selected');
          // if (placeholderOption.length) {
          //   placeholderOption.removeClass('selected');
          //   placeholderOption.find('input[type="checkbox"]').prop('checked', false);
          //   this._toggleEntryFromArray(placeholderOption[0].id);
          // }
          selected = this._toggleEntryFromArray(value);
          this._setValueToInput();
        } else {
          // Single-Select
          //console.log("Single-Select");
          //console.log(optionElement);
          //$(this.dropdownOptions).find('li').removeClass('selected');
          //$(virtualOption).toggleClass('selected', selected);
          this._deselectAll();
          value.el.setAttribute('selected', 'selected');
          // TODO: Mark as selected
          this._setValueToInput();
        }
        // Set selected on original select option
        // Only trigger if selected state changed
        // let prevSelected = $(this._values.filter(value => value.el === key)).prop('selected');
        // if (prevSelected !== selected) {
        //   $(this._values[key].el).prop('selected', selected);
        //   this.$el.trigger('change');
        // }
      }
      if (!this.isMultiple) this.dropdown.close();
    }

    _handleInputClick() {
      //console.log("Clicked on SelectBox.")
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
            // Option
            const option = this._createAndAppendOptionWithIcon(
              el,
              this.isMultiple ? 'multiple' : undefined
            );
            this._addOptionToValues(el, option);
          } else if ($(el).is('optgroup')) {
            // Optgroup
            let selectOptions = $(el).children('option');
            $(this.dropdownOptions).append(
              $('<li class="optgroup"><span>' + el.getAttribute('label') + '</span></li>')[0]
            );
            selectOptions.each((el) => {
              const option = this._createAndAppendOptionWithIcon(el, 'optgroup-option');
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

    _addOptionToValues(el, optionElement) {
      this._values.push({ el, optionEl: optionElement });
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

    _createAndAppendOptionWithIcon(option, type) {
      const li = document.createElement('li');
      if (option.disabled) li.classList.add('disabled');
      if (type === 'optgroup-option') li.classList.add(type);
      // Text / Checkbox
      const span = document.createElement('span');
      if (this.isMultiple)
        span.innerHTML = `<label><input type="checkbox"${
          option.disabled ? ' disabled="disabled"' : ''
        }><span>${option.innerHTML}</span></label>`;
      else span.innerHTML = option.innerHTML;
      li.appendChild(span);
      // add Icon
      const iconUrl = option.getAttribute('data-icon');
      const classes = option.getAttribute('class');
      if (iconUrl) {
        const img = $(`<img alt="" class="${classes}" src="${iconUrl}">`);
        li.prepend(img[0]);
      }
      // Check for multiple type
      $(this.dropdownOptions).append(li);
      return li;
    }

    _deselectValue(value) {
      value.optionEl.classList.remove('selected');
      value.el.removeAttribute('selected');
    }
    _deselectAll() {
      this._values.forEach((value) => {
        this._deselectValue(value);
      });
    }

    _toggleEntryFromArray(value) {
      const li = value.optionEl;
      const isSelected = li.classList.contains('selected');
      //console.log("Toggle", value, isSelected);
      if (isSelected) {
        value.el.removeAttribute('selected');
        li.classList.remove('selected');
        li.removeAttribute('selected');
      } else {
        value.el.setAttribute('selected', 'selected');
        li.classList.add('selected');
        li.setAttribute('selected', 'selected');
      }
      li.querySelector('input[type="checkbox"]').checked = !isSelected;
      return isSelected;
    }

    _setValueToInput() {
      // console.log('👉 Set Value to Input!');
      const texts = this._values
        .filter((value) => value.el.hasAttribute('selected') && !value.el.hasAttribute('disabled'))
        .map((value) => value.optionEl.querySelector('span').innerText.trim());
      this.input.value = texts.join(', ');
      // let values = [];
      // let options = this.$el.find('option');
      // console.log(options);
      // options.each((el) => {
      //   if ($(el).prop('selected')) {
      //     let text = $(el)
      //       .text()
      //       .trim();
      //     values.push(text);
      //   }
      // });
      // if (!values.length) {
      //   let firstDisabled = this.$el.find('option:disabled').eq(0);
      //   if (firstDisabled.length && firstDisabled[0].value === '')
      //     values.push(firstDisabled.text());
      // }
      // this.input.value = values.join(', ');
    }

    _setSelectedStates() {
      this._values.forEach((option) => {
        const optionIsSelected = $(option.el).prop('selected');
        $(option.optionEl)
          .find('input[type="checkbox"]')
          .prop('checked', optionIsSelected);

        if (optionIsSelected) {
          this._activateOption($(this.dropdownOptions), $(option.optionEl));
          //this._selectedValues.push(option);
        } else $(option.optionEl).removeClass('selected');
      });
    }

    // Make option as selected and scroll to selected position
    _activateOption(ul, option) {
      if (!option) return;
      if (!this.isMultiple) ul.find('li.selected').removeClass('selected');
      $(option).addClass('selected');
    }

    getSelectedValues() {
      return this._values.filter((value) => value.isSelected);
    }
  }

  M.FormSelect = FormSelect;

  if (M.jQueryLoaded) M.initializeJqueryWrapper(FormSelect, 'formSelect', 'M_FormSelect');
})(cash);
