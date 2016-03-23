import fs from 'fs';
import path from 'path';
import CssModules from 'css-modules-loader-core';
import {createFilter} from 'rollup-pluginutils';
export default function (options = {}) {
  const cssModules = new CssModules();
  const filter = createFilter(options.include, options.exclude);
  //const sourceMap = options.sourceMap !== false;
  const outputFile = typeof options.output === 'string';
  const outputFunction = typeof options.output === 'function';

  return {
    transform(code, id) {
      if (!filter(id)) {
        return null;
      }
      const relativePath = path.relative(process.cwd(), id);
      return cssModules.load(code, relativePath, null).then(({ injectableSource, exportTokens }) => {
        if (outputFile) {
          fs.writeFile(options.output, injectableSource);
        } else if (outputFunction) {
          options.output(injectableSource);
        }

        //var exportDefault = `export default ${JSON.stringify(exportTokens)};`;
        var exportAll = Object.keys(exportTokens)
          .map(t => `var ${t}="${exportTokens[t]}"`)
          .join(';\n');
        exportAll += `;
        export {
          ${Object.keys(exportTokens).join(',')}
        }
        export default ${JSON.stringify(exportTokens)}`;

        return {
          id: `${id}.css`,
          code: exportAll,
          map: {mappings: ''}
        };
      });
    }
  };
}

