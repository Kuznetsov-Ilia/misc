'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Promise = require('./Promise');

var _Promise2 = _interopRequireDefault(_Promise);

var LOADED = {};

exports['default'] = function (src) {
  return new _Promise2['default'](function (resolve, reject) {
    if (LOADED[src]) {
      resolve();
    } else {
      var element = document.createElement('script');
      var loadTimer = setTimeout(reject, 5000);
      element.onload = function () {
        resolve();
        clearTimeout(loadTimer);
      };
      element.setAttribute('async', '1');
      element.setAttribute('defer', '1');
      element.src = src;
      document.body.appendChild(element);
    }
  });
};

module.exports = exports['default'];