'use strict';

exports.__esModule = true;

var _global = require('global');

exports['default'] = function () {
  var className = arguments.length <= 0 || arguments[0] === undefined ? 'disable-hover' : arguments[0];
  var interval = arguments.length <= 1 || arguments[1] === undefined ? 200 : arguments[1];

  var pointerEventsTimer;
  function pointerEvents() {
    requestAnimationFrame(function () {
      _global.body.classList.add(className);
      clearTimeout(pointerEventsTimer);
      pointerEventsTimer = setTimeout(function () {
        _global.body.classList.remove(className);
      }, interval);
    });
  }
  if ('pointerEvents' in document.body.style) {
    _global.window.on('scroll', pointerEvents);
  }
};

module.exports = exports['default'];