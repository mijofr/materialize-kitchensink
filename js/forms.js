(function($) {

  M.textareaAutoResize = function($textarea) {
    // Wrap if native element
    if ($textarea instanceof Element) {
      $textarea = $($textarea);
    }

    if (!$textarea.length) {
      console.error('No textarea element found');
      return;
    }

    // Textarea Auto Resize
    let hiddenDiv = $('.hiddendiv').first();
    if (!hiddenDiv.length) {
      hiddenDiv = $('<div class="hiddendiv common"></div>');
      $('body').append(hiddenDiv);
    }

    // Set font properties of hiddenDiv
    const fontFamily = $textarea.css('font-family');
    const fontSize = $textarea.css('font-size');
    const lineHeight = $textarea.css('line-height');
    // Firefox can't handle padding shorthand.
    const paddingTop = $textarea.css('padding-top');
    const paddingRight = $textarea.css('padding-right');
    const paddingBottom = $textarea.css('padding-bottom');
    const paddingLeft = $textarea.css('padding-left');

    if (fontSize) hiddenDiv.css('font-size', fontSize);
    if (fontFamily) hiddenDiv.css('font-family', fontFamily);
    if (lineHeight) hiddenDiv.css('line-height', lineHeight);
    if (paddingTop) hiddenDiv.css('padding-top', paddingTop);
    if (paddingRight) hiddenDiv.css('padding-right', paddingRight);
    if (paddingBottom) hiddenDiv.css('padding-bottom', paddingBottom);
    if (paddingLeft) hiddenDiv.css('padding-left', paddingLeft);

    // Set original-height, if none
    if (!$textarea.data('original-height')) {
      $textarea.data('original-height', $textarea.height());
    }

    if ($textarea.attr('wrap') === 'off') {
      hiddenDiv.css('overflow-wrap', 'normal').css('white-space', 'pre');
    }

    hiddenDiv.text($textarea[0].value + '\n');
    let content = hiddenDiv.html().replace(/\n/g, '<br>');
    hiddenDiv.html(content);

    // When textarea is hidden, width goes crazy.
    // Approximate with half of window size

    if ($textarea[0].offsetWidth > 0 && $textarea[0].offsetHeight > 0) {
      hiddenDiv.css('width', $textarea.width() + 'px');
    } else {
      hiddenDiv.css('width', window.innerWidth / 2 + 'px');
    }

    /**
     * Resize if the new height is greater than the
     * original height of the textarea
     */
    if ($textarea.data('original-height') <= hiddenDiv.innerHeight()) {
      $textarea.css('height', hiddenDiv.innerHeight() + 'px');
    } else if ($textarea[0].value.length < $textarea.data('previous-length')) {
      /**
       * In case the new height is less than original height, it
       * means the textarea has less text than before
       * So we set the height to the original one
       */
      $textarea.css('height', $textarea.data('original-height') + 'px');
    }
    $textarea.data('previous-length', $textarea[0].value.length);
  };

  $(document).ready(function() {

    // Radio and Checkbox focus class
    let radio_checkbox = 'input[type=radio], input[type=checkbox]';
    $(document).on('keyup', radio_checkbox, function(e) {
      // TAB, check if tabbing to radio or checkbox.
      if (e.which === M.keys.TAB) {
        $(this).addClass('tabbed');
        let $this = $(this);
        $this.one('blur', function(e) {
          $(this).removeClass('tabbed');
        });
        return;
      }
    });

    const text_area_selector = '.materialize-textarea';
    $(text_area_selector).each(function() {
      let $textarea = $(this);
      /**
       * Resize textarea on document load after storing
       * the original height and the original length
       */
      $textarea.data('original-height', $textarea.height());
      $textarea.data('previous-length', this.value.length);
      M.textareaAutoResize($textarea);
    });

    $(document).on('keyup', text_area_selector, function() {
      M.textareaAutoResize($(this));
    });
    $(document).on('keydown', text_area_selector, function() {
      M.textareaAutoResize($(this));
    });


    // File Input Path
    $(document).on('change', '.file-field input[type="file"]', function() {
      let file_field = $(this).closest('.file-field');
      let path_input = file_field.find('input.file-path');
      let files = $(this)[0].files;
      let file_names = [];
      for (let i = 0; i < files.length; i++) {
        file_names.push(files[i].name);
      }
      path_input[0].value = file_names.join(', ');
      path_input.trigger('change');
    });

  }); // End of $(document).ready
})(cash);
