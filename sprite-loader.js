var spritesmith = require('spritesmith');
var fs = require('fs');
//var Promise = require('./Promise');
var coordsPromise = {};
var FILELIST = {};
var timeOut;
var log = () => {};//console.log;
module.exports = function (/*source*/) {
  this.cacheable();
  var callback = this.async();
  var resource = this.resourcePath;
  var params = Object.assign({}, parseUrl(this.query), parseUrl(this.resourceQuery));
  var path = params.root + params.url;
  coordsPromise[path] = coordsPromise[path] || new Promise();
  coordsPromise[path].then(coordinates => {
    log('done:', resource);
    if (resource in coordinates) {
      callback(null, g(coordinates[resource]));
    } else {
      throw JSON.stringify({resource, coordinates, mes: 'no resource found'});
    }
  });
  log('setting new timeout', path);
  clearTimeout(timeOut);
  timeOut = setTimeout(doSprites, 900);
};

function doSprites() {
  log('doSprites:', JSON.stringify(FILELIST).replace(/\/Users\/ikuznecov\/projects\/new\.otvet\.mail\.ru\/src/gi, '\n'));
  Object.keys(FILELIST).map(filepath => {
    log('resolving', filepath);
    makeSprites(FILELIST[filepath], filepath).then(
      coordinates => coordsPromise[filepath].resolve(coordinates),
      err => console.error('makeSprites failed!', err)
    );
  });
}

module.exports.pitch = function (remainingRequest) {
  log('pitch');
  var params = Object.assign({}, parseUrl(this.query), parseUrl(this.resourceQuery));
  var filename = remainingRequest.split('?')[0];
  var path = params.root + params.url;
  FILELIST[path] = FILELIST[path] || [];
  if (FILELIST[path].indexOf(filename) === -1) {
    FILELIST[path].push(filename);
  }
};

function parseUrl(query){
  if (query) {
    query = String(query);
    if (query[0] === '?') {
      query = query.slice(1);
    }
    return query.split('&').reduce((acc, val) => {
      var v = val.split('=');
      acc[v[0]] = v[1];
      return acc;
    }, {});
  }
  return {};
}

function g(css) {
  if (css) {
    return `module.exports=");background-position: -${css.x}px -${css.y}px; width: ${css.width}px; height: ${css.height}px;"`;
  } else {
    console.error('png-loader g failed: css', css);
    return '';
  }
}

function makeSprites(src, path) {
  return new Promise((resolve, reject) => {
    spritesmith({src}, (err, result) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        fs.writeFile(path, result.image, 'binary', errWhenWrite => {
          if (errWhenWrite) {
            reject(errWhenWrite);
          } else {
            resolve(result.coordinates, result.properties);
          }
        });
      }
    });
  });
}
