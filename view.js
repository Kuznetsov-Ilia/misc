exports.__esModule = true;

var _events = require('./events');

var _utils = require('./utils');

exports.default = View;

var UID = 0;

function View() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  this.cid = UID++;
  this.garbage = [];

  if ((0, _utils.isFunction)(options.stopPreloader)) {
    this.stopPreloader = options.stopPreloader;
  }
  if (!options.template && !this.template) {
    throw 'no template found, must be specified';
  }
  if (options.template) {
    this.template = options.template;
  }
  var el = (0, _utils.isNode)(options) ? options : (0, _utils.isNode)(options.el) ? options.el : false;
  if (el) {
    this.render(el);
  }
  this.el = this.template.el;
  this.delegateEvents();
  if (this.init !== _utils.noop) {
    this.init(options);
  }
  if (options.args) {
    this.set(options.args);
  }
  return this;
}
View.assign = _utils.inherits;

Object.assign((0, _events.Eventable)(View.prototype), {
  init: _utils.noop, // Set initial component state without triggering re-render
  didInsertElement: _utils.noop, //Provides opportunity for manual DOM manipulation
  //willReceiveAttrs: noop,//React to changes in component attributes, so that setState can be invoked before render
  //shouldUpdate: noop,//Gives a component an opportunity to reject downstream revalidation
  //willUpdate: noop,//Invoked before a template is re-rendered to give the component an opportunity to inspect the DOM before updates have been applied
  //didUpdate: noop,//Invoked after a template is re-rendered to give the component an opportunity to update the DOM
  willDestroyElement: _utils.noop, //The inverse of didInsertElement; clean up anything set up in that hook
  //willRender: noop,//executed both after init and after willUpdate*
  didRender: _utils.noop, //executed both after didInsertElement and didUpdate*
  // *These hooks can be used in cases where the setup for initial render and subsequent re-renders is idempotent instead of duplicating the logic in both places. In most cases, it is better to try to make these hooks idempotent, in keeping with the spirit of "re-render from scratch every time"
  add: function add(somethingToRemove) {
    if (Array.isArray(somethingToRemove)) {
      this.garbage = this.garbage.concat(somethingToRemove);
    } else {
      this.garbage.push(somethingToRemove);
    }
    return this;
  },
  $: function $(selector) {
    return this.el.find(selector);
  },
  render: function render(root) {
    this.template.render(root);
    if (this.didInsertElement !== _utils.noop) {
      this.didInsertElement(root);
    }
    this.el = this.template.el;
    this.delegateEvents();
    if (this.didRender !== _utils.noop) {
      this.didRender(root);
    }
    return this;
  },

  // Remove this view by taking the element out of the DOM, and removing any
  // applicable Backbone.Events listeners.
  remove: function remove() {
    if (this.el) {
      this.el.off();
    }
    if (this.willDestroyElement !== _utils.noop) {
      this.willDestroyElement();
    }
    /*if (this.template && this.template.remove) {
      this.template.remove();
    }*/
    /*
     var parent = this.el.parent();
    if (parent !== null) {
      parent.removeChild(this.el);
    }
    this.off();*/

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
    if (!this.el) {
      return this;
    }
    var events;
    if ((0, _utils.isset)(inputEvents)) {
      events = inputEvents;
    } else if ((0, _utils.isset)(this.events)) {
      events = (0, _utils.result)(this, 'events');
    } else {
      return this;
    }
    if ((0, _utils.isObject)(events)) {
      // we have valid map of events
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!(0, _utils.isFunction)(method)) {
          method = this[events[key]];
          if (!(0, _utils.isFunction)(method)) {
            continue;
          }
        }
        this.el.on(key, method, this);
      }
    }
    return this;
  },
  delegateSpecialEvents: function delegateSpecialEvents() {
    /*  if (this.e) {
        Object.keys(this.e).map(key => {
          var match = key.match(/\{[\w\d]+\}/gi);
          if (match !== null) {
            var d =  match.reduce((acc, val) => acc.replace(val, ''), key);
          }
          return '';
        });
      }*/
  },
  parse: function parse(values) {
    this.state = this.state || {};
    this.args = this.args || {};
    this.state = Object.assign(this.args, values);
    return this.state;
  },

  // Clears all callbacks previously bound to the view with `delegateEvents`.
  // You usually don't need to use this, but may wish to if you have multiple
  // Backbone views attached to the same DOM element.
  undelegateEvents: function undelegateEvents() {
    if (!this.el) {
      return this;
    }
    this.el.off();
    return this;
  },
  set: function set(key, value) {
    var _this = this;

    if (key === undefined) {
      return this;
    }
    this.state = this.state || {};
    this.args = this.args || {};
    var values = {};
    if (typeof key === 'object') {
      values = key;
    } else {
      values[key] = value;
    }
    var vals = this.state = this.parse(Object.assign(this.args, values));
    if ((0, _utils.isset)(this.tKeys)) {
      vals = this.tKeys.reduce(function (acc, val) {
        if (val in _this.state) {
          acc[val] = _this.state[val];
        }
        return acc;
      }, {});
    }
    this.template.set(vals);
    return this;
  }
});