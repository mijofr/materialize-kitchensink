import { M } from "./global";

// TODO: !!!

export class Forms {

  static textareaAutoResize(textarea: HTMLTextAreaElement) {
    if (!textarea) {
      console.error('No textarea element found');
      return;
    }
    // Textarea Auto Resize
    let hiddenDiv: HTMLDivElement = document.querySelector('.hiddendiv');
    if (!hiddenDiv) {
      hiddenDiv = document.createElement('div');
      hiddenDiv.classList.add('hiddendiv', 'common');
      document.body.append(hiddenDiv);
    }
    const style = getComputedStyle(textarea);
    // Set font properties of hiddenDiv
    const fontFamily = style.fontFamily; //textarea.css('font-family');
    const fontSize = style.fontSize; //textarea.css('font-size');
    const lineHeight = style.lineHeight; //textarea.css('line-height');
    // Firefox can't handle padding shorthand.
    const paddingTop = style.paddingTop; //getComputedStyle(textarea).css('padding-top');
    const paddingRight = style.paddingRight; //textarea.css('padding-right');
    const paddingBottom = style.paddingBottom; //textarea.css('padding-bottom');
    const paddingLeft = style.paddingLeft; //textarea.css('padding-left');

    if (fontSize) hiddenDiv.style.fontSize = fontSize; //('font-size', fontSize);
    if (fontFamily) hiddenDiv.style.fontFamily = fontFamily; //css('font-family', fontFamily);
    if (lineHeight) hiddenDiv.style.lineHeight = lineHeight; //css('line-height', lineHeight);    
    if (paddingTop) hiddenDiv.style.paddingTop = paddingTop; //ss('padding-top', paddingTop);    
    if (paddingRight) hiddenDiv.style.paddingRight = paddingRight; //css('padding-right', paddingRight);    
    if (paddingBottom) hiddenDiv.style.paddingBottom = paddingBottom; //css('padding-bottom', paddingBottom);    
    if (paddingLeft) hiddenDiv.style.paddingLeft = paddingLeft; //css('padding-left', paddingLeft);    

    // Set original-height, if none
    //if (!textarea.data('original-height')) textarea.data('original-height', textarea.height());

    if (textarea.getAttribute('wrap') === 'off') {
      hiddenDiv.style.overflowWrap = 'normal'; // ('overflow-wrap', 'normal')
      hiddenDiv.style.whiteSpace = 'pre';  //.css('white-space', 'pre');
    }

    hiddenDiv.innerText = textarea.value + '\n';

    const content = hiddenDiv.innerHTML.replace(/\n/g, '<br>');
    hiddenDiv.innerHTML = content;

    // When textarea is hidden, width goes crazy.
    // Approximate with half of window size

    // if (textarea.offsetWidth > 0 && textarea.offsetHeight > 0) {
    //   hiddenDiv.css('width', textarea.width() + 'px');
    // }
    // else {
    //   hiddenDiv.css('width', window.innerWidth / 2 + 'px');
    // }

    /**
     * Resize if the new height is greater than the
     * original height of the textarea
     */

    // if (textarea.data('original-height') <= hiddenDiv.innerHeight()) {
    //   textarea.css('height', hiddenDiv.innerHeight() + 'px');
    // }
    // else if (textarea[0].value.length < textarea.data('previous-length')) {
    //   /**
    //    * In case the new height is less than original height, it
    //    * means the textarea has less text than before
    //    * So we set the height to the original one
    //    */
    //   textarea.css('height', textarea.data('original-height') + 'px');
    // }
    // textarea.data('previous-length', textarea[0].value.length);

  };


  static Init(){
    document.addEventListener("DOMContentLoaded", () => {

      document.addEventListener('keyup', e => {
        const target = <HTMLInputElement>e.target;

        // Radio and Checkbox focus class
        if (target instanceof HTMLInputElement && ['radio','checkbox'].includes(target.type)) {
          // TAB, check if tabbing to radio or checkbox.
          if (e.which === M.keys.TAB) {
            target.classList.add('tabbed');
            target.addEventListener('blur', e => target.classList.remove('tabbed'), {once: true});
          }
        }

      });  

      /*
      document.querySelectorAll('.materialize-textarea').forEach((textArea: HTMLTextAreaElement) => {
        textArea.data('original-height', textArea.height);
        textArea.data('previous-length', textArea.value.length);
        Forms.textareaAutoResize(textArea);
      });
      $(document).on('keyup', text_area_selector, () => Forms.textareaAutoResize($(this)));
      $(document).on('keydown', text_area_selector, () => Forms.textareaAutoResize($(this)));
  

      // File Input Path
      $(document).on('change', '.file-field input[type="file"]', function() {
        let file_field = $(this).closest('.file-field');
        let path_input = file_field.find('input.file-path');
        let files = ($(this)[0] as HTMLInputElement).files;
        let file_names = [];
        for (let i = 0; i < files.length; i++) {
          file_names.push(files[i].name);
        }
        (path_input[0] as HTMLInputElement).value = file_names.join(', ');
        path_input.trigger('change');
      });
      */

    });
  }
}

  