exports.__esModule = true;

exports.default = function (el, flag) {
  if (el) {
    if (flag) {
      if (i === undefined) {
        i = _global.document.createElement('i');
        i.className = 'preloader';
      }
      el.appendChild(i);
    } else if (i) {
      i.remove();
    }
  }
};

var _global = require('global');

var i;