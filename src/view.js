import {Eventable} from './events';
import {noop, isset, isFunction, isObject, result, inherits} from './utils';
export default View;
var UID = 0;
//var Model = require('model');

function View (options={}) {
  this.cid = UID++;
  if (isFunction(options.stopPreloader)){
    this.stopPreloader = options.stopPreloader;
  }
  if (this.init !== noop) {
    this.init(options);
  }

  ///this.name = options.name;

  if ('Model' in options) {
    this.model = new options.Model(options.data);
  }

  if (options.watch && this.model) {
    var _this = this;
    this.model.on('change:' + options.watch, function (model/*, changedAttributeValue*/) {
      _this.render(model, model.get());
    });
  }

    /*if (this.inited !== noop) {
      this.inited(options);
    }*/
  return this;
}
View.assign = inherits;

Object.assign(Eventable(View.prototype), {
  init: noop,// Set initial component state without triggering re-render
  didInsertElement: noop,//Provides opportunity for manual DOM manipulation
  willReceiveAttrs: noop,//React to changes in component attributes, so that setState can be invoked before render
  shouldUpdate: noop,//Gives a component an opportunity to reject downstream revalidation
  willUpdate: noop,//Invoked before a template is re-rendered to give the component an opportunity to inspect the DOM before updates have been applied
  didUpdate: noop,//Invoked after a template is re-rendered to give the component an opportunity to update the DOM
  willDestroyElement: noop,//The inverse of didInsertElement; clean up anything set up in that hook
  willRender: noop,//executed both after init and after willUpdate*
  didRender: noop,//executed both after didInsertElement and didUpdate*
  // *These hooks can be used in cases where the setup for initial render and subsequent re-renders is idempotent instead of duplicating the logic in both places. In most cases, it is better to try to make these hooks idempotent, in keeping with the spirit of "re-render from scratch every time"
  $ (selector) {
    return this.el.find(selector);
  },

  render (root) {
    this.template.render(root);
    if (this.didRender !== noop) {
      this.didRender(root);
    }
    return this;
  },
  // Remove this view by taking the element out of the DOM, and removing any
  // applicable Backbone.Events listeners.
  remove () {
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
  delegateEvents (inputEvents) {
    var events;
    if (isset(inputEvents)) {
      events = inputEvents;
    } else {
      events = result(this, 'events');
    }
    if (isObject(events)) {// we have valid map of events
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!isFunction(method)) {
          method = this[events[key]];
          if (!isFunction(method)) {
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
  undelegateEvents () {
    this.el.off();
    return this;
  },

  _ensureElement () {
    /*if (!isset(this.el)) {
      this.el = $.new('div');
    }*/
    return this;
  }
});

