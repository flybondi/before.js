'use strict';

const PRESETS = {
  production: {
    useBuiltIns: 'usage',
    loose: true,
    // Do not transform modules to CJS
    modules: false,
    targets: 'node 10',
    corejs: 3
  },
  test: {
    targets: 'node 10'
  }
};

module.exports = function({ cache, env }) {
  const environment = env();
  var isEnvDevelopment = env('development');
  var isEnvTest = env('test');

  cache(true);

  const presets = [
    ['@babel/preset-env', PRESETS[environment]],
    '@babel/preset-flow',
    [
      '@babel/preset-react',
      {
        development: isEnvDevelopment || isEnvTest,
        useBuiltIns: true
      }
    ]
  ];

  return {
    presets,
    ignore: ['**/node_modules/**'],
    sourceMaps: isEnvDevelopment
  };
};
