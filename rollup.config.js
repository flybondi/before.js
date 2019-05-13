import clean from 'rollup-plugin-clean';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import flow from 'rollup-plugin-flow';
import bundleSize from 'rollup-plugin-bundle-size';
import ramda from '@flybondi/rollup-plugin-ramda';
import pkg from './package.json';
import visualizer from 'rollup-plugin-visualizer';
import filesize from 'rollup-plugin-filesize';

export default {
  input: 'index.js',
  external: [
    'react',
    'react-dom',
    'react-router-dom',
    'react-helmet',
    'path',
    '@loadable/server',
    '@loadable/component'
  ],
  output: [
    {
      globals: {
        react: 'React',
        'react-dom/server': 'ReactDOMServer'
      },
      file: pkg.main,
      format: 'cjs',
      name: 'before.js',
      sourcemap: 'inline'
    },
    {
      globals: {
        react: 'React',
        'react-dom/server': 'ReactDOMServer'
      },
      file: pkg.module,
      format: 'es',
      name: 'before.js',
      sourcemap: 'inline'
    }
  ],
  plugins: [
    clean(),
    filesize(),
    visualizer({
      filename: './bundle-analysis.html',
      title: pkg.name
    }),
    flow({ pretty: true }),
    resolve({
      extensions: ['.js', '.jsx', '.mjs'],
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs({
      include: '**/node_modules/**'
    }),
    babel({
      runtimeHelpers: true,
      exclude: '**/node_modules/**'
    }),
    ramda(),
    bundleSize()
  ]
};
