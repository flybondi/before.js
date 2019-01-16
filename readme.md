<p align="center">
  <img src="https://www.flybondi.com/assets/images/logo.svg" title="Flybondi" width="300" style="margin-bottom: 1rem" />
</p>
<h1 align="center">Before.js</h1>

![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg) ![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat) ![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat) ![CircleCI](https://circleci.com/gh/flybondi/before.js.svg?style=shield&circle-token=4ba6f16c2f14514e0b638a89142b5056cf1aa9a9)

**Table of Contents**

- [Getting Started with Before.js](#getting-started-with-Beforejs)
- [Data Fetching](#data-fetching)
  - [`getInitialProps: (ctx) => Data`](#getinitialprops-ctx--data)
  - [Injected Page Props](#injected-page-props)
- [Routing](#routing)
  - [Parameterized Routing](#parameterized-routing)
  - [Client Only Data and Routing](#client-only-data-and-routing)
- [Code Splitting](#code-splitting)
- [Custom `<Document>`](#custom-document)

## Getting Started with Before.js

**Before.js** enables data fetching with any React SSR app that uses React Router 4.

## Data Fetching

For page components, you can add a `static async getInitialProps({ req, res, match, history, location, ...context })` function.
This will be called on both initial server render, and then on _componentDidUpdate_.
Results are made available on `this.props`.

```js
import React, { PureComponent } from 'react';

export default class About extends PureComponent {
  static async getInitialProps({ req, res, match, history, location, ...rest }) {
    const stuff = await asyncDataFecthing();
    return { stuff };
  }

  render() {
    return (
      <div>
        <h1>About</h1>
        {this.props.stuff ? this.props.stuff : 'Loading...'}
      </div>
    );
  }
}
```

```js
import React from 'react';

export default const About = ({ stuff }) => (
  <div>
    <h1>About</h1>
    {stuff ? stuff : 'Loading...'}
  </div>
);

About.getInitialProps = async ({ req, res, match, history, location, ...rest }) {
  const stuff = await asyncDataFecthing();
  return { stuff };
}
```

### `static async getInitialProps(context): InitialProps`

Notice that to load data when the page loads, we use `getInitialProps` which is an async static method. It can asynchronously fetch anything that resolves to a JavaScript plain Object, which populates props.
Data returned from `getInitialProps` is serialized when server rendering, similar to a JSON.stringify. Make sure the returned object from `getInitialProps` is a plain Object and not using Date, Map or Set.
For the initial page load, `getInitialProps` will execute on the server only. `getInitialProps` will only be executed on the client when navigating to a different route via the **Link** component or using the routing APIs.

```js
type DataType = {
  [key: any]: any
};

type Context = {
  req: {
    url: string,
    query: { [key: string]: string },
    originalUrl: string,
    path: string,
    [key: string]: any
  },
  res?: {
    status(code: number): void,
    redirect(code: number, redirectTo: string): void,
    [key: string]: any
  },
  assets?: {
    client: {
      css: string,
      js: string
    }
  },
  data?: ?DataType,
  filterServerData?: (data: ?DataType) => DataType,
  renderPage?: (data: ?DataType) => Promise<Page>,
  generateCriticalCSS?: () => string | boolean,
  title?: string,
  extractor?: ?Extractor,
  location?: {
    hash: string,
    key?: string,
    pathname: string,
    search: string,
    state?: any
  }
};
```

## Routing

As you have probably figured out, React Router 4 powers all of Before.js's
routing. You can use any and all parts of RR4.

### React Router _withRouter_ HOC

Before will inject `location` and `match` properties in each route props which are the same properties from React Router. Also, the `match` property will include a parsed object with the actual query string values from the `location.search`.
Take in mind that if you use the _withRouter_ HOC from React Router It will still work as expected but it will override the values from **Before.js**.


### Parameterized Routing

```js
// ./src/routes.js
import Home from './Home';
import About from './About';
import Detail from './Detail';

// Internally these will become:
// <Route path={path} exact={exact} render={props => <component {...props} data={data} />} />
const routes = [
  {
    path: '/',
    exact: true,
    component: Home
  },
  {
    path: '/about',
    component: About
  },
  {
    path: '/detail/:id',
    component: Detail
  }
];

export default routes;
```

```js
// ./src/Detail.js
import React from 'react';
import NavLink from 'react-router-dom/NavLink';

class Detail extends React.Component {
  // Notice that this will be called for
  // /detail/:id
  // /detail/:id/more
  // /detail/:id/other
  static async getInitialProps({ req, res, match }) {
    const item = await CallMyApi(`/v1/item${match.params.id}`);
    return { item };
  }

  render() {
    return (
      <div>
        <h1>Detail</h1>
        {this.props.item ? this.props.item : 'Loading...'}
        <Route path="/detail/:id/more" exact render={() => <div>{this.props.item.more}</div>} />
        <Route path="/detail/:id/other" exact render={() => <div>{this.props.item.other}</div>} />
      </div>
    );
  }
}

export default Detail;
```

### Client Only Data and Routing

In some parts of your application, you may not need server data fetching at all
(e.g. settings). With Before.js, you just use React Router 4 as you normally
would in client land: You can fetch data (in componentDidMount) and do routing
the same exact way.

## Code Splitting

**Before.js** lets you easily define lazy-loaded or code-split routes in your `routes.js` file. To do this, you'll need to modify the relevant route's `component` definition like so:

```js
// ./src/_routes.js
import React from 'react';
import Home from './Home';
import { asyncComponent } from '@flybondi/Before.js';
import loadable from '@loadable/component';
import Loading from './Loading';

export default [
  // normal route
  {
    path: '/',
    exact: true,
    component: Home
  },
  // codesplit route
  {
    path: '/about',
    exact: true,
    component: asyncComponent({
      loader: () => import(* webpackChunkName: "about" */ './About'), // required in order to get initial props from this route.
      LoadableComponent: loadable(
	      () => import(* webpackChunkName: "about" */ './About'),
	      { fallback: () => <Loading /> }
	  )
    })
  }
];
```

**Before.js** use [@loadable](https://www.smooth-code.com/open-source/loadable-components/docs/getting-started/) components to support server-side chunks/code-split. In order to use this feature all you have to do is the following setup:

1. Install `@loadable/babel-plugin` and add it to the _.babelrc_

```json
{
  "plugins": ["@loadable/babel-plugin"]
}
```

2. Install `@loadable/webpack-plugin` and include it in the plugins definition of the _webpack.config.js_

```js
const LoadablePlugin = require('@loadable/webpack-plugin');

module.exports = {
  // ...
  plugins: [new LoadablePlugin({ writeToDisk: true })]
};
```

3. Setup `ChunkExtractor` server-side, pass the _loadable-stats.json_ (file generated by _webpack lodable plugin_) path to the **Before.js** render method.

```js
import { render } from '@flybondi/before.js';
// ...

const statsPath = '../dist/loadable-stats.json';

await render({
  req: req,
  res: {},
  routes: propOr([], 'routes', config),
  assets,
  statsPath
});
```

4. Use the `ensureClientReady` method in the client-side.

```jsx
import React from 'react';
import routes from './routes';
import { hydrate } from 'react-dom';
import { ensureReady, ensureClientReady, Before } from '@flybondi/before.js';

ensureReady(routes).then(data => {
  return ensureClientReady(() => {
    hydrate(
      <BrowserRouter>
        <Before data={data} routes={routes} />
      </BrowserRouter>,
      document.getElementById('root')
    );
  });
});
```

## Custom `<Document>`

Before.js works similarly to Next.js with respect to overriding HTML document structure. This comes in handy if you are using a CSS-in-JS library or just want to collect data out of react context before or Before render. To do this, create a file in `./src/Document.js` like so:

```jsx
// ./src/Document.js
import React, { PureComponent } from 'react';

class Document extends PureComponent {
  static async getInitialProps({ assets, data, renderPage }) {
    const page = await renderPage();
    return { assets, data, ...page };
  }

  render() {
    const { helmet, assets, data, title, error, ErrorComponent } = this.props;
    // get attributes from React Helmet
    const htmlAttrs = helmet.htmlAttributes.toComponent();
    const bodyAttrs = helmet.bodyAttributes.toComponent();

    return (
      <html {...htmlAttrs}>
        <head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta charSet="utf-8" />
          <title>{title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {helmet.title.toComponent()}
          {helmet.meta.toComponent()}
          {helmet.link.toComponent()}
          {assets.client.css && <link rel="stylesheet" href={assets.client.css} />}
        </head>
        <body {...bodyAttrs}>
          <Root />
          <Data data={data} />
          {error && ErrorComponent && <ErrorComponent error={error} />}
          <script type="text/javascript" src={assets.client.js} defer crossOrigin="anonymous" />
        </body>
      </html>
    );
  }
}

export default Document;
```

If you were using something like `styled-components`, and you need to wrap you entire app with some sort of additional provider or function, you can do this with `renderPage()`.

```jsx
// ./src/Document.js
import React, { PureComponent } from 'react';
import { ServerStyleSheet } from 'styled-components';

export default class Document extends PureComponent {
  static async getInitialProps({ assets, data, renderPage }) {
    const sheet = new ServerStyleSheet();
    const page = await renderPage(App => props => sheet.collectStyles(<App {...props} />));
    const styleTags = sheet.getStyleElement();
    return { assets, data, ...page, styleTags };
  }

  render() {
    const { helmet, assets, data, title, error, ErrorComponent } = this.props;
    // get attributes from React Helmet
    const htmlAttrs = helmet.htmlAttributes.toComponent();
    const bodyAttrs = helmet.bodyAttributes.toComponent();

    return (
      <html {...htmlAttrs}>
        <head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta charSet="utf-8" />
          <title>{title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {helmet.title.toComponent()}
          {helmet.meta.toComponent()}
          {helmet.link.toComponent()}
          {assets.client.css && <link rel="stylesheet" href={assets.client.css} />}
        </head>
        <body {...bodyAttrs}>
          <Root />
          <Data data={data} />
          {error && ErrorComponent && <ErrorComponent error={error} />}
          <script type="text/javascript" src={assets.client.js} defer crossOrigin="anonymous" />
        </body>
      </html>
    );
  }
}
```

To use your custom `<Document>`, pass it to the `Document` option of your Before.js `render` function.

```js
// ./src/server.js
import express from 'express';
import { render } from '@flybondi/Before.js';
import routes from './routes';
import MyDocument from './Document';

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
        document: MyDocument,
        routes,
        assets,
        statsPath
      });
      res.send(html);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  });

export default server;
```

## Custom/Async Rendering

You can provide a custom (potentially async) rendering function as an option to Before.js `render` function.
If present, it will be used instead of the default ReactDOMServer renderToString function.
It has to return an object of shape `{ html : string!, ...otherProps }`, in which `html` will be used as the rendered string
Thus, setting `customRenderer = (node) => ({ html: ReactDOMServer.renderToString(node) })` is the the same as default option.

`otherProps` will be passed as props to the rendered Document

Example:

```js
// ./src/server.js
import React from 'react';
import express from 'express';
import { render } from '@flybondi/Before.js';
import { renderToString } from 'react-dom/server';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import routes from './routes';
import createApolloClient from './createApolloClient';
import Document from './Document';

const assets = require(process.env.ASSETS_MANIFEST);

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.PUBLIC_DIR))
  .get('/*', async (req, res) => {
    const client = createApolloClient({ ssrMode: true });

    const customRenderer = node => {
      const App = <ApolloProvider client={client}>{node}</ApolloProvider>;
      return getDataFromTree(App).then(() => {
        const initialApolloState = client.extract();
        const html = renderToString(App);
        return { html, initialApolloState };
      });
    };

    try {
      const html = await render({
        req,
        res,
        routes,
        assets,
        customRenderer,
        document: Document,
        statsPath
      });
      res.send(html);
    } catch (error) {
      res.json(error);
    }
  });

export default server;
```

