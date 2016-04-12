exports.__esModule = true;

var _global = require('global');

var _global2 = _interopRequireDefault(_global);

var _events = require('misc/events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var STORAGE = (0, _events.Eventable)({});
if ('localStorage' in _global2.default) {
  var localStorage = _global2.default.localStorage;
  Object.assign(STORAGE, {
    isNative: true,
    get: function get(id) {
      var value;
      try {
        value = localStorage.getItem(id);
      } catch (e) {
        STORAGE.trigger({
          type: 'error',
          method: 'get',
          data: { e: e, id: id }
        });
      }
      return value;
    },
    set: function set(id, value) {
      try {
        localStorage.setItem(id, value);
      } catch (e) {
        STORAGE.trigger({
          type: 'error',
          method: 'set',
          data: { e: e, id: id, value: value }
        });
      }
    },
    remove: function remove(id) {
      try {
        localStorage.removeItem(id);
      } catch (e) {
        STORAGE.trigger({
          type: 'error',
          method: 'remove',
          data: { e: e, id: id }
        });
      }
    }
  });
} else {
  Object.assign(STORAGE, {
    isNative: false,
    _data: {},
    set: function set(id, val) {
      this._data[id] = String(val);
    },
    get: function get(id) {
      return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    },
    remove: function remove(id) {
      return delete this._data[id];
    },
    clear: function clear() {
      this._data = {};
    }
  });
}
exports.default = STORAGE;