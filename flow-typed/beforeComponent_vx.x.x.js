type Window = {
  location: {
    hostname: string
  }
};

type Reviver = (key: string | number, value: any) => any;

type JSONType = {|
  parse(text: string, reviver?: Reviver): { [key: any]: any }
|};

declare module 'Before.component' {
  declare var window: Window;
  declare var JSON: JSONType;

  declare type DataType = {
    [key: any]: any
  };

  declare type LocationType = {
    hash: string,
    key?: string,
    pathname: string,
    search: string,
    state?: any
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
    location: LocationType,
    [key: string]: any
  };

  declare class AsyncComponent extends React$PureComponent<InitialProps> {
    static getInitialProps(context: Context): Promise<InitialProps | Error>;
    static load(): Promise<React$Node>;
  }

  declare type FixMeType = Class<AsyncComponent> | typeof AsyncComponent;

  declare type AsyncRoute = {
    component: FixMeType,
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

  declare type SwitchRoutesProps = {
    +data: ?DataType,
    +routes: Array<AsyncRoute>
  };

  declare type Match = {
    params: { [key: string]: ?string },
    isExact: boolean,
    path: string,
    url: string
  };

  declare type BeforeProps = {|
    +data: ?DataType,
    +routes: Array<AsyncRoute>,
    +req: Request
  |};

  declare type BeforeState = {
    currentLocation: LocationType,
    isFetching: boolean,
    nextLocation: ?LocationType,
    initialProps: DataType
  };

  declare type BeforeAction = {
    type: 'start' | 'end',
    location: LocationType,
    props?: DataType
  };

  declare type StaticRouterContext = {
    url?: string
  };

  declare type ShouldRenderProps = {
    children: React$Element<FixMeType>,
    isFetching: boolean,
    location: LocationType
  };

  declare type BeforeComponentWithRouterProps = {|
    +history: RouterHistory,
    +location: LocationType,
    +match: Match,
    +staticContext?: StaticRouterContext,
    +data: ?DataType,
    +routes: Array<AsyncRoute>,
    +req: Request
  |};

  declare module.exports: {
    Before: (
      props: BeforeComponentWithRouterProps
    ) => React$Element<
      Class<
        React$Component<{|
          children?: Node,
          location?: Location
        |}>
      >
    >
  };
}
