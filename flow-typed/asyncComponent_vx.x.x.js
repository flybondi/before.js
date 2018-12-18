declare module 'Async.component' {
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
    location?: LocationType,
    [key: string]: any
  };

  declare type AsyncProps = {
    [key: string]: any
  };

  declare type AsyncRouteComponent<T> = React$ComponentType<T> & {
    load: () => Promise<React$Node>,
    getInitialProps: (context: Context) => Promise<AsyncProps>
  };

  declare type ComponentType<P> = {
    getInitialProps(context: Context): Promise<DataType>
  } & $Subtype<React$ComponentType<P>>;

  declare type AsyncOptions = {
    loader():
      | Promise<ComponentType<AsyncProps>>
      | Promise<{| +default: ComponentType<AsyncProps> |}>,
    LoadableComponent: React$ComponentType<AsyncProps>
  };

  declare module.exports: {
    asyncComponent(opts: AsyncOptions): (props: AsyncProps) => AsyncRouteComponent<AsyncProps>
  };
}
