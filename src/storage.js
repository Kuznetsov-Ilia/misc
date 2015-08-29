import window from 'global';
import {Eventable} from 'misc/events';
var STORAGE = Eventable({});
if ('localStorage' in window) {
  var localStorage = window.localStorage;
  Object.assign(STORAGE, {
    isNative: true,
    get: function(id) {
      var value;
      try {
        value = localStorage.getItem(id);
      } catch(e) {
        STORAGE.trigger({
          type: 'error',
          method: 'get',
          data: { e: e, id: id}
        });
      }
      return value;
    },
    set: function(id, value){
      try {
        localStorage.setItem(id, value);
      } catch(e) {
        STORAGE.trigger({
          type: 'error',
          method: 'set',
          data: { e: e, id: id, value: value}
        });
      }
    },
    remove: function(id) {
      try {
        localStorage.removeItem(id);
      } catch(e) {
        STORAGE.trigger({
          type: 'error',
          method: 'remove',
          data: { e: e, id: id}
        });
      }
    }
  });
} else {
  Object.assign(STORAGE, {
    isNative: false,
    _data: {},
    set: function (id, val) {
      this._data[id] = String(val);
    },
    get: function (id) {
      return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    },
    remove: function (id) {
      return delete this._data[id];
    },
    clear: function () {
      this._data = {};
    }
  });
}
export default STORAGE;
