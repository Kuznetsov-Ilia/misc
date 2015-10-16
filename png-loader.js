var spritesmith = require('spritesmith');
var fs = require('fs');
var promise = require('./Promise');
var coordsPromise = promise();
var FILELIST = [];
var PITCHPASSED = false;
var webRoot = './dev';
var webPath = '/images/sprite.png';
module.exports = function (source) {
  this.cacheable();
  var callback = this.async();
  if(!callback) {
    console.error('MUST BE SYNC!!!');
  }
  var resource = this.resource;
  if (PITCHPASSED === false) {
    PITCHPASSED = true;
    //console.log('makeSprites');
    makeSprites(FILELIST, function(coordinates/*, properties*/) {
      if (coordinates instanceof Error) {
        console.error(coordinates);
        callback(coordinates);
        coordsPromise.reject(coordinates);
        return false;
      }
      //console.log('coordsPromise.resolve', resource);
      callback(null, g(coordinates[resource]));
      coordsPromise.resolve(coordinates);
    });
  } else {
    coordsPromise.done(function(coordinates){
      //console.log('coordsPromise.done', resource);
      callback(null, g(coordinates[resource]));
    });
  }
};

module.exports.pitch = function (remainingRequest/*, precedingRequest, data*/) {
  var filename = remainingRequest;
  if (FILELIST.indexOf(filename) === -1) {
    FILELIST.push(filename);
  }
};

function g(cssProps) {
  if (cssProps) {
    return 'module.exports="{webPath}) -{x}px -{y}px; width: {w}px; height: {h}px;"'
      .replace('{webPath}', webPath)
      .replace('{x}', cssProps.x)
      .replace('{y}', cssProps.y)
      .replace('{w}', cssProps.width)
      .replace('{h}', cssProps.height);
  } else {
    console.log('cssProps', cssProps);
  }
}

function makeSprites(files, callback) {
  spritesmith({
    src: files
  }, function handleResult(err, result) {
    if (err) {
      console.error(err);
      callback(err);
    }
    fs.writeFile(webRoot + webPath, result.image, 'binary', function (errWhenWrite) {
      if (errWhenWrite) {
        callback(errWhenWrite);
      }
      callback(result.coordinates, result.properties);
    });

  });
}

