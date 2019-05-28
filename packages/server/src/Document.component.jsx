// @flow strict
import type {
  ExtraTag,
  DocumentInitialProps,
  DocumentGetInitialProps,
  Context,
  Extractor,
  DataType
} from 'Document.component';
import React, { Fragment } from 'react';
import { F, identity, path } from 'ramda';
import { Error } from './Error.component';
import serialize from 'serialize-javascript';

const getHeaderTags = (extractor: Extractor) => [
  ...extractor.getScriptElements(),
  ...extractor.getStyleElements(),
  ...extractor.getLinkElements()
];

const renderTags = ({ tag: Tag, content, name, attribs }: ExtraTag) => (
  <Tag key={name} {...attribs} dangerouslySetInnerHTML={{ __html: content }} />
);

export function DocumentComponent({
  helmet,
  assets,
  criticalCSS,
  data,
  error,
  errorComponent: ErrorComponent,
  filterServerData = identity,
  extractor,
  extraHeadTags = [],
  extraBodyTags = []
}: DocumentInitialProps) {
  // get attributes from React Helmet
  const htmlAttrs = helmet.htmlAttributes.toComponent();
  const bodyAttrs = helmet.bodyAttributes.toComponent();
  const clientCss = path(['client', 'css'], assets);
  return (
    <html {...htmlAttrs}>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"
        />
        {helmet.title.toComponent()}
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}
        {helmet.script.toComponent()}
        {extractor && getHeaderTags(extractor)}
        {criticalCSS !== false && criticalCSS}
        {clientCss && <link rel="stylesheet" href={clientCss} />}
        {extraHeadTags.map(renderTags)}
      </head>
      <body {...bodyAttrs}>
        {error ? (
          ErrorComponent ? (
            <ErrorComponent error={error} />
          ) : (
            <Error message={error.message} stack={error.stack} />
          )
        ) : (
          <Fragment>
            <Root />
            <Data data={filterServerData(data)} />
          </Fragment>
        )}
        {extraBodyTags.map(renderTags)}
      </body>
    </html>
  );
}

DocumentComponent.getInitialProps = async ({
  assets,
  data,
  renderPage,
  generateCriticalCSS = F,
  extractor,
  ...rest
}: Context): Promise<DocumentGetInitialProps> => {
  const page = await renderPage(data);
  const criticalCSS = generateCriticalCSS();
  return { assets, criticalCSS, data, extractor, ...rest, ...page };
};

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
