import { extend } from './utils';
window.$ = function () {
  return {
    css() {
      // hello EGOR!
    }
  };
};
var arrayProto = Array.prototype;
var stringProto = String.prototype;

/* object */
Object.assign = Object.assign || extend;

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
    return 'number' == typeof value && isFinite(value) &&
      value > -9007199254740992 && value < 9007199254740992 &&
      Math.floor(value) == value;
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
