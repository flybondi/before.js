# @before/server

[![js-flybondi](https://img.shields.io/badge/flybondi-fdbe15.svg?logo=javascript&style=flat-square&logoColor=grey&logoWidth=20)](https://flybondi.com)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

```sh
yarn add @before/server
yarn add @loadable/server react react-dom react-router-dom react-helmet
```

## Basic usage

```js
// ./src/routes.js
import { asyncComponent } from '@before/client';
import loadable from '@loadable/component';

const Placeholder = () => <div>Loading</div>;

const HomeContainerLoader = /* #__LOADABLE__ */ () =>
  import(/* webpackChunkName: "home" */ './pages/HomeContainer/HomeContainer.page');

const routes = [
  {
    path: '/',
    exact: true,
    component: asyncComponent({
      LoadableComponent: loadable(HomeContainerLoader, { fallback: Placeholder }),
      loader: HomeContainerLoader
    })
  }
];

export default routes;
```

```js
// ./src/server.js
import express from 'express';
import { render } from '@before/server';
import routes from './routes';

const assets = require(process.env.ASSETS_MANIFEST);

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.PUBLIC_DIR))
  .get('/*', async (req, res) => {
    try {
      // Pass document in here.
      const html = await render({
        req,
        res,
        routes,
        assets,
        statsPath
      });
      res.send(html);
    } catch (error) {
      res.json(error);
    }
  });

export default server;
```

## Chunk support

**Before.js** use [loadable-components](https://www.smooth-code.com/open-source/loadable-components/docs/getting-started/) to support server-side chunks/code-split.

