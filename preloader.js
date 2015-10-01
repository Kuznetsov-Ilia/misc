'use strict';

exports.__esModule = true;

var _global = require('global');

var i;

exports['default'] = function (el, flag) {
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

module.exports = exports['default'];