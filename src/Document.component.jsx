// @flow strict;

import type { StateOnServer } from 'react-helmet';
import React, { PureComponent } from 'react';
import { F, identity } from 'ramda';
import Error from './Error.component';
import serialize from 'serialize-javascript';

export type DocumentProps = {
  helmet: StateOnServer,
  assets: {
    client: {
      css: ?string,
      js: ?string
    }
  },
  data: any,
  title: ?string,
  error?: Error,
  errorComponent?: React$ElementType | React$ComponentType<any>,
  filterServerData: (data: { [key: string]: any }) => { [key: string]: any },
  criticalCSS: React$Node | false
};

export type DocumentInitialProps = {
  [key: string]: any,
  assets: {
    client: {
      css: ?string,
      js: ?string
    }
  },
  data: any,
  title?: string,
  error?: Error,
  errorComponent?: React$ElementType | React$ComponentType<any>,
  filterServerData: (data: { [key: string]: any }) => { [key: string]: any },
  renderPage: (data: { [key: string]: any }) => Promise<any>,
  generateCriticalCSS: () => React$Node | false
};

export class Document extends PureComponent<DocumentProps> {
  static async getInitialProps({
    assets,
    data,
    renderPage,
    generateCriticalCSS = F,
    title,
    ...rest
  }: DocumentInitialProps): Promise<DocumentProps> {
    const page = await renderPage(data);
    const criticalCSS = generateCriticalCSS();
    return { assets, criticalCSS, data, title, ...rest, ...page };
  }

  render() {
    const {
      helmet,
      assets,
      criticalCSS,
      data,
      title,
      error,
      errorComponent: ErrorComponent,
      filterServerData = identity
    } = this.props;
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
          {criticalCSS !== false && criticalCSS}
          {assets.client.css && <link rel="stylesheet" href={assets.client.css} />}
        </head>
        <body {...bodyAttrs}>
          <Root />
          <Data data={filterServerData(data)} />
          {error
            ? ErrorComponent ? <ErrorComponent error={error} /> : <Error message={error.message} stack={error.stack} />
            : null}
          <script type="text/javascript" src={assets.client.js} defer crossOrigin="anonymous" />
        </body>
      </html>
    );
  }
}

export const Root = () => <div id="root">BEFORE.JS-DATA</div>;

export const Data = ({ data }: any) => (
  <script
    id="server-app-state"
    type="application/json"
    dangerouslySetInnerHTML={{
      __html: serialize({ ...data }).replace(/<\/script>/g, '%3C/script%3E')
    }}
  />
);
