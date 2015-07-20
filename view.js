import Events from './events';
import {extend, noop, isset, isFunction, isObject, isString, result} from './utils';

var UID = 0;
//var Model = require('model');

export default class View extends Events {
  constructor(options) {
    super(options);
    //this.el = options.el;
    this.cid = UID++;
    this.initialize(options);
    //this._ensureElement().initialize(options).delegateEvents();
  }
  // Hooks: https://github.com/emberjs/ember.js/pull/10501
  init = noop// Set initial component state without triggering re-render
  didInsertElement = noop//Provides opportunity for manual DOM manipulation
  willReceiveAttrs = noop//React to changes in component attributes, so that setState can be invoked before render
  shouldUpdate = noop//Gives a component an opportunity to reject downstream revalidation
  willUpdate = noop//Invoked before a template is re-rendered to give the component an opportunity to inspect the DOM before updates have been applied
  didUpdate = noop//Invoked after a template is re-rendered to give the component an opportunity to update the DOM
  willDestroyElement = noop//The inverse of didInsertElement; clean up anything set up in that hook
  willRender = noop//executed both after init and after willUpdate*
  didRender = noop//executed both after didInsertElement and didUpdate*
  // *These hooks can be used in cases where the setup for initial render and subsequent re-renders is idempotent instead of duplicating the logic in both places. In most cases, it is better to try to make these hooks idempotent, in keeping with the spirit of "re-render from scratch every time"
  $ (selector) {
    return this.el.find(selector);
  }

  initialize (options={}) {
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

  render (root) {
    /*if (this.onrender !== noop) {
      this.onrender(model, data);
    }*/
    /*if (isset(Model)) {
      if (isset(data)) {
        if (model instanceof Model) {
          model = model;
        } else if (isset(this.model) && this.model instanceof Model) {
          model = this.model;
        } else {
          return console.error('no model is available. place data to the first argument');
        }
      } else if (isset(model)) {
        if (model instanceof Model) {
          model = model;
          data = model.get();
        } else if (isObject(model)) {
          data = model;
        } else {
          return console.error('wrong type: must be model or object');
        }
      } else if (isset(this.model) && this.model instanceof Model) {
        model = this.model;
        data = model.get();
      } else {
        data = {};
      }
    } else {
      data = model || {};
    }*/

    this.template.render(root);
    if (this.didRender !== noop) {
      this.didRender(root);
    }
    /*if (this.preloaderTimer !== noop) {
      this.preloaderTimer();
    }
    if (this.rendered !== noop) {
      this.rendered(model, data);
    }*/
    return this;
  }
  // Remove this view by taking the element out of the DOM, and removing any
  // applicable Backbone.Events listeners.
  remove () {
    /*if (this.onremove !== noop) {
      this.onremove();
    }
    this.trigger('remove');

    if (isset(this.model)) {
      this.model.clear().off();
    }*/

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
  }
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
  }

  // Clears all callbacks previously bound to the view with `delegateEvents`.
  // You usually don't need to use this, but may wish to if you have multiple
  // Backbone views attached to the same DOM element.
  undelegateEvents () {
    this.el.off();
    return this;
  }

  _ensureElement () {
    /*if (!isset(this.el)) {
      this.el = $.new('div');
    }*/
    return this;
  }

}
