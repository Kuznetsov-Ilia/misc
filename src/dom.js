var D = document;
var W = window;
var Np = Node.prototype;
var NLp = NodeList.prototype;
var HCp = HTMLCollection.prototype;
var Ap = Array.prototype;
//var Ep = Element.prototype;
import { isNode, isString, isArray, isObject, isset, keys } from './utils';

W.on = D.on = Np.on = on;
W.off = D.off = Np.off = off;
W.trigger = Np.trigger = D.trigger = trigger;
W.find = Np.find = D.find = find;
W.filter = Np.filter = D.filter = /*W.$ = Np.$ = D.$ =*/ filter;
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

var ES5ArrayMethods = [
  'join', 'split', 'concat', 'pop', 'push', 'shift', 'unshift', 'reverse', 'slice', 'splice', 'sort', 'indexOf', 'lastIndexOf',//ES3
  'some', 'every', /*'find', 'filter',*/ 'map', 'reduce', 'reduceRight'//ES5
].reduce((acc, value) => {
  acc[value] = {value: Ap[value]};
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
var props = Object.keys(CustomMethods).reduce((acc, value) => {
  acc[value] = {value: CustomMethods[value]};
  return acc;
}, ES5ArrayMethods);

Object.defineProperties(NLp, props);
Object.defineProperties(HCp, props);


export function on(el, name, callback, context) {
  if (isNode(this) || (isString(el) && this === W)) {
    context = callback;
    callback = name;
    name = el;
    el = this;
  }
  if (!el) {
    return false;
  }
  if (isArray(name)) {
    name.forEach(function (n) {
      on(el, n, callback, context);
    });
  } else if (isObject(name)) {
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
export function off(el, event, fn) {
  if (isNode(this)) {
    fn = event;
    event = el;
    el = this;
  }
  if (!el) {
    return false;
  }

  if (isset(this.handlers) || !keys(this.handlers).length) {
    return this;
  } else if (isset(fn)) {
    if (isArray(event)) {
      event.forEach(function (e) {
        el.removeEventListener(e, fn, false);
      });
    } else {
      this.removeEventListener(event, fn, false);
    }
  } else if (isset(event)) {
    if (isArray(event)) {
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
    keys(this.handlers).forEach(function (e) {
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

function filter (selector) {
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
      ['initMouseEvent', 'initUIEvent', 'initEvent', 'preventDefault', 'stopImmediatePropagation', 'stopPropagation']
      .forEach(e => {
        if (e in event) {
          pseudoEvent[e] = event[e].bind(event);
        }
      });
      return handler(Object.assign({}, event, pseudoEvent));
    }
  };
}

export function trigger(el, type, data) {
  if (isNode(this)) {
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

function onAll (name, callback, context) {
  this.forEach(node => {on(node, name, callback, context)});
  return this;
}
function offAll (event, fn) {
  this.forEach(node => {off(node, event, fn)});
  return this;
}
function triggerAll (type, data) {
  this.forEach(node => {trigger(node, type, data)});
  return this;
}
function findAll(selector) {
  if (typeof selector === 'function') {
    return Ap.find.call(this, selector);
  }
  this.forEach(node => {
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
  this.forEach(node => {
    r = node.filter(selector);
    if (r) {
      result.push(r);
    }
  });
  return result.length ? result : null;
}
function matchesAll (selector) {
  return this.every(node => node.matches(selector));
}
