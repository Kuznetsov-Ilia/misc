import resolve from 'rollup-plugin-node-resolve';
export default {
  entry: './polyfills+dom+dom4.js',
  //dest: 'app/build/test.js',
  format: 'cjs',
  plugins: [
    resolve({
      jsnext: true,
      //main: true,
      builtins: false,
      //browser: true,
      extensions: ['', '.js', '.json', '.xml', '.html', '.xhtml', '.styl', '.css']
    })
  ]
};
