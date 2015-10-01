'use strict';

exports.__esModule = true;

var _events = require('./events');

var _utils = require('./utils');

exports['default'] = View;

var UID = 0;
//var Model = require('model');

function View() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  this.cid = UID++;
  if (_utils.isFunction(options.stopPreloader)) {
    this.stopPreloader = options.stopPreloader;
  }
  if (this.init !== _utils.noop) {
    this.init(options);
  }

  ///this.name = options.name;

  if ('Model' in options) {
    this.model = new options.Model(options.data);
  }

  if (options.watch && this.model) {
    var _this = this;
    this.model.on('change:' + options.watch, function (model /*, changedAttributeValue*/) {
      _this.render(model, model.get());
    });
  }

  /*if (this.inited !== noop) {
    this.inited(options);
  }*/
  return this;
}
View.assign = _utils.inherits;

Object.assign(_events.Eventable(View.prototype), {
  init: _utils.noop, // Set initial component state without triggering re-render
  didInsertElement: _utils.noop, //Provides opportunity for manual DOM manipulation
  willReceiveAttrs: _utils.noop, //React to changes in component attributes, so that setState can be invoked before render
  shouldUpdate: _utils.noop, //Gives a component an opportunity to reject downstream revalidation
  willUpdate: _utils.noop, //Invoked before a template is re-rendered to give the component an opportunity to inspect the DOM before updates have been applied
  didUpdate: _utils.noop, //Invoked after a template is re-rendered to give the component an opportunity to update the DOM
  willDestroyElement: _utils.noop, //The inverse of didInsertElement; clean up anything set up in that hook
  willRender: _utils.noop, //executed both after init and after willUpdate*
  didRender: _utils.noop, //executed both after didInsertElement and didUpdate*
  // *These hooks can be used in cases where the setup for initial render and subsequent re-renders is idempotent instead of duplicating the logic in both places. In most cases, it is better to try to make these hooks idempotent, in keeping with the spirit of "re-render from scratch every time"
  $: function $(selector) {
    return this.el.find(selector);
  },

  render: function render(root) {
    this.template.render(root);
    if (this.didRender !== _utils.noop) {
      this.didRender(root);
    }
    return this;
  },
  // Remove this view by taking the element out of the DOM, and removing any
  // applicable Backbone.Events listeners.
  remove: function remove() {
    this.undelegateEvents();

    var parent = this.el.parent();
    if (parent !== null) {
      parent.removeChild(this.el);
    }
    this.off();

    /*if (this.removed !== noop) {
      this.removed();
    }*/
    return this;
  },
  // Set callbacks, where `this.events` is a hash of
  //
  // *{"event selector": "callback"}*
  //
  //     {
  //       'mousedown .title':  'edit',
  //       'click .button':     'save',
  //       'click .open':       function(e) { ... }
  //     }
  //
  // pairs. Callbacks will be bound to the view, with `this` set properly.
  // Uses event delegation for efficiency.
  // Omitting the selector binds the event to `this.el`.
  // This only works for delegate-able events: not `focus`, `blur`, and
  // not `change`, `submit`, and `reset` in Internet Explorer.
  delegateEvents: function delegateEvents(inputEvents) {
    var events;
    if (_utils.isset(inputEvents)) {
      events = inputEvents;
    } else {
      events = _utils.result(this, 'events');
    }
    if (_utils.isObject(events)) {
      // we have valid map of events
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_utils.isFunction(method)) {
          method = this[events[key]];
          if (!_utils.isFunction(method)) {
            continue;
          }
        }
        this.el.on(key, method, this);
      }
    }
    return this;
  },

  // Clears all callbacks previously bound to the view with `delegateEvents`.
  // You usually don't need to use this, but may wish to if you have multiple
  // Backbone views attached to the same DOM element.
  undelegateEvents: function undelegateEvents() {
    this.el.off();
    return this;
  },

  _ensureElement: function _ensureElement() {
    /*if (!isset(this.el)) {
      this.el = $.new('div');
    }*/
    return this;
  }
});
module.exports = exports['default'];