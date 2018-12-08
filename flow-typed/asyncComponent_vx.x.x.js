declare module 'Async.component' {
  declare type Context = {
    [key: string]: any
  };
  declare export type AsyncRouteComponent<T> = React$ComponentType<T> & {
    load: () => Promise<React$Node>,
    getInitialProps: (context: Context) => Promise<any>
  };
  declare export type AsyncOptions = {
    loader: () => Promise<React$Node>,
    Placeholder: ?React$Node
  };
  declare module.exports: {
    asyncComponent(opts: AsyncOptions): (props: any) => AsyncRouteComponent<any>
  };
}
