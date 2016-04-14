exports.__esModule = true;

var _global = require('global');

exports.default = cookie;

var encode = _global.window.encodeURIComponent;
var decode = _global.window.decodeURIComponent;

function read(s) {
  if (s.indexOf('"') === 0) {
    // This is a quoted cookie as according to RFC2068, unescape...
    s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }

  try {
    // Replace server-side written pluses with spaces.
    // If we can't decode the cookie, ignore it, it's unusable.
    s = decode(s.replace(/\+/g, ' '));
  } catch (e) {
    return;
  }

  return s;
}

function cookie(key, value, options) {
  if (value !== undefined) {
    // Write
    options = options || {};

    if (typeof options.expires === 'number') {
      var days = options.expires;
      var t = options.expires = new Date();
      t.setDate(t.getDate() + days);
    }

    if (!options.path) {
      options.path = '/';
    }

    document.cookie = [encode(key), '=', encode(String(value)),
    // use expires attribute, max-age is not supported by IE
    options.expires ? '; expires=' + options.expires.toUTCString() : '', options.path ? '; path=' + options.path : '', options.domain ? '; domain=' + options.domain : '', options.secure ? '; secure' : ''].join('');
  }

  // Read
  var result = key ? undefined : {};

  // To prevent the for loop in the first place assign an empty array
  // in case there are no cookies at all. Also prevents odd result when
  // calling $.cookie().
  var cookies = document.cookie ? document.cookie.split('; ') : [];

  for (var i = 0, l = cookies.length; i < l; i++) {
    var parts = cookies[i].split('=');
    var name = decode(parts.shift());
    var _cookie = parts.join('=');

    if (key && key === name) {
      // If second argument (value) is a function it's a converter...
      result = read(_cookie, value);
      break;
    }

    // Prevent storing a cookie that we couldn't decode.
    if (!key && (_cookie = read(_cookie)) !== undefined) {
      result[name] = _cookie;
    }
  }

  return result;
}

cookie.remove = function (key, options) {
  if (cookie(key) !== undefined) {
    cookie(key, '', Object.assign({}, options, {
      expires: new Date(1000),
      path: '/'
    }));
    return true;
  }
  return false;
};