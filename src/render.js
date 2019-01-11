//
// The customRenderer parameter is a (potentially async) function that can be set to return more than just a rendered string.
// If present, it will be used instead of the default ReactDOMServer renderToString function.
// It has to return an object of shape { html, ... }, in which html will be used as the rendered string
// Other props will be also pass to the Document component
//
// @flow strict
import type { Extractor, PageProps, Renderer, RenderOptions, Request, Route } from 'render';
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';
import { DocumentComponent as DefaultDoc } from './Document.component';
import { fetchInitialPropsFromRoute } from './fetchInitialPropsFromRoute';
import { isError, isPromise } from './utils';
import { complement, isEmpty } from 'ramda';
import { StaticRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Before from './Before.component';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

/**
 * Check if given value if defined.
 *
 * @func
 * @param {any} value to check
 * @returns {boolean}
 */
const isNotEmpty = complement(isEmpty);

/**
 * Similar to renderToString, except this doesn't create extra DOM attributes such as data-reactid,
 * that React uses internally. This is useful if you want to use React as a simple static page generator,
 * as stripping away the extra attributes can save lots of bytes.
 * Finally, replace the `BEFORE.JS-DATA` with the result of the _renderToStaticMarkup_.
 * @param {React$PureComponent} Document a react PureComponent
 * @param {object} docProps Document props object
 * @param {string} html initial HTML
 */
const parseDocument = (Document, docProps, html) => {
  const { extractor } = docProps;
  const rootNode = extractor ? (
    <ChunkExtractorManager extractor={extractor}>
      <Document {...docProps} />
    </ChunkExtractorManager>
  ) : (
    <Document {...docProps} />
  );
  const doc = ReactDOMServer.renderToStaticMarkup(rootNode);

  return `<!doctype html>` + doc.replace('BEFORE.JS-DATA', `${html}`);
};

/**
 * Render a React element to its initial HTML.
 * @param {React$Element} element a react element
 * @returns {object} with given element rendered as an string.
 */
const defaultRenderer: Renderer = element => ({
  html: ReactDOMServer.renderToString(element)
});

/**
 * Creates a Page component that will inject given props.
 * @func
 * @param {React$ComponentType} Page a react component
 * @returns {function} that will inject given props into the Page component.
 */
const defaultCreatePageComponent = (Page: typeof Before) => (props: PageProps) => (
  // $FlowFixMe
  <Page {...props} />
);

/**
 * Renders given routes with given render function.
 *
 * @param {object} req an string that represents the url location
 * @param {array} routes an array of routes
 * @param {function} renderer custom renderer function
 * @param {object} context StaticRouter context object
 */
const createRenderPage = (
  req: Request,
  routes: Array<Route>,
  renderer: Renderer = defaultRenderer,
  context = {}
) => async (data, createPageComponent = defaultCreatePageComponent) => {
  const asyncOrSyncRender = renderer(
    <StaticRouter location={req.url} context={context}>
      {createPageComponent(Before)({ routes, data, req })}
    </StaticRouter>
  );

  // if the rendered content is a promise, we wait for it to finish
  const renderedContent = isPromise(asyncOrSyncRender)
    ? await asyncOrSyncRender
    : asyncOrSyncRender;
  const helmet = Helmet.renderStatic();
  return { ...renderedContent, helmet };
};

/**
 * Creates a new instance of ChunkExtractor if given path is defined.
 *
 * @func
 * @param {string} statsPath
 * @returns {object | null} instance of ChunkExtractor
 */
const getExtractor = (statsPath: ?string, entrypoints: Array<string>): ?Extractor => {
  let extractor = null;
  if (statsPath) {
    const statsFile = path.resolve(statsPath);
    extractor = new ChunkExtractor({ statsFile, entrypoints });
  }

  return extractor;
};

/**
 * Function that will try to retrieve the intial props for the route that is trying
 * to render. Catch any error that will happen during the render process or even fetching
 * the initial route props and will render an error component instead the desire route.
 *
 * @param {object} {
 *   req,
 *   res,
 *   routes,
 *   assets,
 *   document: Document = DefaultDoc,
 *   filterServerData,
 *   generateCriticalCSS,
 *   customRenderer,
 *   statsPath,
 *   title,
 *   ...rest
 * } RenderOptions an object with all options used to render the initial HTML.
 * @returns {Promise}
 */
export async function render({
  req,
  res,
  routes,
  assets,
  document: Document = DefaultDoc,
  filterServerData,
  generateCriticalCSS,
  customRenderer,
  statsPath,
  title,
  ...rest
}: RenderOptions) {
  const { path, originalUrl } = req;
  const extractor = getExtractor(statsPath, ['client']);
  const renderPage = createRenderPage(req, routes, customRenderer);

  let response = {};
  try {
    response = await fetchInitialPropsFromRoute(routes, path, {
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

  if (isNotEmpty(route)) {
    if (route.path === '**') {
      return res.status(404);
    }

    if (route.redirectTo && route.path) {
      return res.redirect(301, originalUrl.replace(route.path, route.redirectTo));
    }
  }

  const docProps = await Document.getInitialProps({
    req,
    res,
    assets,
    renderPage,
    data,
    filterServerData,
    generateCriticalCSS,
    title,
    extractor,
    ...rest,
    error: isError(data) && data,
    match: route
  });
  const { html } = docProps;
  return parseDocument(Document, docProps, html);
}
