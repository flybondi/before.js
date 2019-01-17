type Window = {
  location: {
    pathname: string
  }
};

type Reviver = (key: string | number, value: any) => any;

type JSONType = {|
  parse(text: string, reviver?: Reviver): { [key: any]: any }
|};

declare module 'ensureReady' {
  declare var window: Window;
  declare var JSON: JSONType;

  declare type DataType = {
    [key: string]: any
  };

  declare type InitialProps = {
    [key: string]: any
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

  declare type Assets = {
    client: {
      css: string,
      js: string
    }
  };

  declare type LocationType = {
    hash: string,
    key?: string,
    pathname: string,
    search: string,
    state?: any
  };

  declare type Extractor = {
    getStyleTags(): Array<React$Element<'link'>>,
    getStyleElements(): Array<React$Element<'link'>>,
    getLinkElements(): Array<React$Element<'link'>>
  };

  declare type Page = {
    html: string,
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

  declare class AsyncComponent extends React$PureComponent<InitialProps> {
    static getInitialProps(context: Context): Promise<InitialProps | Error>;
    static load(): Promise<React$Node>;
  }

  declare type Route = {
    component: Class<AsyncComponent> | typeof AsyncComponent,
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

  declare module.exports: {
    ensureReady: (routes: Array<Route>, pathname: string) => Promise<DataType>,
    ensureClientReady: (rootFn: () => void) => Promise<void>
  };
}
