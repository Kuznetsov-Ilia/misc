// inherit.js https://gist.github.com/RubaXa/8857525
'use strict';

exports.__esModule = true;
exports.isObject = isObject;
exports.isEmpty = isEmpty;
exports.isFunction = isFunction;
exports.contains = contains;
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

var _global = require('global');

if (!_global.window.Node) {
  _global.window.Node = _global.window.Element;
}
var CACHE = {};
var CACHE_KEY = 0;

var extend = Object.assign;

exports.extend = extend;

function isObject(value) {
  return typeof value === 'object' && value !== null;
}

function isEmpty(obj) {
  if (!isObject(obj)) {
    return false;
  }
  for (var i in obj) {
    return true;
    break;
  }
  return false;
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

function isNode(value) {
  return value instanceof _global.window.Node;
  /*  var _isNode = typeof window.Node === 'undefined' ? legacyIsNode : actualIsNode;
    isNode = _isNode;
    return isNode(value);  
    function legacyIsNode(value) {
      return typeof node === 'object' && typeof node.nodeType === 'number' && typeof node.nodeName === 'string'
    }
    function actualIsNode(value) {
      return value instanceof window.Node;
    }*/
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
  return isset(node) && node.nodeType === _global.window.Node.DOCUMENT_FRAGMENT_NODE;
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

function offset(el) {
  if (isNode(this)) {
    el = this;
  }
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
  if (isset(value)) {
    value = parseInt(value);
    this.style.height = value + 'px';
    return value;
  } else {
    return parseInt(_global.window.getComputedStyle(this, null).height);
  }
}

function width(value) {
  if (isset(value)) {
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
      return _global.window.getComputedStyle(el, null)[camelCase(ruleName)];
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

/*window.height = function () {
  return HTML.clientHeight;
};
window.width = function () {
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