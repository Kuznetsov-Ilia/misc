// inherit.js https://gist.github.com/RubaXa/8857525
'use strict';

exports.__esModule = true;
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

var now = Date.now ? Date.now : function () {
  return Number(new Date());
};
exports.now = now;

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