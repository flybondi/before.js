declare module 'render' {
  import type { AsyncComponentType } from 'fetchInitialPropsFromRoutes';
  import type { DocumentComponent } from 'Document.component';
  import type { Extractor } from '@loadable/server';

  declare type Assets = {
    client: {
      css: string,
      js: string
    }
  };

  declare type InitialProps = {
    [key: string]: any
  };

  declare type Route = {
    component: AsyncComponentType,
    redirectTo?: string,
    prefetch?: boolean,
    isExact: boolean,
    params: { [key: string]: ?string },
    url: string,
    path?: string,
    sensitive?: boolean,
    strict?: boolean,
    exact?: boolean
  };

  declare type DataType = {
    [key: string]: any
  };

  declare type Page = {
    html: string,
    [key: string]: any
  };

  declare type LocationType = {
    hash: string,
    key?: string,
    pathname: string,
    search: string,
    state?: any
  };

  declare type TagMethods = {
    toString(): string,
    toComponent(): Array<React$Element<any>> | React$Element<any> | Array<Object>
  };

  declare type AttributeTagMethods = {
    toString(): string,
    toComponent(): { [key: string]: any }
  };

  declare type Helmet = {
    base: TagMethods,
    bodyAttributes: AttributeTagMethods,
    htmlAttributes: AttributeTagMethods,
    link: TagMethods,
    meta: TagMethods,
    noscript: TagMethods,
    script: TagMethods,
    style: TagMethods,
    title: TagMethods
  };

  declare type ErrorProps = {
    error: Error
  };

  declare type QueryType = {
    [key: string]: string
  };

  declare type Request = {
    url: string,
    query: QueryType,
    originalUrl: string,
    [key: string]: any
  };

  declare type Response = {
    status(code: number): void,
    redirect(code: number, redirectTo: string): void,
    [key: string]: any
  };

  declare type HtmlType = {
    html: string
  };

  declare type Renderer = <T>(element: React$Element<React$ComponentType<T>>) => HtmlType;

  declare type PageProps = {
    routes: Array<Route>,
    data: ?DataType,
    req: Request
  };

  declare type CreatePageComponent = <T>(
    Page: React$ComponentType<T>
  ) => (props: PageProps) => React$Element<React$ComponentType<PageProps>>;

  declare type RenderOptions = {
    req: Request,
    res: Response,
    routes: Array<Route>,
    assets: Assets,
    document: DocumentComponent,
    filterServerData(?DataType): DataType,
    generateCriticalCSS(): string | boolean,
    customRenderer: Renderer,
    title: string,
    statsPath: ?string,
    [key: string]: any
  };

  declare type Context = {
    req: Request,
    res: Response,
    assets: Assets,
    data: ?DataType,
    filterServerData: (data: ?DataType) => DataType,
    renderPage(data: ?DataType): Promise<Page>,
    generateCriticalCSS(): string | boolean,
    title: string,
    extractor: ?Extractor,
    location?: LocationType,
    [key: string]: any
  };

  declare module.exports: {
    render: (options: RenderOptions) => string
  };
}
