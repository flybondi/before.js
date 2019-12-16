import babel from 'rollup-plugin-babel';
import bundleSize from 'rollup-plugin-bundle-size';
import clean from 'rollup-plugin-clean';
import commonjs from 'rollup-plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json';
import ramda from '@flybondi/rollup-plugin-ramda';
import resolve from '@rollup/plugin-node-resolve';
import visualizer from 'rollup-plugin-visualizer';

export default {
  input: 'index.js',
  external: ['react', 'react-router-dom', '@loadable/component'],
  output: [
    {
      globals: {
        react: 'React'
      },
      file: pkg.module,
      format: 'es',
      name: '@before/client',
      sourcemap: false
    },
    {
      globals: {
        react: 'React'
      },
      file: pkg.main,
      format: 'cjs',
      name: '@before/client',
      sourcemap: false
    }
  ],
  plugins: [
    clean(),
    peerDepsExternal(),
    visualizer({
      filename: './bundle-analysis.html',
      title: pkg.name
    }),
    babel({
      exclude: /node_modules/,
      runtimeHelpers: true
    }),
    resolve({
      browser: true,
      extensions: ['.js', '.jsx', '.mjs'],
      preferBuiltins: false
    }),
    commonjs({
      include: /node_modules/,
      sourceMap: false
    }),
    ramda(),
    bundleSize()
  ]
};
