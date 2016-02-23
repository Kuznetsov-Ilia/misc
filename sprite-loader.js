var spritesmith = require('spritesmith');
var fs = require('fs');
//var Promise = require('./Promise');
var coordsPromise = {};
var FILELIST = {};
var timeOut;
var log = ()=>{};//console.log;
var dd = [];
module.exports = function () {
  this.cacheable();
  var callback = this.async();
  var resource = this.resourcePath;
  var params = Object.assign({}, parseUrl(this.query), parseUrl(this.resourceQuery));
  var path = params.root + params.url;
  if (!coordsPromise[path]) {
    coordsPromise[path] = new Promise((resolve, reject) => {
      dd.push(() => {
        log('resolving', path);
        makeSprites(FILELIST[path], path).then(resolve, reject);
      });
    });
  }
  coordsPromise[path].then(
    coordinates => {
      log('done:', resource);
      if (resource in coordinates) {
        callback(null, g(coordinates[resource]));
      } else {
        throw JSON.stringify({resource, coordinates, mes: 'no resource found'});
      }
    },
    err => console.error('makeSprites failed!', err)
  );
  log('setting new timeout', path);
  clearTimeout(timeOut);
  timeOut = setTimeout(doAllSprites, 2000);
};
function doAllSprites() {
  log('doAllSprites: ', dd.length);
  dd.forEach(fn => fn());
}

module.exports.pitch = function (remainingRequest) {
  log('pitch');
  this.cacheable();
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
    //log('\n makeSprites Promise \n');
    //log({src});
    spritesmith.run({src}, (err, result) => {
      //log('\n!spritesmith!\n');
      if (err) {
        //log('!!!makeSprites reject \n');
        reject(err);
      } else {
        fs.writeFile(path, result.image, 'binary', errWhenWrite => {
          if (errWhenWrite) {
            //log('!!!makeSprites errWhenWrite \n');
            reject(errWhenWrite);
          } else {
            //log('!!!makeSprites resolve \n');
            resolve(result.coordinates, result.properties);
          }
        });
      }
    });
  });
}
