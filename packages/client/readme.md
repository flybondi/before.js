# @before/client

[![js-flybondi](https://img.shields.io/badge/flybondi-fdbe15.svg?logo=javascript&style=flat-square&logoColor=grey&logoWidth=20)](https://flybondi.com)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

```sh
yarn add @before/client
yarn add @loadable/component react react-dom react-router-dom
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

```jsx
// ./src/client.js
import React from 'react';
import routes from './routes';
import { hydrate } from 'react-dom';
import { ensureReady, ensureClientReady, Before } from '@before/client';

ensureClientReady(() =>
  ensureReady(routes)
    .then(data => {
      hydrate(
        <BrowserRouter>
          <Before data={data} routes={routes} />
        </BrowserRouter>,
        document.getElementById('root')
      );
    })
  }
);
```

```jsx
// ./pages/HomeContainer/HomeContainer.page'
import React, { useCallback } from 'react';

function HomePage({ history, location }) {
  const handleClick = useCallback(() => {
    history.push('/search/page');
  }, [history]);

  return (
    <main>
      <header>
        <h1>Home Page</h1>
      </header>
      <article>
        <section>
          <p>Hello actual pathname is {location.pathname}</p>
        </section>
        <a href="" onClick={handleClick}>Go to next page</a>
      </article>
    </main>
  );
}
```
## Page props

Before will pass down the following props to your component plus all your component initial props:

| Name | Description |
|--|--|
| history | Copy of [react-router history](https://github.com/ReactTraining/history) but with custom `push`, `replace` and `location` properties. The original properties can we access with the `unstable_` prefix. |
| query | Object with the querystring value from the `location` object if we are in the client or from the _request query_ if we are in the server. |
| match | A match object contains information about how a <Route path> matched the URL. [More info](https://reacttraining.com/react-router/web/api/match) |
| location | A location object shaped like `{ pathname, search, hash, state }` |



