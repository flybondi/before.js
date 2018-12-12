// @flow strict
import type {
  AsyncRoute,
  BeforeState,
  BeforeComponentWithRouterProps,
  DataType,
  FixMeType
} from 'Before.component';
import React, { Component } from 'react';
import { Switch, Route, withRouter, type ContextRouter } from 'react-router-dom';
import { getInitialPropsFromComponent } from './fetchInitialPropsFromRoute';
import { isClientSide } from './utils';

type Callback = (props: ?DataType, route: AsyncRoute) => void;
/**
 * Log and throw up given error;
 * @param {Error} error
 * @throws Error
 */
const throwError = (error: Error) => {
  console.error('There was an error', error);
  throw error;
};

/**
 * Inject context router props into given component.
 * @param {object} initialData
 * @param {React$Component} Component
 * @returns {React$Element<any>}
 */
const createRenderRoute = (initialData: ?DataType, Component: FixMeType) => (
  props: ContextRouter
) => {
  const routeProps = {
    ...initialData,
    history: props.history,
    match: props.match
  };

  return <Component {...routeProps} />;
};

/**
 * Retrieve data from localstorage.
 * @func
 * @param {string} key a localstorage string key
 * @returns {any|null}
 */
const getDataFromStore = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Returns a function that will insert given data into the localstorage.
 * @func
 * @param {any} data the value to be store
 * @param {object} route a react-router route
 * @returns {void}
 */
const setDataIntoStore = (data: ?DataType, route: ?AsyncRoute) => {
  if (route && data) {
    const { path } = route;
    const { hostname } = window.location;
    localStorage.setItem(`${hostname}${path || ''}`, JSON.stringify(data));
  }
};

/**
 * Iterates over given array of routes and try to fetch the initial props for each route and
 * then will call given callback function with fetched initial props and the route.
 *
 * @func
 * @param {Array} routes an array of async routes
 * @param {Function} callback method to be called after the props are fetched
 */
const fetchInitialPropsFrom = (routes: Array<AsyncRoute>, callback: ?Callback) => {
  routes.forEach(async route => {
    try {
      // $FlowFixMe
      const props = await getInitialPropsFromComponent(route.component, route);
      callback && callback(props, route);
    } catch (error) {
      throwError(error);
    }
  });
};

/**
 * React Component class that wraps all async router components into a Route react-router
 * inside a Switch.
 * @class
 */
export class Before extends Component<BeforeComponentWithRouterProps, BeforeState> {
  state = {
    previousLocation: this.props.location,
    data: this.props.data
  };
  prefetchInitialPropsFromAllRoutes = () => {
    const { routes } = this.props;
    const routesForPrefetch = routes.filter(r => r.prefetch);
    fetchInitialPropsFrom(routesForPrefetch, setDataIntoStore);
  };

  constructor(props: BeforeComponentWithRouterProps) {
    super(props);
    isClientSide() && this.prefetchInitialPropsFromAllRoutes();
  }

  componentDidUpdate(prevProps: BeforeComponentWithRouterProps) {
    if (isClientSide() && prevProps.location !== this.props.location) {
      const { location, routes } = this.props;
      const notPrefetchedRoutes = routes.filter(r => !r.prefetch);
      fetchInitialPropsFrom(notPrefetchedRoutes, (data: ?DataType) =>
        this.setState(() => ({
          previousLocation: location,
          data
        }))
      );
    }
  }

  shouldComponentUpdate(nextProps: BeforeComponentWithRouterProps, nextState: BeforeState) {
    return nextState.previousLocation !== null;
  }

  getData(path: string) {
    return isClientSide()
      ? getDataFromStore(`${window.location.hostname}${path}`) || this.state.data
      : this.props.data;
  }

  render() {
    const { previousLocation } = this.state;
    const { location, routes } = this.props;
    const loc = previousLocation || location;
    const initialData = this.getData(loc.pathname);
    return (
      <Switch location={loc}>
        {routes.map((route, index) => (
          <Route
            key={`route--${index}`}
            path={route.path}
            render={createRenderRoute(initialData, route.component)}
            exact={route.exact}
          />
        ))}
      </Switch>
    );
  }
}

export default withRouter(Before);
