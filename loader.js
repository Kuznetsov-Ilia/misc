var LOADED = {};
import {document} from 'global';
//import Promise from './Promise';
//import fetch from './fetch';
var head = document.getElementsByTagName('head')[0] || document.documentElement;

export default function (src) {
  //return fetch().
  return new Promise(function (resolve, reject) {
    if (LOADED[src]) {
      resolve();
    } else {
      var script = document.createElement('script');
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
}
