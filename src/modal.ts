import anim from "animejs";

import { M } from "./global";
import { Component, BaseOptions, InitElements } from "./component";

export interface ModalOptions extends BaseOptions {
  /**
   * Opacity of the modal overlay.
   * @default 0.5
   */
  opacity: number;
  /**
   * Transition in duration in milliseconds.
   * @default 250
   */
  inDuration: number;
  /**
   * Transition out duration in milliseconds.
   * @default 250
   */
  outDuration: number;
  /**
   * Prevent page from scrolling while modal is open.
   * @default true
   */
  preventScrolling: boolean;
  /**
   * Callback function called before modal is opened.
   * @default null
   */
  onOpenStart: (this: Modal, el: HTMLElement) => void;
  /**
   * Callback function called after modal is opened.
   * @default null
   */
  onOpenEnd: (this: Modal, el: HTMLElement) => void;
  /**
   * Callback function called before modal is closed.
   * @default null
   */
  onCloseStart: (el: HTMLElement) => void;
  /**
   * Callback function called after modal is closed.
   * @default null
   */
  onCloseEnd: (el: HTMLElement) => void;
  /**
   * Allow modal to be dismissed by keyboard or overlay click.
   * @default true
   */
  dismissible: boolean;
  /**
   * Starting top offset.
   * @default '4%'
   */
  startingTop: string;
  /**
   * Ending top offset.
   * @default '10%'
   */
  endingTop: string;
}

const _defaults = {
  opacity: 0.5,
  inDuration: 250,
  outDuration: 250,
  onOpenStart: null,
  onOpenEnd: null,
  onCloseStart: null,
  onCloseEnd: null,
  preventScrolling: true,
  dismissible: true,
  startingTop: '4%',
  endingTop: '10%'
};

export class Modal extends Component<ModalOptions> {

  static _modalsOpen: number;
  static _count: number;
  
  /**
   * ID of the modal element.
   */
  id: string;
  /**
   * If the modal is open.
   */
  isOpen: boolean;
  
  private _openingTrigger: any;
  private _overlay: HTMLElement;
  private _nthModalOpened: number;

  constructor(el: HTMLElement, options: Partial<ModalOptions>) {
    super(el, options, Modal);
    (this.el as any).M_Modal = this;

    this.options = {
      ...Modal.defaults,
      ...options
    };
    
    this.isOpen = false;
    this.id = this.el.id;
    this._openingTrigger = undefined;
    this._overlay = document.createElement('div');
    this._overlay.classList.add('modal-overlay');
    this.el.tabIndex = 0;
    this._nthModalOpened = 0;
    Modal._count++;
    this._setupEventHandlers();
  }

  static get defaults() {
    return _defaults;
  }

  /**
   * Initializes instance of Modal.
   * @param el HTML element.
   * @param options Component options.
   */
  static init(el: HTMLElement, options: Partial<ModalOptions>): Modal;
  /**
   * Initializes instances of Modal.
   * @param els HTML elements.
   * @param options Component options.
   */
  static init(els: InitElements<HTMLElement>, options: Partial<ModalOptions>): Modal[];
  /**
   * Initializes instances of Modal.
   * @param els HTML elements.
   * @param options Component options.
   */
  static init(els: HTMLElement | InitElements<HTMLElement>, options: Partial<ModalOptions>): Modal | Modal[] {
    return super.init(els, options, Modal);
  }

  static getInstance(el: HTMLElement): Modal {
    return (el as any).M_Modal;
  }

  destroy() {
    Modal._count--;
    this._removeEventHandlers();
    this.el.removeAttribute('style');
    this._overlay.remove();
    (this.el as any).M_Modal = undefined;
  }

  _setupEventHandlers() {
    if (Modal._count === 1) {
      document.body.addEventListener('click', this._handleTriggerClick);
    }
    this._overlay.addEventListener('click', this._handleOverlayClick);
    this.el.addEventListener('click', this._handleModalCloseClick);
  }

  _removeEventHandlers() {
    if (Modal._count === 0) {
      document.body.removeEventListener('click', this._handleTriggerClick);
    }
    this._overlay.removeEventListener('click', this._handleOverlayClick);
    this.el.removeEventListener('click', this._handleModalCloseClick);
  }

  _handleTriggerClick = (e: MouseEvent) => {
    const trigger = (e.target as HTMLElement).closest('.modal-trigger');
    if (!trigger) return;
    const modalId = M.getIdFromTrigger(trigger as HTMLElement);
    const modalInstance = (document.getElementById(modalId) as any).M_Modal;
    if (modalInstance) modalInstance.open(trigger);
    e.preventDefault();
  }

  _handleOverlayClick = () => {
    if (this.options.dismissible) this.close();
  }

  _handleModalCloseClick = (e: MouseEvent) => {
    const closeTrigger = (e.target as HTMLElement).closest('.modal-close');
    if (closeTrigger) this.close();
  }

  _handleKeydown = (e: KeyboardEvent) => {
    if (M.keys.ESC.includes(e.key) && this.options.dismissible) this.close();
  }

  _handleFocus = (e: FocusEvent) => {
    // Only trap focus if this modal is the last model opened (prevents loops in nested modals).
    if (!this.el.contains(e.target as HTMLElement) && this._nthModalOpened === Modal._modalsOpen) {
      this.el.focus();
    }
  }

  _animateIn() {
    // Set initial styles
    this.el.style.display = 'block';
    this.el.style.opacity = '0';
    this._overlay.style.display = 'block';
    this._overlay.style.opacity = '0';
    // Animate overlay
    anim({
      targets: this._overlay,
      opacity: this.options.opacity,
      duration: this.options.inDuration,
      easing: 'easeOutQuad'
    });
    // Define modal animation options
    const enterAnimOptions = {
      targets: this.el,
      duration: this.options.inDuration,
      easing: 'easeOutCubic',
      // Handle modal onOpenEnd callback
      complete: () => {
        if (typeof this.options.onOpenEnd === 'function') {
          this.options.onOpenEnd.call(this, this.el, this._openingTrigger);
        }
      }
    };
    // Bottom sheet animation
    if (this.el.classList.contains('bottom-sheet')) {
      enterAnimOptions['bottom'] = 0;
      enterAnimOptions['opacity'] = 1;
    }
    // Normal modal animation
    else {
      enterAnimOptions['top'] = [this.options.startingTop, this.options.endingTop];
      enterAnimOptions['opacity'] = 1;
      enterAnimOptions['scaleX'] = [0.8, 1];
      enterAnimOptions['scaleY'] = [0.8, 1];
    }
    anim(enterAnimOptions);
  }

  _animateOut() {
    // Animate overlay
    anim({
      targets: this._overlay,
      opacity: 0,
      duration: this.options.outDuration,
      easing: 'easeOutQuart'
    });
    // Define modal animation options
    const exitAnimOptions = {
      targets: this.el,
      duration: this.options.outDuration,
      easing: 'easeOutCubic',
      // Handle modal ready callback
      complete: () => {
        this.el.style.display = 'none';
        this._overlay.remove();
        // Call onCloseEnd callback
        if (typeof this.options.onCloseEnd === 'function') {
          this.options.onCloseEnd.call(this, this.el);
        }
      }
    };
    // Bottom sheet animation
    if (this.el.classList.contains('bottom-sheet')) {
      exitAnimOptions['bottom'] = '-100%';
      exitAnimOptions['opacity'] = 0;
    }
    // Normal modal animation
    else {
      exitAnimOptions['top'] = [this.options.endingTop, this.options.startingTop];
      exitAnimOptions['opacity'] = 0;
      exitAnimOptions['scaleX'] = 0.8;
      exitAnimOptions['scaleY'] = 0.8;
    }
    anim(exitAnimOptions);
  }

  /**
   * Open modal.
   */
  open = (trigger?: HTMLElement): Modal => {
    if (this.isOpen) return;
    this.isOpen = true;
    Modal._modalsOpen++;
    this._nthModalOpened = Modal._modalsOpen;
    // Set Z-Index based on number of currently open modals
    this._overlay.style.zIndex = (1000 + Modal._modalsOpen * 2).toString();
    this.el.style.zIndex = (1000 + Modal._modalsOpen * 2 + 1).toString();
    // Set opening trigger, undefined indicates modal was opened by javascript
    this._openingTrigger = !!trigger ? trigger : undefined;
    // onOpenStart callback
    if (typeof this.options.onOpenStart === 'function') {
      this.options.onOpenStart.call(this, this.el, this._openingTrigger);
    }
    if (this.options.preventScrolling) {
      document.body.style.overflow = 'hidden';
    }
    this.el.classList.add('open');
    this.el.insertAdjacentElement('afterend', this._overlay);
    if (this.options.dismissible) {
      document.addEventListener('keydown', this._handleKeydown);
      document.addEventListener('focus', this._handleFocus, true);
    }
    anim.remove(this.el);
    anim.remove(this._overlay);
    this._animateIn();
    // Focus modal
    this.el.focus();
    return this;
  }

  /**
   * Close modal.
   */
  close = () => {
    if (!this.isOpen) return;
    this.isOpen = false;
    Modal._modalsOpen--;
    this._nthModalOpened = 0;
    // Call onCloseStart callback
    if (typeof this.options.onCloseStart === 'function') {
      this.options.onCloseStart.call(this, this.el);
    }
    this.el.classList.remove('open');
    // Enable body scrolling only if there are no more modals open.
    if (Modal._modalsOpen === 0) {
      document.body.style.overflow = '';
    }
    if (this.options.dismissible) {
      document.removeEventListener('keydown', this._handleKeydown);
      document.removeEventListener('focus', this._handleFocus, true);
    }
    anim.remove(this.el);
    anim.remove(this._overlay);
    this._animateOut();
    return this;
  }

  static{
    Modal._modalsOpen = 0;
    Modal._count = 0;
  }
}
