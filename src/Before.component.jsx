// @flow strict;

import React, { Component } from 'react';
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
import { fetchInitialPropsFromRoute } from './fetchInitialPropsFromRoute';
import { isClientSide } from './utils';

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
  prefetch: (pathname: string) => Promise<void>
) => (props: ContextRouter) => {
  const routeProps = {
    ...initialData,
    history: props.history,
    match: props.match,
    prefetch
  };

  return <Component {...routeProps} />;
};

class Before extends Component<Props, State> {
  state = {
    previousLocation: this.props.location,
    data: this.props.data
  };
  prefetcherCache = {};

  prefetch = (pathname: string) => {
    const { routes, history } = this.props;
    return fetchInitialPropsFromRoute(routes, pathname, { history })
      .then(({ data }) => {
        this.prefetcherCache = {
          ...this.prefetcherCache,
          [pathname]: data
        };
      })
      .catch(throwError);
  };

  componentDidUpdate(prevProps: Props) {
    if (isClientSide() && prevProps.location !== this.props.location) {
      const { routes, history, location, ...rest } = this.props;
      this.setState(prevState => ({
        ...prevState,
        data: undefined,
        previousLocation: null
      }));
      fetchInitialPropsFromRoute(routes, location.pathname, { location, history, ...rest })
        .then(({ data }) => {
          this.setState(() => ({
            previousLocation: location,
            data
          }));
        })
        .catch(throwError);
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return nextState.previousLocation !== null;
  }

  getData() {
    return isClientSide() ? this.state.data : this.props.data;
  }

  render() {
    const data = this.getData();
    const { previousLocation } = this.state;
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
