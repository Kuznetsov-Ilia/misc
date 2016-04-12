exports.__esModule = true;

exports.default = function () {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var filter = (0, _rollupPluginutils.createFilter)(options.include, options.exclude);
  /*const outputFile = typeof options.output === 'string';
  const outputFunction = typeof options.output === 'function';*/
  return {
    transform: function transform(source, id) {
      if (!filter(id)) {
        return null;
      }
      var opts = {
        from: options.from ? pathJoin(options.from) : id,
        to: options.to ? pathJoin(options.to) : id,
        map: {
          inline: false,
          annotation: false
        }
      };
      var relativePath = (0, _path.relative)(process.cwd(), id);
      //console.log('relativePath', relativePath);
      trace++;
      var cache = function cache(res) {
        cached[relativePath] = res;
        cssfile.push(res.injectableSource);
        return res;
      };
      return (0, _postcss2.default)(options.plugins || []).process(source, opts).then(function (_ref) {
        var css = _ref.css;
        var map = _ref.map;
        return cssModules.load(css, relativePath, trace, pathFetcher).then(cache).then(function (_ref2) {
          var exportTokens = _ref2.exportTokens;
          return {
            code: getExports(exportTokens),
            map: options.sourceMap && map ? JSON.parse(map) : { mappings: '' }
          };
        });
      }
      //.then(res => {console.log(res);return res;})
      )
      /*.then(r => {
                if (outputFile) {
                  fs.writeFile(options.output, cssfile.join(''));
                } else if (outputFunction) {
                  options.output(cssfile.join('\n'));
                }
                return r;
              })*/
      ;
    },
    transformBundle: function transformBundle() {
      console.log('writing css to:', options.output);
      _fs2.default.writeFile(options.output, cssfile.join(''));
    }
  };
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _rollupPluginutils = require('rollup-pluginutils');

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _cssModulesLoaderCore = require('css-modules-loader-core');

var _cssModulesLoaderCore2 = _interopRequireDefault(_cssModulesLoaderCore);

var _path = require('path');

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function pathJoin(file) {
  return (0, _path.join)(process.cwd(), file);
}
var cssfile = [];
var cached = {};
var trace = 0;
var cssModules = new _cssModulesLoaderCore2.default();

function getExports(exportTokens) {
  return Object.keys(exportTokens).map(function (t) {
    return 'var ' + t + '="' + exportTokens[t] + '"';
  }).concat(['export { ' + Object.keys(exportTokens).join(',') + ' }', 'export default ' + JSON.stringify(exportTokens)]).join(';\n');
}

function pathFetcher(file, relativeTo, depTrace) {
  var sourcePath;
  file = file.replace(/^["']|["']$/g, '');
  if (file.startsWith('.')) {
    return Promise.reject('implement relative path bleat!');
    var dir = (0, _path.dirname)(relativeTo);
    var _sourcePath = _glob2.default.sync((0, _path.join)(dir, file))[0];
    console.log('sourcePath', _sourcePath);
    if (!_sourcePath) {
      console.error('no sourcePath', dir, file);
      /*this._options.paths.some(dir => {
        return sourcePath = glob.sync(join(dir, file))[0]
      })*/
    }
    /*if (!sourcePath) {
      return new Promise((resolve, reject) => {
        let errorMsg = `Not Found : ${file}  from ${dir}`;
        if (this._options.paths.length) {
          errorMsg += " and " + this._options.paths.join(" ")
        }
        reject(errorMsg)
      })
    }*/
  } else {
      sourcePath = 'node_modules/' + file;
      if (!file.endsWith('.css')) {
        sourcePath += '.css';
      }
      console.log('pathFetcher', sourcePath);
    }
  return new Promise(function (resolve, reject) {
    var _cached = cached[sourcePath];
    if (_cached) {
      return resolve(_cached.exportTokens);
    }
    (0, _fs.readFile)(sourcePath, 'utf-8', function (error, sourceString) {
      if (error) {
        return reject(error);
      }
      cssModules.load(sourceString, sourcePath, ++trace, pathFetcher).then(function (result) {
        cached[sourcePath] = result;
        resolve(result.exportTokens);
      }).catch(reject);
    });
  });
}