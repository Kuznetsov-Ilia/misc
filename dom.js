'use strict';

var D = document;
var W = window;
var Np = Node.prototype;
/*var NLp = NodeList.prototype;
var HCp = HTMLCollection.prototype;
var Ap = Array.prototype;
var Ep = Element.prototype;*/
import {
  isNode, isArray, isObject, isset, keys, extend
}
from 'misc/utils';

export function on(el, name, callback, context) {
  if (isNode(this)) {
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
      ['initMouseEvent', 'initUIEvent', 'initEvent', 'preventDefault', 'stopImmediatePropagation', 'stopPropagation'].each(function (e) {
        if (e in event) {
          pseudoEvent[e] = event[e].bind(event);
        }
      });
      return handler(extend({}, event, pseudoEvent));
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

W.on = on;
W.off = off;
W.trigger = trigger;
W.handlers = {};

Np.on = D.on = on;
Np.off = D.off = off;
Np.trigger = D.trigger = trigger;
Np.handlers = {};
D.handlers = {};

/*
NLp.on = HCp.on = Ap.on = function (name, callback, context) {
  this.each(function (node) {
    on.call(node, name, callback, context);
  });
  return this;
};
NLp.off = HCp.off = Ap.off = function (event, fn) {
  this.each(function (node) {
    off.call(node, event, fn);
  });
  return this;
};
NLp.trigger = HCp.trigger = Ap.trigger = function (type, data) {
  this.each(function (node) {
    trigger.call(node, type, data);
  });
  return this;
};


Np.find = Np.$ = function (selector) {
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
};
Np.findAll = function (selector) {
  return this.querySelectorAll(selector || '☺');
};


NLp.find = NLp.$ = Ap.find = Ap.$ = function (selector) {
  this.each(function (node) {
    var r = node.find(selector);
    if (r) {
      return r;
    }
  });
  return false;
};

NLp.findAll = Ap.findAll = function (selector) {
  var result = [];
  var r;

  this.each(function (node) {
    r = node.findAll(selector);
    if (r) {
      result.push(r);
    }
  });
  return result;
};

Np.matches = Np.is = Ep.matches || Ep.matchesSelector || Ep.webkitMatchesSelector || Ep.mozMatchesSelector || Ep.msMatchesSelector || Ep.oMatchesSelector || Ep.webkitMatches || Ep.mozMatches || Ep.msMatches || Ep.oMatches;

NLp.matches = HCp.matches = Ap.matches =
  NLp.is = HCp.is = Ap.is = function (selector) {
    return this.every(function (node) {
      return node.matches(selector);
    });
  };

*/
