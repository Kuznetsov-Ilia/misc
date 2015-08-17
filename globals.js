'use strict';

exports.__esModule = true;
var topLevelObject;
if (typeof window !== 'undefined') {
  topLevelObject = window;
} else if (typeof global !== 'undefined') {
  topLevelObject = global;
} else if (typeof self !== 'undefined') {
  topLevelObject = self;
} else {
  module.exports = {};
}
exports['default'] = topLevelObject;
module.exports = exports['default'];