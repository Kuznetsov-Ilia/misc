var LOADED = {};
import Promise from './Promise';
export default function (src) {
  return new Promise(function (resolve, reject) {
    if (LOADED[src]) {
      resolve();
    } else {
      var element = document.createElement('script');
      var loadTimer = setTimeout(reject, 5000);
      element.onload = function() {
        resolve();
        clearTimeout(loadTimer);
      }
      element.setAttribute('async', '1');
      element.setAttribute('defer', '1');
      element.src = src;
      document.body.appendChild(element);
    }
  });
}


