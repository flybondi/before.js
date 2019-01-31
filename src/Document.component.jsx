// @flow strict
import type { DocumentInitialProps, Context, Extractor, DataType } from 'Document.component';
import React, { PureComponent } from 'react';
import { F, identity, path } from 'ramda';
import Error from './Error.component';
import serialize from 'serialize-javascript';

const getHeaderTags = (extractor: Extractor) => [
  ...extractor.getScriptElements(),
  ...extractor.getStyleElements(),
  ...extractor.getLinkElements()
];

export class DocumentComponent extends PureComponent<DocumentInitialProps> {
  static async getInitialProps({
    assets,
    data,
    renderPage,
    generateCriticalCSS = F,
    extractor,
    ...rest
  }: Context): Promise<DocumentInitialProps> {
    const page = await renderPage(data);
    const criticalCSS = generateCriticalCSS();
    return { assets, criticalCSS, data, extractor, ...rest, ...page };
  }

  render() {
    const {
      helmet,
      assets,
      criticalCSS,
      data,
      error,
      errorComponent: ErrorComponent,
      filterServerData = identity,
      extractor
    } = this.props;
    // get attributes from React Helmet
    const htmlAttrs = helmet.htmlAttributes.toComponent();
    const bodyAttrs = helmet.bodyAttributes.toComponent();
    const clientCss = path(['client', 'css'], assets);
    return (
      <html {...htmlAttrs}>
        <head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no" />
          {helmet.title.toComponent()}
          {helmet.meta.toComponent()}
          {helmet.link.toComponent()}
          {helmet.script.toComponent()}
          {extractor && getHeaderTags(extractor)}
          {criticalCSS !== false && criticalCSS}
          {clientCss && <link rel="stylesheet" href={clientCss} />}
        </head>
        <body {...bodyAttrs}>
          <Root />
          <Data data={filterServerData(data)} />
          {error ? (
            ErrorComponent ? (
              <ErrorComponent error={error} />
            ) : (
              <Error message={error.message} stack={error.stack} />
            )
          ) : null}
        </body>
      </html>
    );
  }
}

export const Root = () => <div id="root">BEFORE.JS-DATA</div>;

export const Data = ({ data }: { data: DataType }) => (
  <script
    id="server-app-state"
    type="application/json"
    dangerouslySetInnerHTML={{
      __html: serialize({ ...data }).replace(/<\/script>/g, '%3C/script%3E')
    }}
  />
);
