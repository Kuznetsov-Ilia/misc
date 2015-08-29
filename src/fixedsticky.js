//import './fixedsticky.css';
var W = window;
var D = document;
var B = document.body;
var H = document.documentElement;
import { outerHeight, data, parent, offset, after, css, next, remove, throttle } from './utils';

function featureTest(property, value, noPrefixes) {
  // Thanks Modernizr! https://github.com/phistuck/Modernizr/commit/3fb7217f5f8274e2f11fe6cfeda7cfaf9948a1f5
  var prop = property + ':',
    el = D.createElement('test'),
    mStyle = el.style;

  if (!noPrefixes) {
    mStyle.cssText = prop + ['-webkit-', '-moz-', '-ms-', '-o-', ''].join(value + ';' + prop) + value + ';';
  } else {
    mStyle.cssText = prop + value;
  }
  return mStyle[property].indexOf(value) !== -1;
}

function getPx(unit) {
  return parseInt(unit, 10) || 0;
}

var FixedSticky = {
  classes: {
    plugin: 'fixedsticky',
    active: 'fixedsticky-on',
    inactive: 'fixedsticky-off',
    clone: 'fixedsticky-dummy',
    withoutFixedFixed: 'fixedsticky-withoutfixedfixed'
  },
  keys: {
    offset: 'fixedStickyOffset',
    position: 'fixedStickyPosition'
  },
  tests: {
    sticky: featureTest('position', 'sticky'),
    fixed: featureTest('position', 'fixed', true)
  },
  getScrollTop: function () {
    // Thanks jQuery!
    var prop = 'pageYOffset',
      method = 'scrollTop';
    return W ? (prop in W) ? W[prop] : H[method] : B[method];
  },
  bypass: function () {
    // Check native sticky, check fixed and if fixed-fixed is also included on the page and is supported
    return (FixedSticky.tests.sticky && !FixedSticky.optOut) || !FixedSticky.tests.fixed || W.FixedFixed && !H.classList.contains('fixed-supported');
  },
  update: function (el) {
    if (!el.offsetWidth) {
      return;
    }

    var height = outerHeight(el),
      initialOffset = data(el, FixedSticky.keys.offset),
      scroll = FixedSticky.getScrollTop(),
      isAlreadyOn = el.classList.contains(FixedSticky.classes.active),
      toggle = function (turnOn) {
        el.classList[turnOn ? 'add' : 'remove'](FixedSticky.classes.active);
        el.classList[!turnOn ? 'add' : 'remove'](FixedSticky.classes.inactive);
      },
      viewportHeight = H.clientHeight,
      position = data(el, FixedSticky.keys.position),
      skipSettingToFixed,
      elTop,
      elBottom,
      _parent = parent(el),
      parentOffset = offset(_parent).top,
      parentHeight = outerHeight(_parent),
      cloneDummy = '<div class="#" style="height:#px"></div>'.replace('#', FixedSticky.classes.clone).replace('#', height);

    if (initialOffset === undefined) {
      initialOffset = offset(el).top;
      data(el, FixedSticky.keys.offset, initialOffset);
      after(el, cloneDummy);
    }

    if (!position) {
      // Some browsers require fixed/absolute to report accurate top/left values.
      skipSettingToFixed = css(el, 'top') !== 'auto' || css(el, 'bottom') !== 'auto';

      if (!skipSettingToFixed) {
        css(el, 'position', 'fixed');
      }

      position = {
        top: css(el, 'top') !== 'auto',
        bottom: css(el, 'bottom') !== 'auto'
      };

      if (!skipSettingToFixed) {
        css(el, 'position', '');
      }

      data(el, FixedSticky.keys.position, position);
    }

    function isFixedToTop() {
      var offsetTop = scroll + elTop;

      // Initial Offset Top
      return initialOffset < offsetTop &&
        // Container Bottom
        offsetTop + height <= parentOffset + parentHeight;
    }

    function isFixedToBottom() {
      // Initial Offset Top + Height
      return initialOffset + (height || 0) > scroll + viewportHeight - elBottom &&
        // Container Top
        scroll + viewportHeight - elBottom >= parentOffset + (height || 0);
    }

    elTop = getPx(css(el, 'top'));
    elBottom = getPx(css(el, 'bottom'));

    if (position.top && isFixedToTop() || position.bottom && isFixedToBottom()) {
      if (!isAlreadyOn) {
        toggle(true);
      }
    } else {
      if (isAlreadyOn) {
        toggle(false);
      }
    }
  },
  destroy: function (el) {
    if (FixedSticky.bypass()) {
      return el;
    }
    W.off('.fixedsticky');
    el.classList.remove(FixedSticky.classes.active, FixedSticky.classes.inactive);
    next(el, '.' + FixedSticky.classes.clone);
    remove(el);
    return el;
  },
  init: function (el) {
    if (FixedSticky.bypass()) {
      return;
    }
    el.classList.add(FixedSticky.classes.plugin);

    FixedSticky.update(el);

    W.on({
      'scroll.fixedsticky': throttle(function () {
        FixedSticky.update(el);
      }, 30),
      'resize.fixedsticky': throttle(function () {
        if (el.classList.contains(FixedSticky.classes.active)) {
          FixedSticky.update(el);
        }
      }, 30)
    });
    /*W.on('scroll.fixedsticky', throttle(function () {
      FixedSticky.update(el);
    }, 30));
    W.on('resize.fixedsticky', throttle(function () {
      if (el.classList.contains(FixedSticky.classes.active)) {
        FixedSticky.update(el);
      }
    }, 30));*/
  }
};

// Add fallback when fixed-fixed is not available.
if (!W.FixedFixed) {
  H.classList.add(FixedSticky.classes.withoutFixedFixed);
}

export default function (el, method) {
  if (typeof FixedSticky[method] === 'function') {
    return FixedSticky[method].call(FixedSticky, el);
  } else if (typeof method === 'object' || !method) {
    return FixedSticky.init.call(FixedSticky, el);
  } else {
    throw new Error('Method `' + method + '` does not exist on fixedsticky');
  }
}
