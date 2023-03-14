import { Component } from "./component";
import $ from "cash-dom";
import anim from "animejs";

let _defaults = {
  accordion: true,
  onOpenStart: undefined,
  onOpenEnd: undefined,
  onCloseStart: undefined,
  onCloseEnd: undefined,
  inDuration: 300,
  outDuration: 300
};

export class Collapsible extends Component {
  $headers: any;
  private _handleCollapsibleClickBound: any;
  private _handleCollapsibleKeydownBound: any;

  constructor(el, options) {
    super(Collapsible, el, options);
    (this.el as any).M_Collapsible = this;
    this.options = {...Collapsible.defaults, ...options};

    // Setup tab indices
    this.$headers = this.$el.children('li').children('.collapsible-header');
    this.$headers.attr('tabindex', 0);

    this._setupEventHandlers();

    // Open first active
    let $activeBodies = this.$el.children('li.active').children('.collapsible-body');
    if (this.options.accordion) {
      // Handle Accordion
      $activeBodies.first().css('display', 'block');
    } else {
      // Handle Expandables
      $activeBodies.css('display', 'block');
    }
  }

  static get defaults() {
    return _defaults;
  }

  static init(els, options) {
    return super.init(this, els, options);
  }

  static getInstance(el) {
    let domElem = !!el.jquery ? el[0] : el;
    return domElem.M_Collapsible;
  }

  destroy() {
    this._removeEventHandlers();
    (this.el as any).M_Collapsible = undefined;
  }

  _setupEventHandlers() {
    this._handleCollapsibleClickBound = this._handleCollapsibleClick.bind(this);
    this._handleCollapsibleKeydownBound = this._handleCollapsibleKeydown.bind(this);
    this.el.addEventListener('click', this._handleCollapsibleClickBound);
    this.$headers.each((i, header) => {
      header.addEventListener('keydown', this._handleCollapsibleKeydownBound);
    });
  }

  _removeEventHandlers() {
    this.el.removeEventListener('click', this._handleCollapsibleClickBound);
    this.$headers.each((i, header) => {
      header.removeEventListener('keydown', this._handleCollapsibleKeydownBound);
    });
  }

  _handleCollapsibleClick(e) {
    let $header = $(e.target).closest('.collapsible-header');
    if (e.target && $header.length) {
      let $collapsible = $header.closest('.collapsible');
      if ($collapsible[0] === this.el) {
        let $collapsibleLi = $header.closest('li');
        let $collapsibleLis = $collapsible.children('li');
        let isActive = $collapsibleLi[0].classList.contains('active');
        let index = $collapsibleLis.index($collapsibleLi);

        if (isActive) {
          this.close(index);
        } else {
          this.open(index);
        }
      }
    }
  }

  _handleCollapsibleKeydown(e) {
    if (e.keyCode === 13) {
      this._handleCollapsibleClickBound(e);
    }
  }

  _animateIn(index: number) {
    let $collapsibleLi = this.$el.children('li').eq(index);
    if ($collapsibleLi.length) {
      let $body = $collapsibleLi.children('.collapsible-body');

      anim.remove($body[0]);
      $body.css({
        display: 'block',
        overflow: 'hidden',
        height: 0,
        paddingTop: '',
        paddingBottom: ''
      });

      let pTop = $body.css('padding-top');
      let pBottom = $body.css('padding-bottom');
      let finalHeight = $body[0].scrollHeight;
      $body.css({
        paddingTop: 0,
        paddingBottom: 0
      });
      anim({
        targets: $body[0],
        height: finalHeight,
        paddingTop: pTop,
        paddingBottom: pBottom,
        duration: this.options.inDuration,
        easing: 'easeInOutCubic',
        complete: (anim) => {
          $body.css({
            overflow: '',
            paddingTop: '',
            paddingBottom: '',
            height: ''
          });
          // onOpenEnd callback
          if (typeof this.options.onOpenEnd === 'function') {
            this.options.onOpenEnd.call(this, $collapsibleLi[0]);
          }
        }
      });
    }
  }

  _animateOut(index: number) {
    let $collapsibleLi = this.$el.children('li').eq(index);
    if ($collapsibleLi.length) {
      let $body = $collapsibleLi.children('.collapsible-body');
      anim.remove($body[0]);
      $body.css('overflow', 'hidden');
      anim({
        targets: $body[0],
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: this.options.outDuration,
        easing: 'easeInOutCubic',
        complete: () => {
          $body.css({
            height: '',
            overflow: '',
            padding: '',
            display: ''
          });
          // onCloseEnd callback
          if (typeof this.options.onCloseEnd === 'function') {
            this.options.onCloseEnd.call(this, $collapsibleLi[0]);
          }
        }
      });
    }
  }

  open(index: number) {
    let $collapsibleLi = this.$el.children('li').eq(index);
    if ($collapsibleLi.length && !$collapsibleLi[0].classList.contains('active')) {
      // onOpenStart callback
      if (typeof this.options.onOpenStart === 'function') {
        this.options.onOpenStart.call(this, $collapsibleLi[0]);
      }
      // Handle accordion behavior
      if (this.options.accordion) {
        let $collapsibleLis = this.$el.children('li');
        let $activeLis = this.$el.children('li.active');
        $activeLis.each((i, el) => {
          let index = $collapsibleLis.index($(el));
          this.close(index);
        });
      }
      // Animate in
      $collapsibleLi[0].classList.add('active');
      this._animateIn(index);
    }
  }

  close(index: number) {
    let $collapsibleLi = this.$el.children('li').eq(index);
    if ($collapsibleLi.length && $collapsibleLi[0].classList.contains('active')) {
      // onCloseStart callback
      if (typeof this.options.onCloseStart === 'function') {
        this.options.onCloseStart.call(this, $collapsibleLi[0]);
      }

      // Animate out
      $collapsibleLi[0].classList.remove('active');
      this._animateOut(index);
    }
  }
}
