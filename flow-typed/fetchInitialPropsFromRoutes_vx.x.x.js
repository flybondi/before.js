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

  // fixme(lf): I don't why this one is not working.
  declare type AsyncComponentType = Class<AsyncComponent> | typeof AsyncComponent;
  declare type AsyncFixMeComponentType = Class<AsyncComponent> | typeof AsyncComponent;

  declare type Route = {
    component: AsyncFixMeComponentType,
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

  declare type QueryType = {
    [key: string]: string
  };

  declare type Request = {
    url: string,
    query: QueryType,
    originalUrl: string,
    path: string,
    [key: string]: any
  };

  declare type Response = {
    status(code: number): void,
    redirect(code: number, redirectTo: string): void,
    [key: string]: any
  };

  declare type HistoryAction = 'PUSH' | 'REPLACE' | 'POP';

  declare type RouterHistory = {
    length: number,
    location: LocationType,
    action: HistoryAction,
    listen(callback: (location: LocationType, action: HistoryAction) => void): () => void,
    push(path: string | LocationType, state?: any): void,
    replace(path: string | LocationType, state?: any): void,
    go(n: number): void,
    goBack(): void,
    goForward(): void,
    canGo?: (n: number) => boolean,
    block(callback: (location: LocationType, action: HistoryAction) => boolean): void,
    index?: number,
    entries?: Array<LocationType>
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
    history?: RouterHistory,
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
