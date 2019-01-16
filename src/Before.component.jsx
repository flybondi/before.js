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
import { converge, find, nthArg, pipe, propEq } from 'ramda';
import { parse } from 'query-string';
const { NODE_ENV } = process.env;

/**
 * Log the error to console only in development environment and throw up given error;
 * @param {Error} error
 * @throws Error
 */
const throwError = (error: Error) => {
  NODE_ENV === 'development' && console.error('There was an error', error);
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
    location: props.location,
    match: {
      ...props.match,
      querystring: parse(props.location.search)
    }
  };
  return <Component {...routeProps} />;
};

/**
 * Retrieve the current route by a given path.
 * @func
 * @param {string} pathname
 * @param {array} routes an array of route to filter
 * @returs {object|undefined} a valid route
 **/
const getCurrentRouteByPath: (
  pathname: string,
  routes: Array<AsyncRoute>
) => ?AsyncRoute = converge(find, [
  pipe(
    nthArg(0),
    propEq('path')
  ),
  nthArg(1)
]);

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

  fetchInitialPropsFromCurrentRoute = async (props: BeforeComponentWithRouterProps) => {
    const { history, location, routes, ...rest } = props;
    const { pathname } = location;
    // NOTE(lf): Not necessary to run an initial fetch on all routes, just the one that we want to render.
    try {
      const currentRoute = getCurrentRouteByPath(pathname, routes);
      if (currentRoute) {
        // $FlowFixMe Component
        const data = await getInitialPropsFromComponent(currentRoute.component, currentRoute, {
          location,
          history,
          ...rest
        });
        return {
          previousLocation: location,
          data
        };
      }
    } catch (error) {
      throwError(error);
      return {
        previousLocation: null,
        data: null
      };
    }
  };

  async componentDidUpdate(prevProps: BeforeComponentWithRouterProps) {
    if (isClientSide() && prevProps.location !== this.props.location) {
      const state = await this.fetchInitialPropsFromCurrentRoute(this.props);
      state && this.setState(() => state);
    }
  }

  shouldComponentUpdate(nextProps: BeforeComponentWithRouterProps, nextState: BeforeState) {
    return nextState.previousLocation !== null;
  }

  getData(path: string) {
    return isClientSide() ? this.state.data : this.props.data;
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
