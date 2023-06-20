import { Autocomplete } from './autocomplete';
import { Bounding } from './bounding';
import { FloatingActionButton } from './buttons';
import { Cards } from './cards';
import { Carousel } from './carousel';
import { CharacterCounter } from './characterCounter';
import { Chips } from './chips';
import { Collapsible } from './collapsible';
import { Datepicker } from './datepicker';
import { Dropdown } from './dropdown';
import { Edges } from './edges';
import { Forms } from './forms';
import { Materialbox } from './materialbox';
import { Modal } from './modal';
import { Parallax } from './parallax';
import { Pushpin } from './pushpin';
import { ScrollSpy } from './scrollspy';
import { FormSelect } from './select';
import { Sidenav } from './sidenav';
import { Slider } from './slider';
import { Tabs } from './tabs';
import { TapTarget } from './tapTarget';
import { Timepicker } from './timepicker';
import { Toast } from './toasts';
import { Tooltip } from './tooltip';
import { Waves } from './waves';
import { Range } from './range';

export class M {
  static version = '2.0.1-alpha';

  static keys = {
    TAB: ['Tab'],
    ENTER: ['Enter'],
    ESC: ['Escape', 'Esc'],
    BACKSPACE: ['Backspace'],
    ARROW_UP: ['ArrowUp', 'Up'],
    ARROW_DOWN: ['ArrowDown', 'Down'],
    ARROW_LEFT: ['ArrowLeft', 'Left'],
    ARROW_RIGHT: ['ArrowRight', 'Right'],
    DELETE: ['Delete', 'Del'],
  };

  static Autocomplete: typeof Autocomplete = Autocomplete;
  static Tabs: typeof Tabs = Tabs;
  static Carousel: typeof Carousel = Carousel;
  static Dropdown: typeof Dropdown = Dropdown;
  static FloatingActionButton: typeof FloatingActionButton = FloatingActionButton;
  static Chips: typeof Chips = Chips;
  static Collapsible: typeof Collapsible = Collapsible;
  static Datepicker: typeof Datepicker = Datepicker;
  static CharacterCounter: typeof CharacterCounter = CharacterCounter;
  static FormSelect: typeof FormSelect = FormSelect;
  static Modal: typeof Modal = Modal;
  static Pushpin: typeof Pushpin = Pushpin;
  static Materialbox: typeof Materialbox = Materialbox;
  static Parallax: typeof Parallax = Parallax;
  static Slider: typeof Slider = Slider;
  static Timepicker: typeof Timepicker = Timepicker;
  static toast: (opt: any) => Toast = (opt) => new Toast(opt) ;
  static Tooltip: typeof Tooltip = Tooltip;
  static Sidenav: typeof Sidenav = Sidenav;
  static TapTarget: typeof TapTarget = TapTarget;
  static ScrollSpy: typeof ScrollSpy = ScrollSpy;
  static Range: typeof Range = Range;
  static Waves: typeof Waves = Waves;

  static tabPressed: boolean = false;
  static keyDown: boolean = false;

  static docHandleKeydown(e: KeyboardEvent) {
    M.keyDown = true;
    if ([...M.keys.TAB, ...M.keys.ARROW_DOWN, ...M.keys.ARROW_UP].includes(e.key)) {
      M.tabPressed = true;
    }
  }

  static docHandleKeyup(e: KeyboardEvent) {
    M.keyDown = false;
    if ([...M.keys.TAB, ...M.keys.ARROW_DOWN, ...M.keys.ARROW_UP].includes(e.key)) {
      M.tabPressed = false;
    }
  }

  static docHandleFocus(e) {
    if (M.keyDown) {
      document.body.classList.add('keyboard-focused');
    }
  }

  static docHandleBlur(e) {
    document.body.classList.remove('keyboard-focused');
  }

  static {
    document.addEventListener('keydown', this.docHandleKeydown, true);
    document.addEventListener('keyup', this.docHandleKeyup, true);
    document.addEventListener('focus', this.docHandleFocus, true);
    document.addEventListener('blur', this.docHandleBlur, true);
    this.initializeJqueryWrapper(Tabs, 'tabs', 'M_Tabs');
    this.initializeJqueryWrapper(Carousel, 'carousel', 'M_Carousel');
    this.initializeJqueryWrapper(Autocomplete, 'autocomplete', 'M_Autocomplete');
    this.initializeJqueryWrapper(Dropdown, 'dropdown', 'M_Dropdown');
    this.initializeJqueryWrapper(FloatingActionButton, 'floatingActionButton', 'M_FloatingActionButton');
    M.initializeJqueryWrapper(Collapsible, 'collapsible', 'M_Collapsible');
    M.initializeJqueryWrapper(CharacterCounter, 'characterCounter', 'M_CharacterCounter');
    M.initializeJqueryWrapper(Datepicker, 'datepicker', 'M_Datepicker');
    M.initializeJqueryWrapper(FormSelect, 'formSelect', 'M_FormSelect');
    M.initializeJqueryWrapper(Modal, 'modal', 'M_Modal');
    M.initializeJqueryWrapper(Pushpin, 'pushpin', 'M_Pushpin');
    M.initializeJqueryWrapper(Materialbox, 'materialbox', 'M_Materialbox');
    M.initializeJqueryWrapper(Parallax, 'parallax', 'M_Parallax');
    M.initializeJqueryWrapper(Slider, 'slider', 'M_Slider');
    M.initializeJqueryWrapper(Timepicker, 'timepicker', 'M_Timepicker');
    M.initializeJqueryWrapper(Tooltip, 'tooltip', 'M_Tooltip');
    M.initializeJqueryWrapper(TapTarget, 'tapTarget', 'M_TapTarget');
    M.initializeJqueryWrapper(Sidenav, 'sidenav', 'M_Sidenav');
    M.initializeJqueryWrapper(ScrollSpy, 'scrollSpy', 'M_ScrollSpy');
    M.initializeJqueryWrapper(Range, 'range', 'M_Range');
    M.initializeJqueryWrapper(Chips, 'chips', 'M_Chips');
    Cards.Init();
    Forms.Init();
    Chips.Init();
    Waves.Init();
    Range.Init();
  }

  //--- TODO: Remove!
  static jQueryLoaded(): boolean {
    return !!(<any>window).jQuery;
  }
  static initializeJqueryWrapper(plugin: any, pluginName: string, classRef: string) {
    if (!this.jQueryLoaded())
      return;
    var jq = (<any>window).jQuery;

    jq.fn[pluginName] = function(methodOrOptions) {
      // Call plugin method if valid method name is passed in
      if (plugin.prototype[methodOrOptions]) {
        let params = Array.prototype.slice.call(arguments, 1);
        // Getter methods
        if (methodOrOptions.slice(0, 3) === 'get') {
          let instance = this.first()[0][classRef];
          return instance[methodOrOptions].apply(instance, params);
        }
        // Void methods
        return this.each(function() {
          let instance = this[classRef];
          instance[methodOrOptions].apply(instance, params);
        });
        // Initialize plugin if options or no argument is passed in
      } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
        plugin.init(this, arguments[0]);
        return this;
      }
      // Return error if an unrecognized  method name is passed in
      jq.error(`Method ${methodOrOptions} does not exist on jQuery.${pluginName}`);
    };
  }
  //---

  /**
   * Automatically initialize components.
   * @param context Root element to initialize. Defaults to `document.body`.
   */
  static AutoInit(context: HTMLElement = document.body) {
    let root = context;
    let registry = {
      Autocomplete: <NodeListOf<HTMLElement>>root.querySelectorAll('.autocomplete:not(.no-autoinit)'),
      Carousel: <NodeListOf<HTMLElement>>root.querySelectorAll('.carousel:not(.no-autoinit)'),
      Chips: <NodeListOf<HTMLElement>>root.querySelectorAll('.chips:not(.no-autoinit)'),
      Collapsible: <NodeListOf<HTMLElement>>root.querySelectorAll('.collapsible:not(.no-autoinit)'),
      Datepicker: <NodeListOf<HTMLElement>>root.querySelectorAll('.datepicker:not(.no-autoinit)'),
      Dropdown: <NodeListOf<HTMLElement>>root.querySelectorAll('.dropdown-trigger:not(.no-autoinit)'),
      Materialbox: <NodeListOf<HTMLElement>>root.querySelectorAll('.materialboxed:not(.no-autoinit)'),
      Modal: <NodeListOf<HTMLElement>>root.querySelectorAll('.modal:not(.no-autoinit)'),
      Parallax: <NodeListOf<HTMLElement>>root.querySelectorAll('.parallax:not(.no-autoinit)'),
      Pushpin: <NodeListOf<HTMLElement>>root.querySelectorAll('.pushpin:not(.no-autoinit)'),
      ScrollSpy: <NodeListOf<HTMLElement>>root.querySelectorAll('.scrollspy:not(.no-autoinit)'),
      FormSelect: <NodeListOf<HTMLElement>>root.querySelectorAll('select:not(.no-autoinit)'),
      Sidenav: <NodeListOf<HTMLElement>>root.querySelectorAll('.sidenav:not(.no-autoinit)'),
      Tabs: <NodeListOf<HTMLElement>>root.querySelectorAll('.tabs:not(.no-autoinit)'),
      TapTarget: <NodeListOf<HTMLElement>>root.querySelectorAll('.tap-target:not(.no-autoinit)'),
      Timepicker: <NodeListOf<HTMLElement>>root.querySelectorAll('.timepicker:not(.no-autoinit)'),
      Tooltip: <NodeListOf<HTMLElement>>root.querySelectorAll('.tooltipped:not(.no-autoinit)'),
      FloatingActionButton: <NodeListOf<HTMLElement>>root.querySelectorAll('.fixed-action-btn:not(.no-autoinit)'),
    };
    M.Autocomplete.init(registry.Autocomplete, {});
    M.Carousel.init(registry.Carousel, {});
    M.Chips.init(registry.Chips, {});
    M.Collapsible.init(registry.Collapsible, {});
    M.Datepicker.init(registry.Datepicker, {});
    M.Dropdown.init(registry.Dropdown, {});
    M.Materialbox.init(registry.Materialbox, {});
    M.Modal.init(registry.Modal, {});
    M.Parallax.init(registry.Parallax, {});
    M.Pushpin.init(registry.Pushpin, {});
    M.ScrollSpy.init(registry.ScrollSpy, {});
    M.FormSelect.init(registry.FormSelect, {});
    M.Sidenav.init(registry.Sidenav, {});
    M.Tabs.init(registry.Tabs, {});
    M.TapTarget.init(registry.TapTarget, {});
    M.Timepicker.init(registry.Timepicker, {});
    M.Tooltip.init(registry.Tooltip, {});
    M.FloatingActionButton.init(registry.FloatingActionButton, {});
  }

  static objectSelectorString(obj: any): string {
    let tagStr = obj.prop('tagName') || '';
    let idStr = obj.attr('id') || '';
    let classStr = obj.attr('class') || '';
    return (tagStr + idStr + classStr).replace(/\s/g, '');
  }

  static guid(): string {
    function s4():string {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  static checkWithinContainer(container: Element, bounding: Bounding, offset: number): Edges {
    let edges = {
      top: false,
      right: false,
      bottom: false,
      left: false
    };

    let containerRect = container.getBoundingClientRect();
    // If body element is smaller than viewport, use viewport height instead.
    let containerBottom =
      container === document.body
        ? Math.max(containerRect.bottom, window.innerHeight)
        : containerRect.bottom;

    let scrollLeft = container.scrollLeft;
    let scrollTop = container.scrollTop;

    let scrolledX = bounding.left - scrollLeft;
    let scrolledY = bounding.top - scrollTop;

    // Check for container and viewport for each edge
    if (scrolledX < containerRect.left + offset || scrolledX < offset) {
      edges.left = true;
    }

    if (
      scrolledX + bounding.width > containerRect.right - offset ||
      scrolledX + bounding.width > window.innerWidth - offset
    ) {
      edges.right = true;
    }

    if (scrolledY < containerRect.top + offset || scrolledY < offset) {
      edges.top = true;
    }

    if (
      scrolledY + bounding.height > containerBottom - offset ||
      scrolledY + bounding.height > window.innerHeight - offset
    ) {
      edges.bottom = true;
    }

    return edges;
  }

  static checkPossibleAlignments(el, container, bounding, offset) {
    let canAlign = {
      top: true,
      right: true,
      bottom: true,
      left: true,
      spaceOnTop: null,
      spaceOnRight: null,
      spaceOnBottom: null,
      spaceOnLeft: null
    };

    let containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
    let containerRect = container.getBoundingClientRect();
    let containerHeight = Math.min(containerRect.height, window.innerHeight);
    let containerWidth = Math.min(containerRect.width, window.innerWidth);
    let elOffsetRect = el.getBoundingClientRect();

    let scrollLeft = container.scrollLeft;
    let scrollTop = container.scrollTop;

    let scrolledX = bounding.left - scrollLeft;
    let scrolledYTopEdge = bounding.top - scrollTop;
    let scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;

    // Check for container and viewport for left
    canAlign.spaceOnRight = !containerAllowsOverflow
      ? containerWidth - (scrolledX + bounding.width)
      : window.innerWidth - (elOffsetRect.left + bounding.width);
    if (canAlign.spaceOnRight < 0) {
      canAlign.left = false;
    }

    // Check for container and viewport for Right
    canAlign.spaceOnLeft = !containerAllowsOverflow
      ? scrolledX - bounding.width + elOffsetRect.width
      : elOffsetRect.right - bounding.width;
    if (canAlign.spaceOnLeft < 0) {
      canAlign.right = false;
    }

    // Check for container and viewport for Top
    canAlign.spaceOnBottom = !containerAllowsOverflow
      ? containerHeight - (scrolledYTopEdge + bounding.height + offset)
      : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
    if (canAlign.spaceOnBottom < 0) {
      canAlign.top = false;
    }

    // Check for container and viewport for Bottom
    canAlign.spaceOnTop = !containerAllowsOverflow
      ? scrolledYBottomEdge - (bounding.height - offset)
      : elOffsetRect.bottom - (bounding.height + offset);
    if (canAlign.spaceOnTop < 0) {
      canAlign.bottom = false;
    }

    return canAlign;
  }

  static getOverflowParent(element: HTMLElement) {
    if (element == null) {
      return null;
    }
    if (element === document.body || getComputedStyle(element).overflow !== 'visible') {
      return element;
    }
    return this.getOverflowParent(element.parentElement);
  }

  static getIdFromTrigger(trigger: HTMLElement): string {
    let id = trigger.getAttribute('data-target');
    if (!id) {
      id = trigger.getAttribute('href');
      if (id) {
        id = id.slice(1);
      } else {
        id = '';
      }
    }
    return id;
  }

  static getDocumentScrollTop(): number {
    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  };

  static getDocumentScrollLeft(): number {
    return window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
  }

  public static throttle(func: Function, wait: number, options = null) {
    let context, args, result;
    let timeout = null;
    let previous = 0;
    options || (options = {});
    let later = function() {
      previous = options.leading === false ? 0 : new Date().getTime();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      let now = new Date().getTime();
      if (!previous && options.leading === false) previous = now;
      let remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  }
}

export default M;