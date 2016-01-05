'use strict';

exports.__esModule = true;

var _global = require('global');

//import Promise from './Promise';
//import fetch from './fetch';
var LOADED = {};
var head = _global.document.getElementsByTagName('head')[0] || _global.document.documentElement;

exports['default'] = function (src) {
  //return fetch().
  return new Promise(function (resolve, reject) {
    if (LOADED[src]) {
      resolve();
    } else {
      var script = _global.document.createElement('script');
      var loadTimer = setTimeout(reject, 5000);
      var done = false;
      script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
          resolve();
          clearTimeout(loadTimer);
          // Handle memory leak in IE
          script.onload = script.onreadystatechange = null;
          if (head && script.parentNode) {
            head.removeChild(script);
          }
        }
      };
      script.setAttribute('async', '1');
      script.setAttribute('defer', '1');
      script.src = src;
      // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
      // This arises when a base node is used (#2709 and #4378).
      head.insertBefore(script, head.firstChild);
    }
  });
};

module.exports = exports['default'];