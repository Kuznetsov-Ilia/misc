var arrayProto = Array.prototype;
var stringProto = String.prototype;
var arrayProps = {};
var stringProps = {};
/* object */

Object.assign = Object.assign || extend;

/* array */
if (!arrayProto.find) {
  arrayProps.find = {
    value: function (predicate) {
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
arrayProps.contains = {value: has};
arrayProps.has = {value: has};

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
stringProps.contains = {value: has};
stringProps.has = {value: has};

if (!stringProto.startsWith) {
  stringProps.startsWith = {
    value: function (string, position) {
      if (!position) {
        position = 0;
      }
      return this.indexOf(string, position) === position;
    }
  };
}
if (!stringProto.endsWith) {
  stringProps.endsWith = {
    value: function (string, position) {
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
    return typeof value === 'number'
      && isFinite(value)
      && value > -9007199254740992
      && value < 9007199254740992
      && Math.floor(value) === value;
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
