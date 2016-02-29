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
var ua = _global.navigator.userAgent;
if (ua.indexOf('MSIE ') !== -1 || ua.indexOf('Trident/') !== -1 || ua.indexOf('Edge/') !== -1) {
  // rewrite broken cloneNode method in IE
  var originalCloneNode = Np.cloneNode;
  Np.cloneNode = function (deep) {
    // If the node is a text node, then re-create it rather than clone it
    var clone = this.nodeType === 3 ? _global.document.createTextNode(this.nodeValue) : originalCloneNode.call(this, false);
    if (deep) {
      var child = this.firstChild;
      while (child) {
        clone.appendChild(child.cloneNode(true));
        child = child.nextSibling;
      }
    }
    return clone;
  };
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
    //submit, focus, blur, load, unload, change, reset, scroll
    var types = name.split(/\s+/);
    var handler = callback;

    var _types$0$split = types[0].split('.');

    var eventName = _types$0$split[0];
    var _types$0$split$ = _types$0$split[1];
    var nameSpace = _types$0$split$ === undefined ? 'default' : _types$0$split$;


    if (context) {
      handler = callback.bind(context);
    }
    if (types.length > 1) {
      handler = delegate(types[1], handler);
    }
    el.addEventListener(eventName, handler, false);
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

  //не установлены хендлеры в принципе
  if (!(0, _utils.isset)(el.handlers)) {
    return el;
  } else if ((0, _utils.isset)(fn)) {
    // el.off(['click.popup', 'change'], fn)
    if ((0, _utils.isArray)(event)) {
      event.forEach(function (e) {
        el.removeEventListener(e, fn, false);
      });
    } else {
      // el.off('click.popup', fn)
      el.removeEventListener(event, fn, false);
    }
  } else if ((0, _utils.isset)(event)) {
    //el.off(['click.popup', 'change'])
    if ((0, _utils.isArray)(event)) {
      event.forEach(function (e) {
        var _e$split = e.split('.');

        var eventName = _e$split[0];
        var _e$split$ = _e$split[1];
        var nameSpace = _e$split$ === undefined ? 'default' : _e$split$;

        el.handlers[eventName][nameSpace].forEach(function (handler, i) {
          el.removeEventListener(eventName, handler, false);
          //delete el.handlers[eventName][nameSpace][i];
        });
        el.handlers[eventName][nameSpace] = [];
      });
    } else {
      // el.off(click.popup)

      var _event$split = event.split('.');

      var eventName = _event$split[0];
      var _event$split$ = _event$split[1];
      var nameSpace = _event$split$ === undefined ? 'default' : _event$split$;

      el.handlers[eventName][nameSpace].forEach(function (handler, i) {
        el.removeEventListener(eventName, handler, false);
        //delete el.handlers[i];
      });
      el.handlers[eventName][nameSpace] = [];
    }
  } else {
    // el.off()
    (0, _utils.keys)(el.handlers).forEach(function (eventName2) {
      (0, _utils.keys)(el.handlers[eventName2]).forEach(function (nameSpace2) {
        el.handlers[eventName2][nameSpace2].forEach(function (handler, i) {
          el.removeEventListener(eventName2, handler, false);
          //delete el.handlers[eventName2][nameSpace2][i];
        });
      });
    });
    el.handlers = {};
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