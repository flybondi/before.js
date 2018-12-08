declare module 'Before.component' {
  declare class BeforeComponent<T, S> extends React$Component<T, S> {
    prefetchInitialPropsFromAllRoutes: () => Promise<any>;
  }
}
