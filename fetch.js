exports.__esModule = true;

var _global = require('global');

var _utils = require('./utils');

var _Promise = require('./Promise');

var _Promise2 = _interopRequireDefault(_Promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_TIMEOUT = 5000;
var DONE = 4;
var fetch;
if (_global.window.fetch) {
  fetch = prepare(newfag);
} else {
  fetch = prepare(oldschool);
}

exports.default = fetch;

function prepare(callback) {
  return function (method, url, data) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    method = method.toLowerCase();
    options = Object.assign({
      method: method,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json'
      }
    }, options);

    switch (method) {
      case 'jsonp':
        return jsonp(url, data, options);
      case 'get':
      case 'head':
      case 'delete':
        if ((0, _utils.isString)(data)) {
          var sign = url.indexOf('?') === -1 ? '?' : '&';
          url = url + sign + data;
        } else if (!(0, _utils.isEmpty)(data)) {
          url += '&' + Object.keys(data).map(encodeUrlParams(data)).join('&');
        }
        options.body = null;
        break;
      case 'post':
        options.credentials = 'include';
        if (!(0, _utils.isEmpty)(data) && !isNativeDataTypesForXHR2(data)) {
          if (options.headers['Content-type'].indexOf('json') >= 0) {
            options.body = 'json=' + JSON.stringify(data);
          } else {
            options.body = Object.keys(data).map(encodeUrlParams(data)).join('&');
          }
        }
        break;
      case 'put':
        options.headers['Content-type'] = 'application/json';
        options.credentials = 'include';
        if (!(0, _utils.isEmpty)(data) && !isNativeDataTypesForXHR2(data)) {
          options.body = JSON.stringify(data);
        }
        break;
    }

    if ((0, _utils.isset)(options.charset)) {
      options.headers['Accept-charset'] = options.charset;
    }

    return callback(url, options);
  };
}

function newfag(url, options) {
  return _global.window.fetch(url, options).then(checkStatus);
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  } else {
    return _Promise2.default.reject(new Error(response.statusText));
  }
}

function oldschool(url, options) {
  var xhr = new (_global.window.XMLHttpRequest || _global.window.ActiveXObject)('Microsoft.XMLHTTP');
  var abort, progress;
  /* report progress */
  if (xhr.upload) {
    progress = xhr.upload.onprogress;
  }
  if (xhr.abort) {
    abort = xhr.abort;
  }
  return (0, _Promise2.default)(function (resolve, reject) {
    xhr.onreadystatechange = function () {
      if (xhr.readyState === DONE) {
        var status = xhr.status;
        if (status) {
          if (isValidStatus(status)) {
            var response = xhr.response;
            if (options.headers.Accept === 'application/json') {
              try {
                response = JSON.parse(response);
              } catch (e) {
                reject(e, xhr);
              }
              resolve(response);
            } else {
              resolve(xhr.response);
            }
          } else {
            reject(xhr);
          }
        } else {
          reject(xhr);
        }
      }
    };

    /* response headers */
    var headers;

    Object.defineProperty(xhr, 'headers', {
      get: function get() {
        if (!headers) {
          headers = parseHeaders(xhr.getAllResponseHeaders());
        }
        return headers;
      }
    });

    try {
      xhr.open(options.method, url, true);
    } catch (error) {
      reject(error);
    }

    /* set request headers */
    Object.keys(options.headers).forEach(function (header) {
      xhr.setRequestHeader(header, options.headers[header]);
    });

    /* request data */
    try {
      xhr.send(options.body);
    } catch (error) {
      reject(error, xhr);
    }

    /* response timeout */
    setTimeout(xhr.abort.bind(xhr), options.timeout);
  }, abort, progress);
}

function isValidStatus(status) {
  return status >= 200 && status < 300 || status === 304;
}

function parseHeaders(h) {
  var ret = {},
      key,
      val,
      i;

  h.split('\n').forEach(function (header) {
    if ((i = header.indexOf(':')) > 0) {
      key = header.slice(0, i).replace(/^[\s]+|[\s]+$/g, '').toLowerCase();
      val = header.slice(i + 1, header.length).replace(/^[\s]+|[\s]+$/g, '');
      if (key && key.length) {
        ret[key] = val;
      }
    }
  });

  return ret;
}

function isNativeDataTypesForXHR2(data) {
  return 'FormData' in _global.window && data instanceof FormData || 'ArrayBuffer' in _global.window && data instanceof ArrayBuffer || 'ArrayBufferView' in _global.window && data instanceof ArrayBufferView || 'Blob' in _global.window && data instanceof Blob;
}

function jsonp(url, data, options) {
  return (0, _Promise2.default)(function (resolve, reject) {
    var script = _global.document.createElement('script');
    var _rand = '_' + (0, _utils.rand)();
    var callbackName = options && options.callbackName || 'callback';
    if ((0, _utils.isString)(data)) {
      data += '&' + callbackName + '=' + _rand;
    } else if ((0, _utils.isObject)(data)) {
      data[callbackName] = _rand;
      data = Object.keys(data).map(encodeUrlParams(data)).join('&');
    } else {
      data = callbackName + '=' + _rand;
    }
    var src = url + (url.indexOf('?') === -1 ? '?' : '') + data;
    var jsonpTimer;
    _global.window[_rand] = function (res) {
      clearTimeout(jsonpTimer);
      resolve(res);
      _global.window[_rand] = null;
      _global.body.removeChild(script);
    };
    _global.body.appendChild(script);
    script.src = src;
    jsonpTimer = setTimeout(function () {
      _global.body.removeChild(script);
      _global.window[_rand] = null;
      reject('timeout');
    }, DEFAULT_TIMEOUT);
  });
}

function encodeUrlParams(obj) {
  return function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
  };
}