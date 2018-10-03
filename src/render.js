// @flow strict;
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Helmet from 'react-helmet';
import { StaticRouter } from 'react-router-dom';
import Before, { type BeforeRoute } from './Before.component';
import { Document as DefaultDoc, type DocumentProps } from './Document.component';
import { fetchInitialPropsFromRoute } from './fetchInitialPropsFromRoute';
import { isError, isPromise } from './utils';
import { parse } from 'url';

/*
 The customRenderer parameter is a (potentially async) function that can be set to return more than just a rendered string.
 If present, it will be used instead of the default ReactDOMServer renderToString function.
 It has to return an object of shape { html, ... }, in which html will be used as the rendered string
 Other props will be also pass to the Document component
  */

type Renderer = (element: React$Node) => {| html: string |};
type ParseDocument = (
  Document: typeof DefaultDoc | React$ComponentType<DocumentProps>,
  docProps: DocumentProps,
  html: string
) => string;
export type BeforeRenderProps<T> = {
  req: {
    [key: string]: ?any,
    url: string,
    originalUrl: string
  },
  res: {
    [key: string]: ?any,
    status: (code: number) => void,
    redirect: (code: number, to: string) => void
  },
  assets: any,
  customRenderer?: Renderer,
  routes: Array<BeforeRoute<any, any>>,
  document: typeof DefaultDoc | React$ComponentType<T>,
  filterServerData: (data: { [key: string]: any }) => { [key: string]: any },
  generateCriticalCSS: () => React$Node | false
};

const parseDocument: ParseDocument = (Document, docProps, html) => {
  const doc = ReactDOMServer.renderToStaticMarkup(<Document {...docProps} />);
  return `<!doctype html>` + doc.replace('BEFORE.JS-DATA', html);
};

const defaultRenderer: Renderer = element => ({
  html: ReactDOMServer.renderToString(element)
});

const defaultCreatePageComponent = (Page: React$ComponentType<any>) => (props: any) => (
  <Page {...props} />
);

const createRenderPage = (
  url: string,
  routes: Array<BeforeRoute<any, any>>,
  renderer: Renderer = defaultRenderer,
  context = {}
) => async (data, createPageComponent = defaultCreatePageComponent) => {
  const asyncOrSyncRender = renderer(
    <StaticRouter location={url} context={context}>
      {createPageComponent(Before)({ routes, data })}
    </StaticRouter>
  );

  // if the rendered content is a promise, we wait for it to finish
  const renderedContent = isPromise(asyncOrSyncRender)
    ? await asyncOrSyncRender
    : asyncOrSyncRender;
  const helmet = Helmet.renderStatic();
  return { helmet, ...renderedContent };
};

export async function render({
  req,
  res,
  routes,
  assets,
  // $FlowFixMe
  document: Document = DefaultDoc,
  filterServerData,
  generateCriticalCSS,
  customRenderer,
  ...rest
}: BeforeRenderProps<DocumentProps>) {
  const { pathname } = parse(req.url);
  const renderPage = createRenderPage(req.url, routes, customRenderer);
  let response = {};
  try {
    // $FlowFixMe
    response = await fetchInitialPropsFromRoute(routes, pathname, {
      req,
      res,
      ...rest
    });
  } catch (error) {
    console.error('There was an error while loading the initial props', error);
    response = {
      data: error,
      route: {}
    };
  }
  const { route, data } = response;

  if (route.path === '**') {
    return res.status(404);
  }

  if (route.redirectTo) {
    return res.redirect(301, req.originalUrl.replace(route.path, route.redirectTo));
  }
  // $FlowFixMe
  const { html, ...docProps } = await Document.getInitialProps({
    req,
    res,
    assets,
    renderPage,
    data,
    filterServerData,
    generateCriticalCSS,
    ...rest,
    error: isError(data) && data,
    match: route
  });

  return parseDocument(Document, docProps, html);
}
