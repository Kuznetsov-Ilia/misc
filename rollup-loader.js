
var rollup = require('rollup')
var memory = require('rollup-plugin-memory')



var rollup = require('rollup');
var through = require('through2');
var denodeify = require('denodeify');
var fs = require('fs');
var writeFile = denodeify(fs.writeFile);
var unlink = denodeify(fs.unlink);
var path = require('path');


module.exports = function () {
  var cb = this.async();
  var rollupConfig = {
    //entry: __dirname + '/src.js',
    plugins: [
      memory({
        contents: source
      })
    ]
  };
  this.cacheable();
  rollup
    .rollup(rollupConfig)
    .then(function (bundle) {
      var result = bundle.generate({
        format: 'cjs'
      });
      cb(null, result.code, result.map);
    })
    .catch(cb);
















  this.cacheable();
  
  var callback = this.async();
  var resource = this.resourcePath;

  var source = '';

  return through(function (chunk, enc, cb) {
    source += chunk.toString('utf8');
    cb();
  }, function (cb) {
    var self = this;

    // Write a temp file just in case we are preceded by
    // another browserify transform
    var tmpfile = path.resolve(path.dirname(filename),
      path.basename(filename) + '.tmp');

    var doSourceMap = opts.sourceMaps !== false;

    writeFile(tmpfile, source, 'utf8').then(function () {
      var config = {};
      if (opts.config) {
        var configPath = /^\//.test(opts.config) ? opts.config : process.cwd() + '/' + opts.config;
        config = require(configPath);
      }

      return rollup.rollup(Object.assign(config, {
        entry: tmpfile,
        sourceMap: doSourceMap ? 'inline' : false
      }));
    }).then(function (bundle) {
      var generated = bundle.generate({format: 'cjs'});
      self.push(generated.code);
      self.push(null);

      bundle.modules.forEach(function(module) {
        var file = module.id;
        if (!/\.tmp$/.test(file)) {
          self.emit('file', file)
        }
      });

      return unlink(tmpfile);
    }).then(function () {
      cb();
    }).catch(cb);
  });



  
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

