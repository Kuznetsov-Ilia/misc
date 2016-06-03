var CACHED = {};
import {isArray} from 'my-util';
var head = document.getElementsByTagName('head')[0] || document.documentElement
export default function loader (src) {
  if (isArray(src)) {
    return Promise.all(src.map(loader));
  }
  return new Promise(function (resolve, reject) {
    if (CACHED[src]) {
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
