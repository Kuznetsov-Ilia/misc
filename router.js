'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _history = require('./history');

var _history2 = _interopRequireDefault(_history);

var _events = require('./events');

// Routers map faux-URLs to actions, and fire events when routes are
// matched. Creating a new one sets its `routes` hash, if not set statically.
// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
var optionalParam = /\((.*?)\)/g;
var namedParam = /(\(\?)?:\w+/g;
var splatParam = /\*\w+/g;
var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

function Router(options) {
  options = options || {};
  if (options.routes) {
    if (!this.routes) {
      this.routes = {};
    }
    Object.assign(this.routes, options.routes);
  }
  if (_utils.isFunction(this.init)) {
    this.init(options);
  }
  bindRoutes(this);
}

Object.assign(_events.Eventable(Router.prototype), {
  // Manually bind a single named route to a callback. For example:
  //
  //     this.route('search/:query/p:num', 'search', function(query, num) {
  //       ...
  //     });
  //
  route: function route(_route, name /*, callback*/) {
    var _this2 = this;

    if (!_utils.isRegExp(_route)) {
      _route = routeToRegExp(_route);
    }
    /*if (isFunction(name)) {
      callback = name;
      name = '';
    }
    if (!callback) {
      callback = this[name];
    }*/
    this.history.route(_route, function (fragment) {
      var args = extractParameters(_route, fragment);
      //if (this.execute(callback, args, name) !== false) {
      //this.trigger.apply(this, ['route:' + name].concat(args));
      _this2.trigger('route', name, args);
      //HISTORY.trigger('route', this, name, args);
      //}
    });
    return this;
  },

  // Execute a route handler with the provided parameters.  This is an
  // excellent place to do pre-route setup or post-route cleanup.
  execute: function execute(callback, args /*, name*/) {
    if (callback) {
      callback.apply(this, args);
    }
  },

  // Simple proxy to `HISTORY` to save a fragment into the history.
  navigate: function navigate(fragment, options) {
    this.history.navigate(fragment, options);
    return this;
  },

  history: _history2['default']

});
Router.assign = _utils.inherits;

// Bind all defined routes to `HISTORY`. We have to reverse the
// order of the routes here to support behavior where the most general
// routes can be defined at the bottom of the route map.
function bindRoutes(_this) {
  var routes = _utils.result(_this, 'routes');
  if (_utils.isset(routes)) {
    var route;
    var routeKeys = _utils.keys(routes);
    while ((route = routeKeys.pop()) !== undefined) {
      _this.route(route, routes[route]);
    }
  }
}

// Convert a route string into a regular expression, suitable for matching
// against the current location hash.
function routeToRegExp(route) {
  route = route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, function (match, optional) {
    return optional ? match : '([^/?]+)';
  }).replace(splatParam, '([^?]*?)');
  return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
}

// Given a route, and a URL fragment that it matches, return the array of
// extracted decoded parameters. Empty or unmatched parameters will be
// treated as `null` to normalize cross-browser behavior.
function extractParameters(route, fragment) {
  return route.exec(fragment).slice(1).map(function (param, i) {
    if (_utils.isArray(param) && param.length === i + 1) {
      // Don't decode the search params.
      return param || null;
    }
    return param ? decodeURIComponent(param) : null;
  });
}
exports['default'] = Router;
module.exports = exports['default'];