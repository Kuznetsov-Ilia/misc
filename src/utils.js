// inherit.js https://gist.github.com/RubaXa/8857525
import {window, html as HTML} from 'global';

export var extend = Object.assign;

export function isObject(value) {
  return typeof value === 'object' && value !== null;
}
export function isEmpty(obj) {
  if (!isObject(obj)) {
    return false;
  }
  for (var i in obj) {
    return false;
  }
  return true;
}
export function isFunction(value) {
  return typeof value === 'function';
}
export function isRegExp(value) {
  return isset(value) && value instanceof RegExp;
}
export function isNode(value) {
  return value instanceof window.Node;
}
if (!Array.isArray) {
  var op2str = Object.prototype.toString;
  Array.isArray = function(a) {
    return op2str.call(a) === '[object Array]';
  };
}
export function isArray(value) {
  return Array.isArray(value);//return isset(value) && value instanceof Array;
}
export function isString(value) {
  return isset(value) && typeof value === 'string';
}
export function isNumber(value) {
  return isset(value) && typeof value === 'number';
}
export function isUndefined(value) {
  return typeof value === undefined;
}
export function isset(value) {
  return value !== undefined;
}
export function is(value) {
  return isset(value) && !!value;
}
export function isEqual(input1, input2) {
  return input1 === input2 || JSON.stringify(input1) === JSON.stringify(input2);
}
export function isFragment(node) {
  return isset(node) && node.nodeType === window.Node.DOCUMENT_FRAGMENT_NODE;
}
export var now = Date.now ? Date.now : function () {
  return Number(new Date());
};
export function rand() {
  return (Math.random() * 1e17).toString(36).replace('.', '');
}
export function result(object, key) {
  if (isObject(object)) {
    var value = object[key];
    return isFunction(value) ? object[key]() : value;
  }
}
export function inherits(protoProps, staticProps) {
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
  var Surrogate = function () {
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
export function pick(input, _keys) {
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
export function noop() {}
export function contains(where, value) {
  if (isArray(this) || isString(this)) {
    value = where;
    where = this;
  }
  return where.indexOf(value) !== -1;
}
export function clone(value) {
  if (isNode(value)) {
    return value.cloneNode(true);
  } else if (isObject(value)) {
    return extend({}, value);
  } else {
    return value;
  }
}
export function keys(o) {
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


window.height = function () {
  return HTML.clientHeight;
};
window.width = function () {
  return HTML.clientWidth;
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

export function throttle(func, delay) {
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

export function debounce(func, delay) {
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

export function encode(str) {
  return encodeURIComponent(str).replace(/%5B/g, '[').replace(/%5D/g, ']');
}
var stripTagsRegExp;
export function strip_tags(str) {
  if (typeof stripTagsRegExp === undefined) {
    stripTagsRegExp = /<\/?[^>]+>/gi;
  }
  return str.replace(stripTagsRegExp, '');
}



export function decl(number, titles) {
  var cases = [2, 0, 1, 1, 1, 2];
  return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}


export function timestamp(timestamp) {
  return diff(parseInt(now() / 1000) - timestamp);
}
export function diff(date) {
  var time, words,
    minute = 60,
    hour = 3600,
    day = 86400,
    week = 604800,
    month = 2628000,
    year = 31536000;
  if (date < minute) {
    return '1 минуту';
  } else if (date < (time = minute) * 60) {
    words = ['минуту', 'минуты', 'минут'];
  } else if (date < (time = hour) * 24) {
    words = ['час', 'часа', 'часов'];
  } else if (date < (time = day) * 7) {
    words = ['день', 'дня', 'дней'];
  } else if (date < (time = week) * 5) {
    words = ['неделю', 'недели', 'недель'];
  } else if (date < (time = month) * 12) {
    words = ['месяц', 'месяца', 'месяцев'];
  } else if (time = year) {
    words = ['год', 'года', 'лет'];
  }
  var diff = parseInt(date / time);
  return `${diff} ${decl(diff, words)}`;
}
