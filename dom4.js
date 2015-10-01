//https://github.com/WebReflection/dom4
/* jshint loopfunc: true, noempty: false*/
// http://www.w3.org/TR/dom/#element
'use strict';

var _global = require('global');

var property;
var TemporaryPrototype;
var TemporaryTokenList;
var wrapVerifyToken;
var ArrayPrototype = Array.prototype;
var indexOf = ArrayPrototype.indexOf;
var slice = ArrayPrototype.slice;
var splice = ArrayPrototype.splice;
var join = ArrayPrototype.join;
var push = ArrayPrototype.push;
var defineProperty = Object.defineProperty;
var document = _global.window.document;
var DocumentFragment = _global.window.DocumentFragment;
var NodePrototype = _global.window.Node.prototype;
var ElementPrototype = _global.window.Element.prototype;
var ShadowRoot = _global.window.ShadowRoot;
var SVGElement = _global.window.SVGElement;
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
      TemporaryPrototype = _global.window.TemporaryTokenList.prototype;
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
  for (var raf, rAF = _global.window.requestAnimationFrame, cAF = _global.window.cancelAnimationFrame, prefixes = ['o', 'ms', 'moz', 'webkit'], i = prefixes.length; !cAF && i--;) {
    rAF = rAF || _global.window[prefixes[i] + 'RequestAnimationFrame'];
    cAF = _global.window[prefixes[i] + 'CancelAnimationFrame'] || _global.window[prefixes[i] + 'CancelRequestAnimationFrame'];
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
  _global.window.requestAnimationFrame = rAF;
  _global.window.cancelAnimationFrame = cAF;
})();

// http://www.w3.org/TR/dom/#customevent
try {
  new _global.window.CustomEvent('?');
} catch (o_O) {
  _global.window.CustomEvent = (function (eventName, defaultInitDict) {

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