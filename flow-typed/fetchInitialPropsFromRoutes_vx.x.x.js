declare module 'fetchInitialPropsFromRoutes' {
  declare type Assets = {
    client: {
      css: string,
      js: string
    }
  };

  declare type Extractor = {
    getStyleTags(): Array<React$Element<'link'>>,
    getStyleElements(): Array<React$Element<'link'>>,
    getLinkElements(): Array<React$Element<'link'>>
  };

  declare type InitialProps = {
    [key: string]: any
  };

  declare class AsyncComponent extends React$PureComponent<InitialProps> {
    static getInitialProps(context: Context): Promise<InitialProps | Error>;
    static load(): Promise<React$Node>;
  }

  declare type AsyncComponentType = typeof AsyncComponent;

  declare type TestComponentType = Class<AsyncComponent> | typeof AsyncComponent;

  declare type Route = {
    component: TestComponentType,
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
    search: string
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

  declare type Context = {
    req: Request,
    res?: Response,
    assets?: Assets,
    data?: ?DataType,
    filterServerData?: (data: ?DataType) => DataType,
    renderPage?: (data: ?DataType) => Promise<Page>,
    generateCriticalCSS?: () => string | boolean,
    title?: string,
    extractor?: ?Extractor,
    location?: LocationType,
    [key: string]: any
  };

  declare type Props = {
    data: Error | DataType | null,
    route: Route | null
  };

  declare module.exports: {
    fetchInitialPropsFromRoute(
      routes: Array<Route>,
      pathname: string,
      context: ?Context
    ): Promise<Props>
  };
}
