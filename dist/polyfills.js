(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.on = on;
exports.off = off;
exports.trigger = trigger;

//var Ep = Element.prototype;

var _utils = require('./utils');

var D = document;
var W = window;
var Np = Node.prototype;
var NLp = NodeList.prototype;
var HCp = HTMLCollection.prototype;
var Ap = Array.prototype;

W.on = D.on = Np.on = on;
W.off = D.off = Np.off = off;
W.trigger = Np.trigger = D.trigger = trigger;
W.find = Np.find = D.find = find;
W.filter = Np.filter = D.filter = /*W.$ = Np.$ = D.$ =*/filter;
W.handlers = {};
D.handlers = {};
Np.handlers = {};

/*var base = {on, off, trigger, find, filter};
var singleProps = Object.keys(base).reduce((acc, value) => {
  acc[value] = base[value];
  return acc;
}, {});
Object.defineProperties(W, singleProps);
Object.defineProperties(D, singleProps);
Object.defineProperties(Np, singleProps);*/

var ES5ArrayMethods = ['join', 'split', 'concat', 'pop', 'push', 'shift', 'unshift', 'reverse', 'slice', 'splice', 'sort', 'indexOf', 'lastIndexOf', //ES3
'some', 'every', /*'find', 'filter',*/'map', 'reduce', 'reduceRight' //ES5
].reduce(function (acc, value) {
  acc[value] = { value: Ap[value] };
  return acc;
}, {});

var CustomMethods = {
  // on : onAll,
  off: offAll,
  find: findAll,
  filter: filterAll,
  trigger: triggerAll,
  matches: matchesAll
};
var props = Object.keys(CustomMethods).reduce(function (acc, value) {
  acc[value] = { value: CustomMethods[value] };
  return acc;
}, ES5ArrayMethods);

Object.defineProperties(NLp, props);
Object.defineProperties(HCp, props);

function on(el, name, callback, context) {
  if (_utils.isNode(this)) {
    context = callback;
    callback = name;
    name = el;
    el = this;
  }
  if (!el) {
    return false;
  }
  if (_utils.isArray(name)) {
    name.forEach(function (n) {
      on(el, n, callback, context);
    });
  } else if (_utils.isObject(name)) {
    context = callback;
    for (var i in name) {
      on(el, i, name[i], context);
    }
  } else {
    var types = name.split(/\s+/);
    var handler = callback;
    var eventName = types[0].split('.')[0];

    if (context) {
      handler = callback.bind(context);
    }
    if (types.length === 1) {
      el.addEventListener(eventName, handler, false);
    } else {
      el.addEventListener(eventName, delegate(types[1], handler), false);
    }
    el.handlers[name] = el.handlers[name] || [];
    el.handlers[name].push(handler);
  }
  return el;
}

function off(el, event, fn) {
  if (_utils.isNode(this)) {
    fn = event;
    event = el;
    el = this;
  }
  if (!el) {
    return false;
  }

  if (_utils.isset(this.handlers) || !_utils.keys(this.handlers).length) {
    return this;
  } else if (_utils.isset(fn)) {
    if (_utils.isArray(event)) {
      event.forEach(function (e) {
        el.removeEventListener(e, fn, false);
      });
    } else {
      this.removeEventListener(event, fn, false);
    }
  } else if (_utils.isset(event)) {
    if (_utils.isArray(event)) {
      event.forEach(function (e) {
        el.handlers[e].forEach(function (handler, i) {
          el.removeEventListener(e, handler, false);
          delete el.handlers[i];
        });
      });
    } else {
      this.handlers[event].forEach(function (handler, i) {
        el.removeEventListener(event, handler, false);
        delete el.handlers[i];
      });
    }
  } else {
    _utils.keys(this.handlers).forEach(function (e) {
      el.handlers[e].forEach(function (handler, i) {
        el.removeEventListener(e, handler, false);
        delete el.handlers[i];
      });
    });
  }
  return this;
}

function find(selector) {
  /*  if (typeof selector === 'function') {
    return Ap.find
  }*/
  switch (selector.charAt(0)) {
    case '#':
      return D.getElementById(selector.substr(1));
    case '.':
      return this.getElementsByClassName(selector.substr(1))[0];
    case /w+/gi:
      return this.getElementsByTagName(selector);
    default:
      return this.querySelector(selector || '☺');
  }
}

function filter(selector) {
  return this.querySelectorAll(selector || '☺');
}

function delegate(selector, handler) {
  return function (event) {
    if (event.target.matches(selector)) {
      return handler(event);
    } else if (event.target.matches(selector + ' *')) {
      var target = event.target.parent(selector);
      var pseudoEvent = {
        target: target,
        realTarget: event.target
      };
      ['initMouseEvent', 'initUIEvent', 'initEvent', 'preventDefault', 'stopImmediatePropagation', 'stopPropagation'].forEach(function (e) {
        if (e in event) {
          pseudoEvent[e] = event[e].bind(event);
        }
      });
      return handler(Object.assign({}, event, pseudoEvent));
    }
  };
}

function trigger(el, type, data) {
  if (_utils.isNode(this)) {
    data = type;
    type = el;
    el = this;
  }
  var event = D.createEvent('HTMLEvents');
  data = data || {};
  data.target = el;
  event.initEvent(type, true, true, data);
  event.data = data;
  event.eventName = type;
  //event.target = this;
  this.dispatchEvent(event);
  return this;
}

function onAll(name, callback, context) {
  this.forEach(function (node) {
    on(node, name, callback, context);
  });
  return this;
}
function offAll(event, fn) {
  this.forEach(function (node) {
    off(node, event, fn);
  });
  return this;
}
function triggerAll(type, data) {
  this.forEach(function (node) {
    trigger(node, type, data);
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
  return result.length ? result : null;
}
function matchesAll(selector) {
  return this.every(function (node) {
    return node.matches(selector);
  });
}

},{"./utils":6}],2:[function(require,module,exports){
//https://github.com/WebReflection/dom4
/* jshint loopfunc: true, noempty: false*/
// http://www.w3.org/TR/dom/#element

'use strict';

var head;
var property;
var TemporaryPrototype;
var TemporaryTokenList;
var wrapVerifyToken;
var ArrayPrototype = Array.prototype;
var indexOf = ArrayPrototype.indexOf;
var slice = ArrayPrototype.slice;
var splice = ArrayPrototype.splice;
var join = ArrayPrototype.join;
var defineProperty = Object.defineProperty;
var document = window.document;
var DocumentFragment = window.DocumentFragment;
var NodePrototype = window.Node.prototype;
var ElementPrototype = window.Element.prototype;
var ShadowRoot = window.ShadowRoot;
var SVGElement = window.SVGElement;
var classListDescriptor = {
  get: function get() {
    return new DOMTokenList(this);
  },
  set: function set() {}
};
var uid = 'dom4-tmp-'.concat(Math.random() * Date.now()).replace('.', '-');
var trim = /^\s+|\s+$/g;
var spaces = /\s+/;
var SPACE = '\x20';
var CLASS_LIST = 'classList';
// normalizes multiple ids as CSS query
var idSpaceFinder = / /g;
var idSpaceReplacer = '\\ ';
var properties = {
  matches: ElementPrototype.matchesSelector || ElementPrototype.webkitMatchesSelector || ElementPrototype.khtmlMatchesSelector || ElementPrototype.mozMatchesSelector || ElementPrototype.msMatchesSelector || ElementPrototype.oMatchesSelector || function (selector) {
    var parentNode = this.parentNode;
    return !!parentNode && -1 < indexOf.call(parentNode.querySelectorAll(selector), this);
  },
  closest: function closest(selector) {
    var parentNode = this,
        matches;
    while (
    // document has no .matches
    (matches = parentNode && parentNode.matches) && !parentNode.matches(selector)) {
      parentNode = parentNode.parentNode;
    }
    return matches ? parentNode : null;
  },
  prepend: function prepend() {
    var firstChild = this.firstChild,
        node = mutationMacro(arguments);
    if (firstChild) {
      this.insertBefore(node, firstChild);
    } else {
      this.appendChild(node);
    }
  },
  append: function append() {
    this.appendChild(mutationMacro(arguments));
  },
  before: function before() {
    var parentNode = this.parentNode;
    if (parentNode) {
      parentNode.insertBefore(mutationMacro(arguments), this);
    }
  },
  after: function after() {
    var parentNode = this.parentNode,
        nextSibling = this.nextSibling,
        node = mutationMacro(arguments);
    if (parentNode) {
      if (nextSibling) {
        parentNode.insertBefore(node, nextSibling);
      } else {
        parentNode.appendChild(node);
      }
    }
  },
  replaceWith: function replaceWith() {
    var parentNode = this.parentNode;
    if (parentNode) {
      parentNode.replaceChild(mutationMacro(arguments), this);
    }
  },
  remove: function remove() {
    var parentNode = this.parentNode;
    if (parentNode) {
      parentNode.removeChild(this);
    }
  },
  query: createQueryMethod('querySelector'),
  queryAll: createQueryMethod('querySelectorAll')
};

var props = Object.keys(properties).reduce(function (acc, name) {
  acc[name] = {
    value: properties[name]
  };
  return acc;
}, {});
Object.defineProperties(NodePrototype, props);

// bring query and queryAll to the document too
addQueryAndAll(document);

// brings query and queryAll to fragments as well
if (DocumentFragment) {
  addQueryAndAll(DocumentFragment.prototype);
} else {
  try {
    addQueryAndAll(createDocumentFragment().constructor.prototype);
  } catch (o_O) {}
}

// bring query and queryAll to the ShadowRoot too
if (ShadowRoot) {
  addQueryAndAll(ShadowRoot.prototype);
}

// most likely an IE9 only issue
// see https://github.com/WebReflection/dom4/issues/6
if (!document.createElement('a').matches('a')) {
  NodePrototype[property] = (function (matches) {
    return function (selector) {
      return matches.call(this.parentNode ? this : createDocumentFragment().appendChild(this), selector);
    };
  })(NodePrototype[property]);
}

// used to fix both old webkit and SVG
DOMTokenList.prototype = {
  length: 0,
  add: function add() {
    for (var j = 0, token; j < arguments.length; j++) {
      token = arguments[j];
      if (!this.contains(token)) {
        properties.push.call(this, property);
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
        splice.call(this, i, 1);
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
if (!(CLASS_LIST in document.documentElement)) {
  defineProperty(ElementPrototype, CLASS_LIST, classListDescriptor);
} else {
  // iOS 5.1 and Nokia ASHA do not support multiple add or remove
  // trying to detect and fix that in here
  TemporaryTokenList = document.createElement('div')[CLASS_LIST];
  TemporaryTokenList.add('a', 'b', 'a');
  if ('a\x20b' != TemporaryTokenList) {
    // no other way to reach original methods in iOS 5.1
    TemporaryPrototype = TemporaryTokenList.constructor.prototype;
    if (!('add' in TemporaryPrototype)) {
      // ASHA double fails in here
      TemporaryPrototype = window.TemporaryTokenList.prototype;
    }
    wrapVerifyToken = function (original) {
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
  for (var raf, rAF = window.requestAnimationFrame, cAF = window.cancelAnimationFrame, prefixes = ['o', 'ms', 'moz', 'webkit'], i = prefixes.length; !cAF && i--;) {
    rAF = rAF || window[prefixes[i] + 'RequestAnimationFrame'];
    cAF = window[prefixes[i] + 'CancelAnimationFrame'] || window[prefixes[i] + 'CancelRequestAnimationFrame'];
  }
  if (!cAF) {
    // some FF apparently implemented rAF but no cAF
    if (rAF) {
      raf = rAF;
      rAF = function (callback) {
        var goOn = true;
        raf(function () {
          if (goOn) callback.apply(this, arguments);
        });
        return function () {
          goOn = false;
        };
      };
      cAF = function (id) {
        id();
      };
    } else {
      rAF = function (callback) {
        return setTimeout(callback, 15, 15);
      };
      cAF = function (id) {
        clearTimeout(id);
      };
    }
  }
  window.requestAnimationFrame = rAF;
  window.cancelAnimationFrame = cAF;
})();

// http://www.w3.org/TR/dom/#customevent
try {
  new window.CustomEvent('?');
} catch (o_O) {
  window.CustomEvent = (function (eventName, defaultInitDict) {

    // the infamous substitute
    function CustomEvent(type, eventInitDict) {
      /*jshint eqnull:true */
      var event = document.createEvent(eventName);
      if (typeof type != 'string') {
        throw new Error('An event name must be provided');
      }
      if (eventName == 'Event') {
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
  })(
  // is this IE9 or IE10 ?
  // where CustomEvent is there
  // but not usable as construtor ?
  window.CustomEvent ?
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
    properties.push.apply(this, value.split(spaces));
  }
  this._isSVG = isSVG;
  this._ = node;
};

function createDocumentFragment() {
  return document.createDocumentFragment();
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

function createQueryMethod(methodName) {
  var createArray = methodName === 'querySelectorAll';
  return function (css) {
    var a,
        i,
        id,
        query,
        nl,
        selectors,
        node = this.parentNode;
    if (node) {
      for (id = this.getAttribute('id') || uid, query = id === uid ? id : id.replace(idSpaceFinder, idSpaceReplacer), selectors = css.split(','), i = 0; i < selectors.length; i++) {
        selectors[i] = '#' + query + ' ' + selectors[i];
      }
      css = selectors.join(',');
    }
    if (id === uid) this.setAttribute('id', id);
    nl = (node || this)[methodName](css);
    if (id === uid) this.removeAttribute('id');
    // return a list
    if (createArray) {
      i = nl.length;
      a = new Array(i);
      while (i--) a[i] = nl[i];
    }
    // return node or null
    else {
        a = nl;
      }
    return a;
  };
}

function addQueryAndAll(where) {
  if (!('query' in where)) {
    where.query = ElementPrototype.query;
  }
  if (!('queryAll' in where)) {
    where.queryAll = ElementPrototype.queryAll;
  }
}

function mutationMacro(nodes) {
  if (nodes.length === 1) {
    return textNodeIfString(nodes[0]);
  }
  for (var fragment = createDocumentFragment(), list = slice.call(nodes), i = 0; i < nodes.length; i++) {
    fragment.appendChild(textNodeIfString(list[i]));
  }
  return fragment;
}

function textNodeIfString(node) {
  return typeof node === 'string' ? document.createTextNode(node) : node;
}

},{}],3:[function(require,module,exports){
module.exports = {};

},{}],4:[function(require,module,exports){
(function (global){
var mock = {
  location: {
    ancestorOrigins: {},
    origin: "",
    hash: "",
    search: "",
    pathname: "",
    port: "",
    hostname: "",
    host: "",
    protocol: "",
    href: ""
  }
};

if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = Object.assign(global, mock);
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = mock
}



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
'use strict';

var _utils = require('./utils');

window.$ = function () {
  return {
    css: function css() {
      // hello EGOR!
    }
  };
};
var arrayProto = Array.prototype;
var stringProto = String.prototype;

/* object */
Object.assign = Object.assign || _utils.extend;

/* array */
if (!arrayProto.find) {
  arrayProto.find = function (predicate) {
    if (this == null) {
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
  };
}
if (!arrayProto.includes) {
  arrayProto.includes = has;
}
arrayProto.contains = has;
arrayProto.has = has;

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

/* string */
if (!stringProto.includes) {
  stringProto.includes = has;
}
stringProto.contains = has;
stringProto.has = has;
if (!stringProto.startsWith) {
  stringProto.startsWith = function (string, position) {
    if (!position) {
      position = 0;
    }
    return this.indexOf(string, position) == position;
  };
}
if (!stringProto.endsWith) {
  stringProto.endsWith = function (string, position) {
    var lastIndex;
    position = position || this.length;
    position = position - string.length;
    lastIndex = this.lastIndexOf(string);
    return -1 != lastIndex && lastIndex == position;
  };
}

/* number */
if (!Number.isFinite) {
  Number.isFinite = function (value) {
    return 'number' == typeof value && isFinite(value);
  };
}
if (!Number.isInteger) {
  Number.isInteger = function (value) {
    return 'number' == typeof value && isFinite(value) && value > -9007199254740992 && value < 9007199254740992 && Math.floor(value) == value;
  };
}
if (!Number.isNaN) {
  Number.isNaN = function (value) {
    return 'number' == typeof value && isNaN(value);
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

},{"./utils":6}],6:[function(require,module,exports){
// inherit.js https://gist.github.com/RubaXa/8857525

'use strict';

exports.__esModule = true;
exports.extend = extend;
exports.isObject = isObject;
exports.isFunction = isFunction;
exports.contains = contains;
exports.isRegExp = isRegExp;
exports.isFunction = isFunction;
exports.isNode = isNode;
exports.isObject = isObject;
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
exports.clone = clone;
exports.keys = keys;
exports.outerHeight = outerHeight;
exports.outerWidth = outerWidth;
exports.offset = offset;
exports.height = height;
exports.width = width;
exports.position = position;
exports.parent = parent;
exports.parentAll = parentAll;
exports.siblings = siblings;
exports.prev = prev;
exports.prevAll = prevAll;
exports.next = next;
exports.nextAll = nextAll;
exports.first = first;
exports.after = after;
exports.before = before;
exports.append = append;
exports.prepend = prepend;
exports.replaceWith = replaceWith;
exports.css = css;
exports.data = data;
exports.attr = attr;
exports.text = text;
exports.html = html;
exports.throttle = throttle;
exports.debounce = debounce;

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var _globalHtml = require('global/html');

var _globalHtml2 = _interopRequireDefault(_globalHtml);

var CACHE = {};
var CACHE_KEY = 0;

function extend(original, extended) {
  if (arguments.length > 2) {
    for (var i = 1, l = arguments.length; i < l; i++) {
      extend(original, arguments[i]);
    }
  } else {
    if (isObject(extended)) {
      for (var key in extended) {
        original[key] = extended[key];
      }
    }
  }
  return original;
}

function isObject(value) {
  return typeof value === 'object';
}

function isFunction(value) {
  return typeof value === 'function';
}

function contains(where, value) {
  if (isArray(this) || isString(this)) {
    value = where;
    where = this;
  }
  return where.indexOf(value) !== -1;
}

function isRegExp(value) {
  return isset(value) && value instanceof RegExp;
}

function isFunction(value) {
  return isset(value) && value instanceof Function;
}

function isNode(value) {
  return isset(value) && value instanceof Node;

  /*return !!(object && (
    ((typeof Node === 'function' ? object instanceof Node : typeof object === 'object' &&
    typeof object.nodeType === 'number' &&
    typeof object.nodeName === 'string'))
  ));*/
}

function isObject(value) {
  return isset(value) && value instanceof Object;
}

function isArray(value) {
  return isset(value) && value instanceof Array;
}

function isString(value) {
  return isset(value) && typeof value === 'string';
}

function isNumber(value) {
  return isset(value) && typeof value === 'number';
}

function isUndefined(value) {
  return typeof value === 'undefined';
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
  return isset(node) && node.nodeType === _globalWindow2['default'].Node.DOCUMENT_FRAGMENT_NODE;
}

var now = Date.now ? Date.now : function () {
  return Number(new Date());
};
exports.now = now;

function rand() {
  return (Math.random() * 1e17).toString(36);
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
    child = function () {
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
    return Object.keys(o);
  }
  return [];
}

function outerHeight(el, withMargins) {
  if (isNode(this)) {
    el = this;
  }
  if (el) {
    var _height = el.offsetHeight;
    if (withMargins) {
      var style = _globalWindow2['default'].getComputedStyle(el, null);
      _height += parseInt(style.marginTop) + parseInt(style.marginBottom, 10);
    }
    return _height;
  }
}

function outerWidth(withMargins) {
  var _width = this.offsetWidth;
  if (withMargins) {
    var style = _globalWindow2['default'].getComputedStyle(this, null);
    _width += parseInt(style.marginLeft) + parseInt(style.marginRight, 10);
  }
  return width;
}

function offset(el) {
  if (isNode(this)) {
    el = this;
  }
  if (!el) {
    return {};
  }
  var box = el.getBoundingClientRect();
  return {
    top: box.top + _globalWindow2['default'].pageYOffset - _globalHtml2['default'].clientTop,
    left: box.left + _globalWindow2['default'].pageXOffset - _globalHtml2['default'].clientLeft
  };
}

function height(value) {
  if (isset(value)) {
    value = parseInt(value);
    this.style.height = value + 'px';
    return value;
  } else {
    return parseInt(_globalWindow2['default'].getComputedStyle(this, null).height);
  }
}

function width(value) {
  if (isset(value)) {
    value = parseInt(value);
    this.style.width = value + 'px';
    return value;
  } else {
    return parseInt(_globalWindow2['default'].getComputedStyle(this, null).width);
  }
}

function position() {
  return {
    left: this.offsetLeft,
    top: this.offsetTop
  };
}

function parent(el, filter) {
  if (isNode(this)) {
    var tmp = [this, el];
    el = tmp[0];
    filter = tmp[1];
  }
  if (!el) {
    return false;
  }
  if (isset(filter)) {
    var filterFn;
    if (isNumber(filter)) {
      filterFn = function (node, k) {
        return k === filter;
      };
    } else {
      filterFn = function (node) {
        return node.matches(filter);
      };
    }

    var _parent = el;
    var ii = 1;
    while (_parent = _parent.parentElement) {
      if (filterFn(_parent, ii)) {
        return _parent;
      }
      ii++;
    }
    return false;
  } else {
    return el.parentElement;
  }
}

function parentAll(filter) {
  if (isset(filter)) {
    var filterFn;
    if (isNumber(filter)) {
      filterFn = function (node, iii) {
        return iii === filter;
      };
    } else {
      filterFn = function (node) {
        return node.matches(filter);
      };
    }

    var _parent = this;
    var ii = 1;
    var _result = [];
    while (_parent = _parent.parentElement) {
      if (filterFn(_parent, ii)) {
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

function siblings(filter) {
  var _this = this;
  return this.parent().children.filter(function (child) {
    var valid = child !== _this;
    if (valid && isset(filter)) {
      valid = child.matches(filter);
    }
    return valid;
  });
}

function prev(filter) {
  if (isset(filter)) {
    var _prev = this;
    //var result = [];
    while (_prev = _prev.previousElementSibling) {
      if (_prev.matches(filter)) {
        return _prev;
      }
    }
    return false;
  } else {
    return this.previousElementSibling;
  }
}

function prevAll(filter) {
  if (isset(filter)) {
    var _prev = this;
    var __result = [];
    while (_prev = _prev.previousElementSibling) {
      if (_prev.matches(filter)) {
        __result.push(_prev);
      }
    }
    return result;
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
  if (isset(filter)) {
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

function nextAll(filter) {
  if (isset(filter)) {
    var _next = this;
    var __result = [];
    while (_next = _next.nextElementSibling) {
      if (_next.matches(filter)) {
        __result.push(_next);
      }
    }
    return result;
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
  if (isset(filter)) {
    var children = this.children;
    if (isset(children) && children.length > 0) {
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

function after(el, _html, _position) {
  if (isNode(this)) {
    var tmp = [this, el, _html];
    el = tmp[0];
    _html = tmp[1];
    _position = tmp[2];
  }
  if (_position) {
    _position = 'afterend';
  } else {
    _position = 'afterbegin';
  }
  if (isset(_html)) {
    if (isString(_html)) {
      return el.insertAdjacentHTML(_position, _html);
    } else if (isNode(_html)) {
      var _parent = el.parentNode;
      var _next = el.nextElementSibling;
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
  if (isset(_html)) {
    if (isString(_html)) {
      return this.insertAdjacentHTML(_position, _html);
    } else if (isNode(_html)) {
      return this.parent().insertBefore(_html, this);
    }
  }
  return '';
}

function append(node) {
  if (isNode(node)) {
    return this.parent().appendChild(node);
  } else if (isString(node)) {
    return this.parent().before(node, 1);
  }
}

function prepend(node) {
  if (isNode(node)) {
    this.parent().insertBefore(node, this.parent().firstChild);
  } else if (isArray(node)) {
    var _this = this;
    node.each(function (n) {
      _this.prepend(n);
    });
  }
  return this;
}

function replaceWith(stringHTML) {
  if (isset(stringHTML)) {
    this.outerHTML = stringHTML;
  }
  return this;
}

function css(el, ruleName, value) {
  if (isNode(this)) {
    var tmp = [this, el, ruleName];
    el = tmp[0];
    ruleName = tmp[1];
    value = tmp[2];
  }
  if (isObject(ruleName)) {
    for (var ii in ruleName) {
      el.style[camelCase(ii)] = ruleName[ii];
    }
    return ruleName;
  } else if (isset(ruleName)) {
    if (isset(value)) {
      el.style[camelCase(ruleName)] = value;
      return value;
    } else {
      return _globalWindow2['default'].getComputedStyle(el, null)[camelCase(ruleName)];
    }
  }
  return '';
}

function data(el, key, value) {
  if (isNode(this)) {
    var _tmp = [this, el, key];
    el = _tmp[0];
    key = _tmp[1];
    value = _tmp[2];
  }
  var id;
  if ('__CACHE_KEY__' in el) {
    id = el.__CACHE_KEY__;
  } else {
    el.__CACHE_KEY__ = id = CACHE_KEY++;
    CACHE[id] = extend({}, el.dataset);
  }
  var cached = CACHE[id];
  if (isObject(key)) {
    for (var ii in key) {
      cached[ii] = key[ii];
    }
  } else if (isset(key)) {
    if (isset(value)) {
      cached[key] = value;
      return value;
    }
    return cached[key];
  }
  return cached;
}

function attr(name, value) {
  if (isObject(name)) {
    for (var ii in name) {
      this.setAttribute(ii, name[ii]);
    }
    return this;
  } else if (isset(name)) {
    if (isset(value)) {
      this.setAttribute(name, value);
      return this;
    } else {
      return this.getAttribute(name);
    }
  }
  return '';
}

function text(textString) {
  if (isset(textString)) {
    this.textContent = textString;
    return this;
  } else {
    return this.textContent;
  }
}

function html(string) {
  if (isset(string)) {
    this.innerHTML = string;
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

/*WINDOW.height = function () {
  return HTML.clientHeight;
};
WINDOW.width = function () {
  return HTML.clientWidth;
};*/

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

/*[ //EC5
  'some', 'every', 'filter', 'map', 'reduce', 'reduceRight',
  //Array
  'join', 'split', 'concat', 'pop', 'push', 'shift', 'unshift', 'reverse', 'slice', 'splice', 'sort', 'indexOf', 'lastIndexOf'
].forEach(function (method) {
  NLp[method] = HCp[method] = Ap[method];
});*/

},{"global/html":3,"global/window":4}]},{},[5,1,2]);
