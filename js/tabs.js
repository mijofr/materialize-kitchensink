(function($, anim) {
  'use strict';

  let _defaults = {
    duration: 300,
    onShow: null,
    swipeable: false,
    responsiveThreshold: Infinity // breakpoint for swipeable
  };

  class Tabs extends Component {

    constructor(el, options) {
      super(Tabs, el, options);
      this.el.M_Tabs = this;
      this.options = $.extend({}, Tabs.defaults, options);
      this._tabLinks = this.$el[0].querySelectorAll('li.tab > a');
      this.index = 0;
      this._setupActiveTabLink();
      if (this.options.swipeable) {
        this._setupSwipeableTabs();
      } else {
        this._setupNormalTabs();
      }
      // Setup tabs indicator after content to ensure accurate widths
      this._setTabsAndTabWidth();
      this._createIndicator();
      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    static getInstance(el) {
      const domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Tabs;
    }

    destroy() {
      this._removeEventHandlers();
      this._indicator.parentNode.removeChild(this._indicator);
      if (this.options.swipeable) {
        this._teardownSwipeableTabs();
      } else {
        this._teardownNormalTabs();
      }
      this.$el[0].M_Tabs = undefined;
    }

    _setupEventHandlers() {
      this._handleWindowResizeBound = this._handleWindowResize.bind(this);
      window.addEventListener('resize', this._handleWindowResizeBound);
      this._handleTabClickBound = this._handleTabClick.bind(this);
      this.el.addEventListener('click', this._handleTabClickBound);
    }

    _removeEventHandlers() {
      window.removeEventListener('resize', this._handleWindowResizeBound);
      this.el.removeEventListener('click', this._handleTabClickBound);
    }

    _handleWindowResize() {
      this._setTabsAndTabWidth();
      if (this.tabWidth !== 0 && this.tabsWidth !== 0) {
        this._indicator.style.left = this._calcLeftPos(this._activeTabLink)+'px';
        this._indicator.style.right = this._calcRightPos(this._activeTabLink)+'px';
      }
    }

    _handleTabClick(e) {
      const tabLink = e.target;
      const tab = tabLink.parentElement;  
      // Handle click on tab link only
      if (!tabLink || !tab.classList.contains('tab')) return;
      // is disabled?
      if (tab.classList.contains('disabled')) {
        e.preventDefault();
        return;
      }
      // Act as regular link if target attribute is specified.
      if (tabLink.hasAttribute('target')) return;
      // Make the old tab inactive.
      this._activeTabLink.classList.remove('active');
      const _oldContent = this._content;
      // Update the variables with the new link and content
      this._activeTabLink = tabLink;
      this._content = document.querySelector(tabLink.hash);
      this._tabLinks = this.$el[0].querySelectorAll('li.tab > a');
      // Make the tab active
      this._activeTabLink.classList.add('active');
      const prevIndex = this.index;
      this.index = Math.max(Array.from(this._tabLinks).indexOf(tabLink), 0);
      // Swap content
      if (this.options.swipeable) {
        if (this._tabsCarousel) {
          this._tabsCarousel.set(this.index, () => {
            if (typeof this.options.onShow === 'function')
              this.options.onShow.call(this, this._content);
          });
        }
      } else {
        if (this._content) {
          this._content.style.display = 'block';
          this._content.classList.add('active');
          if (typeof this.options.onShow === 'function')
            this.options.onShow.call(this, this._content);
          if (_oldContent && _oldContent !== this._content) {
            _oldContent.style.display = 'none';
            _oldContent.classList.remove('active');
          }
        }
      }
      // Update widths after content is swapped (scrollbar bugfix)
      this._setTabsAndTabWidth();
      this._animateIndicator(prevIndex);
      e.preventDefault();
    }

    _createIndicator() {
      const indicator = document.createElement('li');
      indicator.classList.add('indicator');
      this.el.appendChild(indicator);
      this._indicator = indicator;
      this._indicator.style.left = this._calcLeftPos(this._activeTabLink)+'px';
      this._indicator.style.right = this._calcRightPos(this._activeTabLink)+'px';
    }

    _setupActiveTabLink() {
      // If the location.hash matches one of the links, use that as the active tab.
      this._activeTabLink = Array.from(this._tabLinks).find(a => a.getAttribute('href') === location.hash);
      // If no match is found, use the first link or any with class 'active' as the initial active tab.
      if (!this._activeTabLink) {
        this._activeTabLink = this.$el[0].querySelector('li.tab a.active');
      }
      if (this._activeTabLink.length === 0) {
        this._activeTabLink = this.$el[0].querySelector('li.tab a');
      }
      Array.from(this._tabLinks).forEach(a => a.classList.remove('active'));
      this._activeTabLink.classList.add('active');

      this.index = Math.max(Array.from(this._tabLinks).indexOf(this._activeTabLink), 0);
      if (this._activeTabLink) {
        this._content = document.querySelector(this._activeTabLink.hash);
        this._content.classList.add('active');
      }
    }

    _setupSwipeableTabs() {
      // Change swipeable according to responsive threshold
      if (window.innerWidth > this.options.responsiveThreshold)
        this.options.swipeable = false;

      const tabsContent = [];
      this._tabLinks.forEach(a => {
        const currContent = document.querySelector(a.hash);
        currContent.classList.add('carousel-item');
        tabsContent.push(currContent);
      });

      // Create Carousel-Wrapper around Tab-Contents
      const tabsWrapper = document.createElement('div'); 
      tabsWrapper.classList.add('tabs-content', 'carousel', 'carousel-slider');

      // Wrap around
      tabsContent[0].parentElement.insertBefore(tabsWrapper, tabsContent[0]);
      tabsContent.forEach(tabContent => {
        tabsWrapper.appendChild(tabContent);
        tabContent.style.display = '';
      });

      // Keep active tab index to set initial carousel slide
      const tab = this._activeTabLink.parentElement;
      const activeTabIndex = Array.from(tab.parentNode.children).indexOf(tab);

      this._tabsCarousel = M.Carousel.init(tabsWrapper, {
        fullWidth: true,
        noWrap: true,
        onCycleTo: (item) => {
          const prevIndex = this.index;
          this.index = Array.from(item.parentNode.children).indexOf(item);
          this._activeTabLink.classList.remove('active');
          this._activeTabLink = Array.from(this._tabLinks)[this.index];
          this._activeTabLink.classList.add('active');
          this._animateIndicator(prevIndex);
          if (typeof this.options.onShow === 'function')
            this.options.onShow.call(this, this._content);
        }
      });
      // Set initial carousel slide to active tab
      this._tabsCarousel.set(activeTabIndex);
    }

    _teardownSwipeableTabs() {
      const $tabsWrapper = this._tabsCarousel.$el;
      this._tabsCarousel.destroy();
      // Unwrap
      $tabsWrapper.after($tabsWrapper.children());
      $tabsWrapper.remove();
    }

    _setupNormalTabs() {
      // Hide Tabs Content
      Array.from(this._tabLinks).forEach(a => {
        if (a === this._activeTabLink) return;
        if (a.hash) {
          const currContent = document.querySelector(a.hash);
          if (currContent) currContent.style.display = 'none';
        }
      });
    }

    _teardownNormalTabs() {
      // show Tabs Content
      this._tabLinks.forEach(a => {
        if (a.hash) {
          const currContent = document.querySelector(a.hash);
          if (currContent) currContent.style.display = '';
        }
      });
    }

    _setTabsAndTabWidth() {
      this.tabsWidth = this.$el[0].getBoundingClientRect().width;
      this.tabWidth = Math.max(this.tabsWidth, this.el.scrollWidth) / this._tabLinks.length;
    }

    _calcRightPos(el) {
      return Math.ceil(this.tabsWidth - el.offsetLeft - el.getBoundingClientRect().width);
    }

    _calcLeftPos(el) {
      return Math.floor(el.offsetLeft);
    }

    updateTabIndicator() {
      this._setTabsAndTabWidth();
      this._animateIndicator(this.index);
    }

    _animateIndicator(prevIndex) {
      const leftDelay = 0,
        rightDelay = 0;

      if (this.index - prevIndex >= 0)
        leftDelay = 90;
      else
        rightDelay = 90;

      const animOptions = {
        targets: this._indicator,
        left: {
          value: this._calcLeftPos(this._activeTabLink),
          delay: leftDelay
        },
        right: {
          value: this._calcRightPos(this._activeTabLink),
          delay: rightDelay
        },
        duration: this.options.duration,
        easing: 'easeOutQuad'
      };
      anim.remove(this._indicator);
      anim(animOptions);
    }

    select(tabId) {
      const tab = Array.from(this._tabLinks).find(a => a.getAttribute('href') === '#'+tabId);
      if (tab) tab.click();
    }
  }

  M.Tabs = Tabs;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tabs, 'tabs', 'M_Tabs');
  }
})(cash, M.anime);
