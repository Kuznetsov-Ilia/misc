import {Eventable} from './events';
import {noop, isset, isFunction, isNode, isObject, result, inherits} from './utils';
export default View;
var UID = 0;

function View (options={}) {
  this.cid = UID++;
  this.garbage = [];

  if (isFunction(options.stopPreloader)){
    this.stopPreloader = options.stopPreloader;
  }
  if (!options.template && !this.template) {
    throw 'no template found, must be specified';
  }

  if (options.template) {
    this.template = options.template;
  }
  var el = isNode(options) ? options : (isNode(options.el) ? options.el : false);
  if (el) {
    this.render(el);
  }
  /*if (!this.template.el) {
  }*/
  this.el = this.template.el;
  this.delegateEvents();
  if (this.init !== noop) {
    this.init(options);
  }

  return this;
}
View.assign = inherits;

Object.assign(Eventable(View.prototype), {
  init: noop,// Set initial component state without triggering re-render
  didInsertElement: noop,//Provides opportunity for manual DOM manipulation
  //willReceiveAttrs: noop,//React to changes in component attributes, so that setState can be invoked before render
  //shouldUpdate: noop,//Gives a component an opportunity to reject downstream revalidation
  //willUpdate: noop,//Invoked before a template is re-rendered to give the component an opportunity to inspect the DOM before updates have been applied
  //didUpdate: noop,//Invoked after a template is re-rendered to give the component an opportunity to update the DOM
  willDestroyElement: noop,//The inverse of didInsertElement; clean up anything set up in that hook
  //willRender: noop,//executed both after init and after willUpdate*
  didRender: noop,//executed both after didInsertElement and didUpdate*
  // *These hooks can be used in cases where the setup for initial render and subsequent re-renders is idempotent instead of duplicating the logic in both places. In most cases, it is better to try to make these hooks idempotent, in keeping with the spirit of "re-render from scratch every time"
  add (somethingToRemove) {
    if (Array.isArray(somethingToRemove)) {
      this.garbage = this.garbage.concat(somethingToRemove);
    } else {
      this.garbage.push(somethingToRemove);
    }
    return this;
  },
  $ (selector) {
    return this.el.find(selector);
  },

  render (root) {
    this.template.render(root);
    if (this.didInsertElement !== noop) {
      this.didInsertElement(root);
    }
    this.el = this.template.el;
    this.delegateEvents();
    if (this.didRender !== noop) {
      this.didRender(root);
    }
    return this;
  },
  // Remove this view by taking the element out of the DOM, and removing any
  // applicable Backbone.Events listeners.
  remove () {
    this.el.off();
    if (this.willDestroyElement !== noop) {
      this.willDestroyElement();
    }
    if (this.template && this.template.remove) {
      this.template.remove();
    }
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
  delegateEvents (inputEvents) {
    var events;
    if (isset(inputEvents)) {
      events = inputEvents;
    } else if (isset(this.events)) {
      events = result(this, 'events');
    } else {
      return this;
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

  delegateSpecialEvents () {
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

  // Clears all callbacks previously bound to the view with `delegateEvents`.
  // You usually don't need to use this, but may wish to if you have multiple
  // Backbone views attached to the same DOM element.
  undelegateEvents () {
    this.el.off();
    return this;
  }

});

