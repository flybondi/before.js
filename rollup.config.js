import clean from 'rollup-plugin-clean';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import flow from 'rollup-plugin-flow';
import pkg from './package.json';

export default {
  input: 'index.js',
  external: ['react', 'react-dom', 'react-router-dom'],
  output: [
    {
      globals: {
        react: 'React',
        'react-dom/server': 'ReactDOMServer'
      },
      file: pkg.main,
      format: 'cjs',
      name: 'before'
    },
    {
      globals: {
        react: 'React',
        'react-dom/server': 'ReactDOMServer'
      },
      file: pkg.module,
      format: 'es',
      name: 'before'
    }
  ],
  plugins: [
    clean(),
    flow(),
    resolve({
      extensions: ['.js', '.jsx', '.mjs'],
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs({
      // See babel config in `package.json`
      include: '**/node_modules/**'
      // plugins: ['external-helpers'],
      // externalHelpers: true
    }),
    babel({
      // See babel config in `package.json`
      exclude: '**/node_modules/**'
      // plugins: ['external-helpers'],
      // externalHelpers: true
    })
  ]
};
