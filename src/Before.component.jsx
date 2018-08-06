// @flow strict;

import React, { PureComponent } from 'react';
import {
  Switch,
  Route,
  withRouter,
  type Location,
  type Match,
  type RouterHistory,
  type RouteProps,
  type ContextRouter
} from 'react-router-dom';
import { fetchInitialPropsFromRoute } from './loadInitialProps';

type State = {
  previousLocation: ?Location,
  data: any
};

declare class BeforeComponent<TProps, TState> extends React$Component<TProps, TState> {
  default?: BeforeComponent<TProps, TState>;
  getInitialProps: (data: any) => Promise<any | Error>;
  load: () => Promise<BeforeComponent<TProps, TState>>;
}

export type BeforeRoute<TProps, TState> = {
  ...RouteProps,
  component: BeforeComponent<TProps, TState>,
  redirectTo?: string
};

type Props = {
  [key: string]: any,
  data: any,
  location: Location,
  match: Match,
  routes: Array<BeforeRoute<any, any>>,
  history: RouterHistory
};

const throwError = (error: Error) => {
  console.error('There was an error', error);
  throw error;
};

const createRenderRoute = (
  initialData: any,
  Component: any,
  prefetch: (pathname: string) => void
) => (props: ContextRouter) => {
  const routeProps = {
    ...initialData,
    history: props.history,
    match: props.match,
    prefetch
  };

  return <Component {...routeProps} />;
};

class Before extends PureComponent<Props, State> {
  state = {
    previousLocation: null,
    data: undefined
  };
  prefetcherCache = {};
  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.location !== state.previousLocation) {
      const { data, match, routes, history, location, ...rest } = props;
      return fetchInitialPropsFromRoute(routes, location.pathname, { location, history, ...rest })
        .then(({ data }) => ({
          previousLocation: null,
          data
        }))
        .catch(throwError);
    }
  }

  prefetch = (pathname: string) => {
    const { routes, history } = this.props;
    fetchInitialPropsFromRoute(routes, pathname, { history })
      .then(({ data }) => {
        this.prefetcherCache = {
          ...this.prefetcherCache,
          [pathname]: data
        };
      })
      .catch(throwError);
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return !nextState.previousLocation;
  }

  render() {
    const { previousLocation, data } = this.state;
    const { location, routes } = this.props;
    const initialData = this.prefetcherCache[location.pathname] || data;
    const loc = previousLocation || location;
    return (
      <Switch location={loc}>
        {routes.map((route, index) => (
          <Route
            key={`route--${index}`}
            path={route.path}
            render={createRenderRoute(initialData, route.component, this.prefetch)}
            exact={route.exact}
          />
        ))}
      </Switch>
    );
  }
}

export default withRouter(Before);
