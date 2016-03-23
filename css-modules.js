'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var CssModules = _interopDefault(require('css-modules-loader-core'));
var rollupPluginutils = require('rollup-pluginutils');

function cssModules () {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var cssModules = new CssModules();
  var filter = rollupPluginutils.createFilter(options.include, options.exclude);
  //const sourceMap = options.sourceMap !== false;
  var outputFile = typeof options.output === 'string';
  var outputFunction = typeof options.output === 'function';

  return {
    transform: function transform(code, id) {
      if (!filter(id)) {
        return null;
      }
      var relativePath = path.relative(process.cwd(), id);
      return cssModules.load(code, relativePath, null).then(function (_ref) {
        var injectableSource = _ref.injectableSource;
        var exportTokens = _ref.exportTokens;

        if (outputFile) {
          fs.writeFile(options.output, injectableSource);
        } else if (outputFunction) {
          options.output(injectableSource);
        }

        //var exportDefault = `export default ${JSON.stringify(exportTokens)};`;
        var exportAll = Object.keys(exportTokens).map(function (t) {
          return 'var ' + t + '="' + exportTokens[t] + '"';
        }).join(';\n');
        exportAll += ';\n        export {\n          ' + Object.keys(exportTokens).join(',') + '\n        }\n        export default ' + JSON.stringify(exportTokens);

        return {
          id: id + '.css',
          code: exportAll,
          map: { mappings: '' }
        };
      });
    }
  };
}

module.exports = cssModules;