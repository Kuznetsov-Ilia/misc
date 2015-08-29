//import './fixedsticky.css';
'use strict';

exports.__esModule = true;

var _utils = require('./utils');

var W = window;
var D = document;
var B = document.body;
var H = document.documentElement;

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
  getScrollTop: function getScrollTop() {
    // Thanks jQuery!
    var prop = 'pageYOffset',
        method = 'scrollTop';
    return W ? prop in W ? W[prop] : H[method] : B[method];
  },
  bypass: function bypass() {
    // Check native sticky, check fixed and if fixed-fixed is also included on the page and is supported
    return FixedSticky.tests.sticky && !FixedSticky.optOut || !FixedSticky.tests.fixed || W.FixedFixed && !H.classList.contains('fixed-supported');
  },
  update: function update(el) {
    if (!el.offsetWidth) {
      return;
    }

    var height = _utils.outerHeight(el),
        initialOffset = _utils.data(el, FixedSticky.keys.offset),
        scroll = FixedSticky.getScrollTop(),
        isAlreadyOn = el.classList.contains(FixedSticky.classes.active),
        toggle = function toggle(turnOn) {
      el.classList[turnOn ? 'add' : 'remove'](FixedSticky.classes.active);
      el.classList[!turnOn ? 'add' : 'remove'](FixedSticky.classes.inactive);
    },
        viewportHeight = H.clientHeight,
        position = _utils.data(el, FixedSticky.keys.position),
        skipSettingToFixed,
        elTop,
        elBottom,
        _parent = _utils.parent(el),
        parentOffset = _utils.offset(_parent).top,
        parentHeight = _utils.outerHeight(_parent),
        cloneDummy = '<div class="#" style="height:#px"></div>'.replace('#', FixedSticky.classes.clone).replace('#', height);

    if (initialOffset === undefined) {
      initialOffset = _utils.offset(el).top;
      _utils.data(el, FixedSticky.keys.offset, initialOffset);
      _utils.after(el, cloneDummy);
    }

    if (!position) {
      // Some browsers require fixed/absolute to report accurate top/left values.
      skipSettingToFixed = _utils.css(el, 'top') !== 'auto' || _utils.css(el, 'bottom') !== 'auto';

      if (!skipSettingToFixed) {
        _utils.css(el, 'position', 'fixed');
      }

      position = {
        top: _utils.css(el, 'top') !== 'auto',
        bottom: _utils.css(el, 'bottom') !== 'auto'
      };

      if (!skipSettingToFixed) {
        _utils.css(el, 'position', '');
      }

      _utils.data(el, FixedSticky.keys.position, position);
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

    elTop = getPx(_utils.css(el, 'top'));
    elBottom = getPx(_utils.css(el, 'bottom'));

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
  destroy: function destroy(el) {
    if (FixedSticky.bypass()) {
      return el;
    }
    W.off('.fixedsticky');
    el.classList.remove(FixedSticky.classes.active, FixedSticky.classes.inactive);
    _utils.next(el, '.' + FixedSticky.classes.clone);
    _utils.remove(el);
    return el;
  },
  init: function init(el) {
    if (FixedSticky.bypass()) {
      return;
    }
    el.classList.add(FixedSticky.classes.plugin);

    FixedSticky.update(el);

    W.on({
      'scroll.fixedsticky': _utils.throttle(function () {
        FixedSticky.update(el);
      }, 30),
      'resize.fixedsticky': _utils.throttle(function () {
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

exports['default'] = function (el, method) {
  if (typeof FixedSticky[method] === 'function') {
    return FixedSticky[method].call(FixedSticky, el);
  } else if (typeof method === 'object' || !method) {
    return FixedSticky.init.call(FixedSticky, el);
  } else {
    throw new Error('Method `' + method + '` does not exist on fixedsticky');
  }
};

module.exports = exports['default'];