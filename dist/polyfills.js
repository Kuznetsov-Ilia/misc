(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var body = document.body;
var html = document.documentElement;
var _window = self || window;
var head = document.head || document.getElementsByTagName('head')[0];
var process = {};
exports['default'] = window;
exports.window = _window;
exports.body = body;
exports.head = head;
exports.console = console;
exports.document = document;
exports.navigator = navigator;
exports.location = location;
exports.html = html;
exports.process = process;
},{}],2:[function(require,module,exports){
var _global = require('global');

var _utils = require('./utils');

var Np = _global.window.Node.prototype;
var Ep = _global.window.Element.prototype;
var NLp = _global.window.NodeList.prototype;
var HCp = _global.window.HTMLCollection.prototype;
var Ap = Array.prototype;
var Wp = _global.window.Window && _global.window.Window.prototype || _global.window.prototype;
var ETp = _global.window.EventTarget && _global.window.EventTarget.prototype;
var CACHE = {};
var CACHE_KEY = 0;
var ES5ArrayMethods = ['join', 'split', 'concat', 'pop', 'push', 'shift', 'unshift', 'reverse', 'slice', 'splice', 'sort', 'indexOf', 'lastIndexOf', //ES3
'forEach', 'some', 'every', /*'find', 'filter',*/'map', 'reduce', 'reduceRight' //ES5
].reduce(function (acc, value) {
  return acc[value] = { value: Ap[value] }, acc;
}, {});

var CustomMethods = {
  on: onAll,
  off: offAll,
  find: findAll,
  filter: filterAll,
  trigger: triggerAll,
  matches: matchesAll
};
var listMethods = (0, _utils.keys)(CustomMethods).reduce(function (acc, value) {
  return acc[value] = { value: CustomMethods[value] }, acc;
}, ES5ArrayMethods);
var matches = Ep.matches || Ep.matchesSelector || Ep.webkitMatchesSelector || Ep.khtmlMatchesSelector || Ep.mozMatchesSelector || Ep.msMatchesSelector || Ep.oMatchesSelector || function (selector) {
  var _this2 = this;

  return _global.document.filter(selector).some(function (e) {
    return e === _this2;
  });
};

var NodeMethods = {
  on: on, off: off, trigger: trigger,
  find: find, filter: filter,
  outerHeight: outerHeight, outerWidth: outerWidth,
  offset: offset,
  height: height, width: width,
  position: position,
  parent: parent,
  siblings: siblings,
  prev: prev, next: next,
  first: first, //last!
  after: after, before: before,
  append: append, prepend: prepend,
  closest: closest,
  replaceWith: replaceWith,
  css: css,
  data: data,
  attr: attr,
  text: text,
  html: html,
  matches: matches
};

var NodeMethodsKeys = (0, _utils.keys)(NodeMethods);
var reduceNodeMethods = function reduceNodeMethods(acc, key) {
  return acc[key] = { value: NodeMethods[key] }, acc;
};
var nodeMethods = NodeMethodsKeys.filter(function (p) {
  return !(p in Np);
}).reduce(reduceNodeMethods, {});

_global.document.matches = function (selector) {
  return _global.body.matches(selector);
};
Object.defineProperties(NLp, listMethods);
Object.defineProperties(HCp, listMethods);
Object.defineProperties(Np, nodeMethods);
if (Wp) {
  var windowMethods = NodeMethodsKeys.filter(function (p) {
    return !(p in Wp);
  }).reduce(reduceNodeMethods, {});
  Object.defineProperties(Wp, windowMethods);
}
if (ETp) {
  var ETMethods = NodeMethodsKeys.filter(function (p) {
    return !(p in ETp);
  }).reduce(reduceNodeMethods, {});
  Object.defineProperties(ETp, ETMethods);
}

function on(name, callback, context) {
  var el = this;
  if (!el) {
    return false;
  }
  if ((0, _utils.isArray)(name)) {
    // el.on(['click', 'submit'], fn, this)
    name.forEach(function (n) {
      on.call(el, n, callback, context);
    });
  } else if ((0, _utils.isObject)(name)) {
    // el.on({click: fn1, submit: fn2})
    context = callback;
    for (var i in name) {
      on.call(el, i, name[i], context);
    }
  } else {
    var types = name.split(/\s+/);
    var handler = callback;

    var _types$0$split = types[0].split('.');

    var eventName = _types$0$split[0];
    var nameSpace = _types$0$split[1];

    nameSpace = nameSpace || 'default';

    if (context) {
      handler = callback.bind(context);
    }
    if (types.length === 1) {
      el.addEventListener(eventName, handler, false);
    } else {
      el.addEventListener(eventName, delegate(types[1], handler), false);
    }
    if (el.handlers === undefined) {
      el.handlers = {};
    }
    el.handlers[eventName] = el.handlers[eventName] || {};
    el.handlers[eventName][nameSpace] = el.handlers[eventName][nameSpace] || [];
    el.handlers[eventName][nameSpace].push(handler);
  }
  return el;
}
function off(event, fn) {
  var el = this;
  if (!el) {
    return false;
  }
  /*    || !isset(this.handlers[eventName])
      || !this.handlers[eventName][nameSpace] || !this.handlers[eventName][nameSpace].length*/

  if (!(0, _utils.isset)(el.handlers)) {
    return el;
    /*не установлены хендлеры в принципе*/
  } else if ((0, _utils.isset)(fn)) {
      if ((0, _utils.isArray)(event)) {
        event.forEach(function (e) {
          el.removeEventListener(e, fn, false);
        });
      } else {
        el.removeEventListener(event, fn, false);
      }
    } else if ((0, _utils.isset)(event)) {
      if ((0, _utils.isArray)(event)) {
        event.forEach(function (e) {
          var _e$split = e.split('.');

          var eventName = _e$split[0];
          var _e$split$ = _e$split[1];
          var nameSpace = _e$split$ === undefined ? 'default' : _e$split$;

          el.handlers[eventName][nameSpace].forEach(function (handler, i) {
            el.removeEventListener(eventName, handler, false);
            delete el.handlers[eventName][nameSpace][i];
          });
        });
      } else {
        var _event$split = event.split('.');

        var eventName = _event$split[0];
        var _event$split$ = _event$split[1];
        var nameSpace = _event$split$ === undefined ? 'default' : _event$split$;

        el.handlers[eventName][nameSpace].forEach(function (handler, i) {
          el.removeEventListener(eventName, handler, false);
          delete el.handlers[i];
        });
      }
    } else {
      (0, _utils.keys)(el.handlers).forEach(function (eventName2) {
        (0, _utils.keys)(el.handlers[eventName2]).forEach(function (nameSpace2) {
          el.handlers[eventName2][nameSpace2].forEach(function (handler, i) {
            el.removeEventListener(eventName2, handler, false);
            delete el.handlers[eventName2][nameSpace2][i];
          });
        });
      });
    }
  return el;
}
function find(selector, flag) {
  if ((0, _utils.isFunction)(selector)) {
    return Ap.find.call(this, selector);
  } else {
    if (flag) {
      switch (selector.charAt(0)) {
        case '#':
          return _global.document.getElementById(selector.substr(1));
        case '.':
          return this.getElementsByClassName(selector.substr(1))[0];
        case /w+/gi:
          return this.getElementsByTagName(selector);
      }
    }
    return this.querySelector(selector || '☺');
  }
}
function filter(selector) {
  return this.querySelectorAll(selector || '☺') || [];
}

/* Traverse DOM from event target up to parent, searching for selector */
function passedThrough(event, selector, stopAt) {
  var currentNode = event.target;
  while (true) {
    if (currentNode === null) {
      return false;
    } else if (currentNode.matches(selector)) {
      return currentNode;
    } else if (currentNode !== stopAt && currentNode !== _global.body) {
      currentNode = currentNode.parentNode;
    } else {
      return false;
    }
  }
}
function delegate(delegationSelector, handler) {
  return function (event) {
    var found = passedThrough(event, delegationSelector, event.currentTarget);
    if (found) {
      /*var pseudoEvent = {
        target: found,
        real: event
      };
        ['initMouseEvent', 'initUIEvent', 'initEvent', 'preventDefault', 'stopImmediatePropagation', 'stopPropagation'].reduce((acc, val) => {
        if (val in event) {
          acc[val] = event[val].bind(event);
        }
        return acc;
      }, pseudoEvent);*/
      event.delegated = found;
      return handler(event);
    }

    /*var target = event.target;
    var related = event.relatedTarget;
    var match = false;
     // search for a parent node matching the delegation selector
    while ( target && target !== document && !(match = target.matches(delegationSelector)) ) {
      target = target.parentNode;
    }
    // exit if no matching node has been found
    if ( !match ) { return; }
    // loop through the parent of the related target to make sure that it's not a child of the target
    while (related && related !== target && related !== document ) {
      related = related.parentNode;
    }
    // exit if this is the case
    if ( related === target ) { return; }
     // the "delegated mouseenter" handler can now be executed
    // change the color of the text
    handler(event);*/

    /*if (event.target.matches(selector)) {
      return handler(event);
    } else if (event.target.matches(selector + ' *')) {
      var target = event.target.parent(selector);
      var pseudoEvent = {
        target: target,
        realTarget: event.target
      };
      ['initMouseEvent', 'initUIEvent', 'initEvent', 'preventDefault', 'stopImmediatePropagation', 'stopPropagation']
      .forEach(e => {
        if (e in event) {
          pseudoEvent[e] = event[e].bind(event);
        }
      });
      return handler(Object.assign({}, event, pseudoEvent));
    }*/
  };
}

function trigger(type, _data) {
  var el = this;
  var event = _global.document.createEvent('HTMLEvents');
  _data = _data || {};
  _data.target = el;
  event.initEvent(type, true, true, _data);
  event.data = _data;
  event.eventName = type;
  this.dispatchEvent(event);
  return this;
}

function onAll(name, callback, context) {
  this.forEach(function (node) {
    on.call(node, name, callback, context);
  });
  return this;
}
function offAll(event, fn) {
  this.forEach(function (node) {
    off.call(node, event, fn);
  });
  return this;
}
function triggerAll(type, _data) {
  this.forEach(function (node) {
    trigger.call(node, type, _data);
  });
  return this;
}
function findAll(selector) {
  if (typeof selector === 'function') {
    return Ap.find.call(this, selector);
  }
  this.forEach(function (node) {
    var found = node.find(selector);
    if (found) {
      return found;
    }
  });
  return null;
}
function filterAll(selector) {
  if (typeof selector === 'function') {
    return Ap.filter.call(this, selector);
  }
  var result = [];
  var r;
  this.forEach(function (node) {
    r = node.filter(selector);
    if (r) {
      result.push(r);
    }
  });
  return result.length ? result : [];
}
function matchesAll(selector) {
  return this.every(function (node) {
    return node.matches(selector);
  });
}

function outerHeight(withMargins) {
  var el = this;
  if (el) {
    var _height = el.offsetHeight;
    if (withMargins) {
      var style = _global.window.getComputedStyle(el, null);
      _height += parseInt(style.marginTop) + parseInt(style.marginBottom, 10);
    }
    return _height;
  }
}
function outerWidth(withMargins) {
  var _width = this.offsetWidth;
  if (withMargins) {
    var style = _global.window.getComputedStyle(this, null);
    _width += parseInt(style.marginLeft) + parseInt(style.marginRight, 10);
  }
  return width;
}
function offset() {
  var el = this;
  if (!el) {
    return {};
  }
  var box = el.getBoundingClientRect();
  return {
    top: box.top + _global.window.pageYOffset - _global.html.clientTop,
    left: box.left + _global.window.pageXOffset - _global.html.clientLeft
  };
}
function height(value) {
  if ((0, _utils.isset)(value)) {
    value = parseInt(value);
    this.style.height = value + 'px';
    return value;
  } else {
    return parseInt(_global.window.getComputedStyle(this, null).height);
  }
}
function width(value) {
  if ((0, _utils.isset)(value)) {
    value = parseInt(value);
    this.style.width = value + 'px';
    return value;
  } else {
    return parseInt(_global.window.getComputedStyle(this, null).width);
  }
}
function position() {
  return {
    left: this.offsetLeft,
    top: this.offsetTop
  };
}
function parent(_filter) {
  var el = this;
  if (!el) {
    return false;
  }
  if ((0, _utils.isset)(_filter)) {
    var _filterFn;
    if ((0, _utils.isNumber)(_filter)) {
      _filterFn = function _filterFn(node, k) {
        return k === _filter;
      };
    } else {
      _filterFn = function _filterFn(node) {
        return node.matches(_filter);
      };
    }

    var _parent = el;
    var ii = 1;
    while (_parent = _parent.parentElement) {
      if (_filterFn(_parent, ii)) {
        return _parent;
      }
      ii++;
    }
    return false;
  } else {
    return el.parentElement;
  }
}
function parentAll(_filter) {
  if ((0, _utils.isset)(_filter)) {
    var _filterFn;
    if ((0, _utils.isNumber)(_filter)) {
      _filterFn = function _filterFn(node, iii) {
        return iii === _filter;
      };
    } else {
      _filterFn = function _filterFn(node) {
        return node.matches(_filter);
      };
    }

    var _parent = this;
    var ii = 1;
    var _result = [];
    while (_parent = _parent.parentElement) {
      if (_filterFn(_parent, ii)) {
        _result.push(_parent);
      }
      ii++;
    }
    return _result;
  } else {
    var __parent = this;
    var __result = [];
    while (__parent = __parent.parentElement) {
      __result.push(__parent);
    }
    return __result;
  }
}
function siblings(_filter) {
  var _this = this;
  return this.parent().children.filter(function (child) {
    var valid = child !== _this;
    if (valid && (0, _utils.isset)(_filter)) {
      valid = child.matches(_filter);
    }
    return valid;
  });
}
function prev(_filter) {
  if ((0, _utils.isset)(_filter)) {
    var _prev = this;
    //var result = [];
    while (_prev = _prev.previousElementSibling) {
      if (_prev.matches(_filter)) {
        return _prev;
      }
    }
    return false;
  } else {
    return this.previousElementSibling;
  }
}
function prevAll(_filter) {
  if ((0, _utils.isset)(_filter)) {
    var _prev = this;
    var __result = [];
    while (_prev = _prev.previousElementSibling) {
      if (_prev.matches(_filter)) {
        __result.push(_prev);
      }
    }
    return __result;
  } else {
    var __prev = this;
    var _result = [];
    while (__prev = __prev.previousElementSibling) {
      _result.push(__prev);
    }
    return _result;
  }
}
function next(filter) {
  if ((0, _utils.isset)(filter)) {
    var _next = this;
    while (_next = _next.nextElementSibling) {
      if (_next.matches(filter)) {
        return _next;
      }
    }
    return false;
  } else {
    return this.nextElementSibling;
  }
}
function nextAll(_filter) {
  if ((0, _utils.isset)(_filter)) {
    var _next = this;
    var __result = [];
    while (_next = _next.nextElementSibling) {
      if (_next.matches(_filter)) {
        __result.push(_next);
      }
    }
    return __result;
  } else {
    var __next = this;
    var _result = [];
    while (__next = __next.nextElementSibling) {
      _result.push(__next);
    }
    return _result;
  }
}
function first(filter) {
  if ((0, _utils.isset)(filter)) {
    var children = this.children;
    if ((0, _utils.isset)(children) && children.length > 0) {
      for (var ii = 0, l = children.length; ii < l; ii++) {
        if (children[ii].matches(filter)) {
          return children[ii];
        }
      }
    }
    return null;
  } else {
    return this.firstChild;
  }
}
function closest(selector) {
  var parentNode = this;
  var matches;
  while (
  // document has no .matches
  (matches = parentNode && parentNode.matches) && !parentNode.matches(selector)) {
    parentNode = parentNode.parentNode;
  }
  return matches ? parentNode : null;
}
function after(_html, _position) {
  var el = this;
  if (_position) {
    _position = 'afterend';
  } else {
    _position = 'afterbegin';
  }
  if ((0, _utils.isset)(_html)) {
    if ((0, _utils.isString)(_html)) {
      return el.insertAdjacentHTML(_position, _html);
    } else if ((0, _utils.isNode)(_html)) {
      var _parent = el.parentNode;
      var _next = el.nextSibling;
      if (_next === null) {
        return _parent.appendChild(_html);
      } else {
        return _parent.insertBefore(_html, _next);
      }
    }
  } else {
    return '';
  }
}
function before(_html, _position) {
  if (_position) {
    _position = 'beforeend';
  } else {
    _position = 'beforebegin';
  }
  if ((0, _utils.isset)(_html)) {
    if ((0, _utils.isString)(_html)) {
      return this.insertAdjacentHTML(_position, _html);
    } else if ((0, _utils.isNode)(_html)) {
      return this.parent().insertBefore(_html, this);
    }
  }
  return '';
}
function append(node) {
  if ((0, _utils.isNode)(node)) {
    return this.appendChild(node);
  } else if ((0, _utils.isString)(node)) {
    return this.before(node, 1);
  }
}
function prepend(node) {
  if ((0, _utils.isNode)(node)) {
    this.parent().insertBefore(node, this.parent().firstChild);
  } else if ((0, _utils.isArray)(node)) {
    var _this = this;
    node.each(function (n) {
      _this.prepend(n);
    });
  }
  return this;
}
function replaceWith(html) {
  var parentNode = this.parentNode;
  if (parentNode) {
    if ((0, _utils.isString)(html)) {
      this.outerHTML = html;
    } else if ((0, _utils.isNode)(html)) {
      parentNode.replaceChild(html, this);
    } else {
      console.error('unsuported input type in replaceWith', typeof html, html);
    }
  }
  return this;
}
function css(ruleName, value) {
  var el = this;
  if ((0, _utils.isObject)(ruleName)) {
    for (var ii in ruleName) {
      el.style[camelCase(ii)] = ruleName[ii];
    }
    return el;
  } else if ((0, _utils.isset)(ruleName)) {
    if ((0, _utils.isset)(value)) {
      el.style[camelCase(ruleName)] = value;
      return value;
    } else {
      return _global.window.getComputedStyle(el, null)[camelCase(ruleName)];
    }
  }
}
function data(key, value) {
  var el = this;
  var id;
  if ('__CACHE_KEY__' in el) {
    id = el.__CACHE_KEY__;
  } else {
    el.__CACHE_KEY__ = id = CACHE_KEY++;
    CACHE[id] = Object.assign({}, el.dataset);
  }
  var cached = CACHE[id];
  if ((0, _utils.isObject)(key)) {
    for (var ii in key) {
      cached[ii] = key[ii];
    }
  } else if ((0, _utils.isset)(key)) {
    if ((0, _utils.isset)(value)) {
      cached[key] = value;
      return value;
    }
    return cached[key];
  }
  return cached;
}
function attr(name, value) {
  if ((0, _utils.isObject)(name)) {
    for (var ii in name) {
      this.setAttribute(ii, name[ii]);
    }
    return this;
  } else if ((0, _utils.isset)(name)) {
    if ((0, _utils.isset)(value)) {
      this.setAttribute(name, value);
      return this;
    } else {
      return this.getAttribute(name);
    }
  }
  return '';
}
function text(textString) {
  if ((0, _utils.isset)(textString)) {
    this.textContent = textString;
    return this;
  } else {
    return this.textContent;
  }
}

function html(string) {
  if ((0, _utils.isset)(string)) {
    this.innerHTML = string;
    var scripts = this.getElementsByTagName('script');
    if (scripts) {
      scripts.forEach(function (script) {
        return Function(script.innerHTML || script.text || '')();
      });
    }
    return this;
  } else {
    return this.innerHTML;
  }
}
function camelCase(string) {
  return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function (all, letter) {
    return letter.toUpperCase();
  });
}

},{"./utils":5,"global":1}],3:[function(require,module,exports){
var _global = require('global');

var property; //https://github.com/WebReflection/dom4
/* jshint loopfunc: true, noempty: false*/
// http://www.w3.org/TR/dom/#element

var TemporaryPrototype;
var TemporaryTokenList;
var wrapVerifyToken;
var ArrayPrototype = Array.prototype;
var indexOf = ArrayPrototype.indexOf;
var splice = ArrayPrototype.splice;
var join = ArrayPrototype.join;
var push = ArrayPrototype.push;
var defineProperty = Object.defineProperty;
var NodePrototype = _global.window.Node.prototype;
var ElementPrototype = _global.window.Element.prototype;
var SVGElement = _global.window.SVGElement;
var classListDescriptor = {
  get: function get() {
    return new DOMTokenList(this);
  },
  set: function set() {}
};
var trim = /^\s+|\s+$/g;
var spaces = /\s+/;
var SPACE = '\x20';
var CLASS_LIST = 'classList';

// most likely an IE9 only issue
// see https://github.com/WebReflection/dom4/issues/6
if (!_global.document.createElement('a').matches('a')) {
  NodePrototype[property] = function (matches) {
    return function (selector) {
      return matches.call(this.parentNode ? this : createDocumentFragment().appendChild(this), selector);
    };
  }(NodePrototype[property]);
}

// used to fix both old webkit and SVG
DOMTokenList.prototype = {
  length: 0,
  add: function add() {
    for (var j = 0, token; j < arguments.length; j++) {
      token = arguments[j];
      if (!this.contains(token)) {
        push.call(this, property);
      }
    }
    if (this._isSVG) {
      this._.setAttribute('class', '' + this);
    } else {
      this._.className = '' + this;
    }
  },
  contains: function contains(token) {
    return indexOf.call(this, property = verifyToken(token)) > -1;
  },
  item: function item(i) {
    return this[i] || null;
  },
  remove: function remove() {
    for (var j = 0, token; j < arguments.length; j++) {
      token = arguments[j];
      if (this.contains(token)) {
        splice.call(this, j, 1);
      }
    }
    if (this._isSVG) {
      this._.setAttribute('class', '' + this);
    } else {
      this._.className = '' + this;
    }
  },
  toggle: toggle,
  toString: function toString() {
    return join.call(this, SPACE);
  }
};

if (SVGElement && !(CLASS_LIST in SVGElement.prototype)) {
  defineProperty(SVGElement.prototype, CLASS_LIST, classListDescriptor);
}

// http://www.w3.org/TR/dom/#domtokenlist
// iOS 5.1 has completely screwed this property
// classList in ElementPrototype is false
// but it's actually there as getter
if (!(CLASS_LIST in _global.document.documentElement)) {
  defineProperty(ElementPrototype, CLASS_LIST, classListDescriptor);
} else {
  // iOS 5.1 and Nokia ASHA do not support multiple add or remove
  // trying to detect and fix that in here
  TemporaryTokenList = _global.document.createElement('div')[CLASS_LIST];
  TemporaryTokenList.add('a', 'b', 'a');
  if (TemporaryTokenList !== 'a\x20b') {
    // no other way to reach original methods in iOS 5.1
    TemporaryPrototype = TemporaryTokenList.constructor.prototype;
    if (!('add' in TemporaryPrototype)) {
      // ASHA double fails in here
      TemporaryPrototype = _global.window.TemporaryTokenList.prototype;
    }
    wrapVerifyToken = function wrapVerifyToken(original) {
      return function () {
        var i = 0;
        while (i < arguments.length) {
          original.call(this, arguments[i++]);
        }
      };
    };
    TemporaryPrototype.add = wrapVerifyToken(TemporaryPrototype.add);
    TemporaryPrototype.remove = wrapVerifyToken(TemporaryPrototype.remove);
    // toggle is broken too ^_^ ... let's fix it
    TemporaryPrototype.toggle = toggle;
  }
}

// requestAnimationFrame partial polyfill
(function () {
  for (var raf, rAF = _global.window.requestAnimationFrame, cAF = _global.window.cancelAnimationFrame, prefixes = ['o', 'ms', 'moz', 'webkit'], i = prefixes.length; !cAF && i--;) {
    rAF = rAF || _global.window[prefixes[i] + 'RequestAnimationFrame'];
    cAF = _global.window[prefixes[i] + 'CancelAnimationFrame'] || _global.window[prefixes[i] + 'CancelRequestAnimationFrame'];
  }
  if (!cAF) {
    // some FF apparently implemented rAF but no cAF
    if (rAF) {
      raf = rAF;
      rAF = function rAF(callback) {
        var goOn = true;
        raf(function () {
          if (goOn) {
            callback.apply(this, arguments);
          }
        });
        return function () {
          goOn = false;
        };
      };
      cAF = function cAF(id) {
        id();
      };
    } else {
      rAF = function rAF(callback) {
        return setTimeout(callback, 15, 15);
      };
      cAF = function cAF(id) {
        clearTimeout(id);
      };
    }
  }
  _global.window.requestAnimationFrame = rAF;
  _global.window.cancelAnimationFrame = cAF;
})();

// http://www.w3.org/TR/dom/#customevent
try {
  new _global.window.CustomEvent('?');
} catch (o_O) {
  _global.window.CustomEvent = function (eventName, defaultInitDict) {

    // the infamous substitute
    function CustomEvent(type, eventInitDict) {
      /*jshint eqnull:true */
      var event = _global.document.createEvent(eventName);
      if (typeof type !== 'string') {
        throw new Error('An event name must be provided');
      }
      if (eventName === 'Event') {
        event.initCustomEvent = initCustomEvent;
      }
      if (eventInitDict == null) {
        eventInitDict = defaultInitDict;
      }
      event.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
      return event;
    }

    // attached at runtime
    function initCustomEvent(type, bubbles, cancelable, detail) {
      /*jshint validthis:true*/
      this.initEvent(type, bubbles, cancelable);
      this.detail = detail;
    }

    // that's it
    return CustomEvent;
  }(
  // is this IE9 or IE10 ?
  // where CustomEvent is there
  // but not usable as construtor ?
  _global.window.CustomEvent ?
  // use the CustomEvent interface in such case
  'CustomEvent' : 'Event',
  // otherwise the common compatible one
  {
    bubbles: false,
    cancelable: false,
    detail: null
  });
}

// http://www.w3.org/TR/domcore/#domtokenlist
function verifyToken(token) {
  if (!token) {
    throw 'SyntaxError';
  } else if (spaces.test(token)) {
    throw 'InvalidCharacterError';
  }
  return token;
}

function DOMTokenList(node) {
  var className = node.className,
      isSVG = typeof className === 'object',
      value = (isSVG ? className.baseVal : className).replace(trim, '');
  if (value.length) {
    push.apply(this, value.split(spaces));
  }
  this._isSVG = isSVG;
  this._ = node;
}

function createDocumentFragment() {
  return _global.document.createDocumentFragment();
}

function toggle(token, force) {
  if (this.contains(token)) {
    if (!force) {
      // force is not true (either false or omitted)
      this.remove(token);
    }
  } else if (force === undefined || force) {
    force = true;
    this.add(token);
  }
  return !!force;
}

},{"global":1}],4:[function(require,module,exports){
var arrayProto = Array.prototype;
var stringProto = String.prototype;
var arrayProps = {};
var stringProps = {};
/* object */

Object.assign = Object.assign || extend;

/* array */
if (!arrayProto.find) {
  arrayProps.find = {
    value: function value(predicate) {
      if (this === null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    }
  };
}
if (!arrayProto.includes) {
  arrayProps.includes = {
    value: has
  };
}
arrayProps.matches = { value: has };
arrayProps.contains = { value: has };
arrayProps.has = { value: has };

if (!Array.from) {
  Array.from = function (iterable) {
    var i = Number(iterable.length);
    var array = new Array(i);
    while (i--) {
      array[i] = iterable[i];
    }
    return array;
  };
}
/*if (!Array.isArray) {
  var op2str = Object.prototype.toString;
  Array.isArray = function(a) {
    return op2str.call(a) === '[object Array]';
  };
}*/

/* string */
if (!stringProto.includes) {
  stringProto.includes = has;
}
stringProps.matches = { value: has };
stringProps.contains = { value: has };
stringProps.has = { value: has };

if (!stringProto.startsWith) {
  stringProps.startsWith = {
    value: function value(string, position) {
      if (!position) {
        position = 0;
      }
      return this.indexOf(string, position) === position;
    }
  };
}
if (!stringProto.endsWith) {
  stringProps.endsWith = {
    value: function value(string, position) {
      var lastIndex;
      position = position || this.length;
      position = position - string.length;
      lastIndex = this.lastIndexOf(string);
      return lastIndex !== -1 && lastIndex === position;
    }
  };
}

Object.defineProperties(arrayProto, arrayProps);
Object.defineProperties(stringProto, stringProps);

/* number */
if (!Number.isFinite) {
  Number.isFinite = function (value) {
    return typeof value === 'number' && isFinite(value);
  };
}
if (!Number.isInteger) {
  Number.isInteger = function (value) {
    return typeof value === 'number' && isFinite(value) && value > -9007199254740992 && value < 9007199254740992 && Math.floor(value) === value;
  };
}
if (!Number.isNaN) {
  Number.isNaN = function (value) {
    return typeof value === 'number' && isNaN(value);
  };
}
if (!Number.parseInt) {
  Number.parseInt = parseInt;
}
if (!Number.parseFloat) {
  Number.parseFloat = parseFloat;
}

function has(it) {
  return this.indexOf(it) !== -1;
}
function extend(original, extended) {
  if (arguments.length > 2) {
    for (var i = 1, l = arguments.length; i < l; i++) {
      extend(original, arguments[i]);
    }
  } else {
    if (typeof extended === 'object' && extended !== null) {
      for (var key in extended) {
        original[key] = extended[key];
      }
    }
  }
  return original;
}

},{}],5:[function(require,module,exports){
exports.__esModule = true;
exports.now = exports.extend = undefined;
exports.isObject = isObject;
exports.isEmpty = isEmpty;
exports.isFunction = isFunction;
exports.isRegExp = isRegExp;
exports.isNode = isNode;
exports.isArray = isArray;
exports.isString = isString;
exports.isNumber = isNumber;
exports.isUndefined = isUndefined;
exports.isset = isset;
exports.is = is;
exports.isEqual = isEqual;
exports.isFragment = isFragment;
exports.rand = rand;
exports.result = result;
exports.inherits = inherits;
exports.pick = pick;
exports.noop = noop;
exports.contains = contains;
exports.clone = clone;
exports.keys = keys;
exports.throttle = throttle;
exports.debounce = debounce;
exports.encode = encode;
exports.strip_tags = strip_tags;

var _global = require('global');

var extend = exports.extend = Object.assign; // inherit.js https://gist.github.com/RubaXa/8857525

function isObject(value) {
  return typeof value === 'object' && value !== null;
}
function isEmpty(obj) {
  if (!isObject(obj)) {
    return false;
  }
  for (var i in obj) {
    return false;
  }
  return true;
}
function isFunction(value) {
  return typeof value === 'function';
}
function isRegExp(value) {
  return isset(value) && value instanceof RegExp;
}
function isNode(value) {
  return value instanceof _global.window.Node;
}
if (!Array.isArray) {
  var op2str = Object.prototype.toString;
  Array.isArray = function (a) {
    return op2str.call(a) === '[object Array]';
  };
}
function isArray(value) {
  return Array.isArray(value); //return isset(value) && value instanceof Array;
}
function isString(value) {
  return isset(value) && typeof value === 'string';
}
function isNumber(value) {
  return isset(value) && typeof value === 'number';
}
function isUndefined(value) {
  return typeof value === undefined;
}
function isset(value) {
  return value !== undefined;
}
function is(value) {
  return isset(value) && !!value;
}
function isEqual(input1, input2) {
  return input1 === input2 || JSON.stringify(input1) === JSON.stringify(input2);
}
function isFragment(node) {
  return isset(node) && node.nodeType === _global.window.Node.DOCUMENT_FRAGMENT_NODE;
}
var now = exports.now = Date.now ? Date.now : function () {
  return Number(new Date());
};
function rand() {
  return (Math.random() * 1e17).toString(36).replace('.', '');
}
function result(object, key) {
  if (isObject(object)) {
    var value = object[key];
    return isFunction(value) ? object[key]() : value;
  }
}
function inherits(protoProps, staticProps) {
  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var _parent = this;
  var child;
  // The constructor function for the new subclass is either defined by you
  // (the 'constructor' property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (isset(protoProps) && protoProps.hasOwnProperty('constructor')) {
    child = protoProps.constructor;
  } else {
    child = function child() {
      return _parent.apply(this, arguments);
    };
  }

  // Add static properties to the constructor function, if supplied.
  extend(child, _parent, staticProps);
  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  var Surrogate = function Surrogate() {
    this.constructor = child;
  };
  Surrogate.prototype = _parent.prototype;
  child.prototype = new Surrogate();

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (isset(protoProps)) {
    extend(child.prototype, protoProps);
  }

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = _parent.prototype;

  return child;
}
function pick(input, _keys) {
  /**
   * Creates a shallow clone of `object` composed of the specified properties.
   * Property names may be specified as individual arguments or as arrays of
   * property names.
   *
   * $.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
   * // => { 'name': 'fred' }
   *
   */
  var output = {};
  _keys.forEach(function (key) {
    if (key in input) {
      output[key] = input[key];
    }
  });
  return output;
}
function noop() {}
function contains(where, value) {
  if (isArray(this) || isString(this)) {
    value = where;
    where = this;
  }
  return where.indexOf(value) !== -1;
}
function clone(value) {
  if (isNode(value)) {
    return value.cloneNode(true);
  } else if (isObject(value)) {
    return extend({}, value);
  } else {
    return value;
  }
}
function keys(o) {
  if (isObject(o)) {
    return Object.keys(o) || [];
  }
  return [];
}

/*function nodeListToNode(methodName) {
  return function () {
    var args = arguments;
    var returnVals = [];
    this.each(function (node) {
      returnVals.push(UTILS[methodName].apply(node, args));
    });
    return returnVals;
  };
}
*/
/*for (var i in UTILS) {
  Np[i] = UTILS[i];
  NLp[i] = HCp[i] = Ap[i] = nodeListToNode(i);
}*/

_global.window.height = function () {
  return _global.html.clientHeight;
};
_global.window.width = function () {
  return _global.html.clientWidth;
};

//D.height = docGabarits('height');
//D.width = docGabarits('width');
/*
function docGabarits(name) {
  return function () {
    return Math.max(B['scroll' + name], D['scroll' + name], B['offset' + name], D['offset' + name], D['client' + name]);
  };
}
*/

function throttle(func, delay) {
  if (isFunction(this)) {
    delay = func;
    func = this;
  }
  var throttling = false;
  delay = delay || 100;
  return function () {
    if (!throttling) {
      func();
      throttling = true;
      setTimeout(function () {
        throttling = false;
      }, delay);
    }
  };
}

function debounce(func, delay) {
  if (isFunction(this)) {
    delay = func;
    func = this;
  }
  var timeout;
  delay = delay || 100;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(func, delay);
  };
}

function encode(str) {
  return encodeURIComponent(str).replace(/%5B/g, '[').replace(/%5D/g, ']');
}
var stripTagsRegExp;
function strip_tags(str) {
  if (typeof stripTagsRegExp === undefined) {
    stripTagsRegExp = /<\/?[^>]+>/gi;
  }
  return str.replace(stripTagsRegExp, '');
}

},{"global":1}]},{},[4,2,3]);
