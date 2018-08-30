# Before.js

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

Before.js enables data fetching with any React SSR app that uses React Router 4.

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

### `static async getInitialProps(context)`

Within `getInitialProps`, you have access to all you need to fetch data on both
the client and the server:

- `req?: Request`: (server-only) A server request object
- `res?: Request`: (server-only) A server response object
- `match`: React Router 4's `match` object.
- `history`: React Router 4's `history` object.
- `location`: (client-only) React Router 4's `location` object.

### Injected Page Props

- Whatever you have returned in `getInitialProps`
- `refetch: (nextCtx?: any) => void` - Imperatively call `getInitialProps` again

## Routing

As you have probably figured out, React Router 4 powers all of Before.js's
routing. You can use any and all parts of RR4.

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

### Prefetching inital data

In order to prefecth the initial data for a given route just set the `prefetch` property to `true` and when the component is mounted
in the client, it will call the `static async getInitialProps` from each route and store them in the `window.localStorage`.

```js
// ./src/routes.js
import Home from './Home';
import About from './About';
import Detail from './Detail';

const routes = [
  {
    path: '/',
    component: Home,
    prefetch: false
  },
  {
    path: '/about',
    component: About,
    prefetch: true
  },
  {
    path: '/detail/:id',
    component: Detail,
    prefetch: true
  }
];

export default routes;
```

### Client Only Data and Routing

In some parts of your application, you may not need server data fetching at all
(e.g. settings). With Before.js, you just use React Router 4 as you normally
would in client land: You can fetch data (in componentDidMount) and do routing
the same exact way.

## Code Splitting

Before.js lets you easily define lazy-loaded or code-split routes in your `routes.js` file. To do this, you'll need to modify the relevant route's `component` definition like so:

```js
// ./src/_routes.js
import React from 'react';
import Home from './Home';
import { asyncComponent } from '@flybondi/Before.js.js';

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
      loader: () => import('./About'), // required
      Placeholder: () => <div>...LOADING...</div> // this is optional, just returns null by default
    })
  }
];
```

## Custom `<Document>`

Before.js works similarly to Next.js with respect to overriding HTML document structure. This comes in handy if you are using a CSS-in-JS library or just want to collect data out of react context before or Before render. To do this, create a file in `./src/Document.js` like so:

```js
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

```js
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
        assets
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

Example :

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
        document: Document
      });
      res.send(html);
    } catch (error) {
      res.json(error);
    }
  });

export default server;
```
