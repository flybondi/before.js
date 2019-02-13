// @flow strict
import type {
  AsyncRoute,
  BeforeComponentWithRouterProps,
  Context,
  Match,
  InitialProps,
  LocationType
} from 'Before.component';
import React, { useState, useEffect, useCallback } from 'react';
import { parse } from 'query-string';
import { withRouter, Switch, Route } from 'react-router-dom';
import { converge, find, nthArg, pipe, propEq } from 'ramda';
import { isClientSide } from './utils';

/**
 * Retrieve the current route by a given path.
 * @func
 * @param {string} pathname
 * @param {array} routes an array of route to filter
 * @returs {object|undefined} a valid route
 **/
const getCurrentRouteByPath: (path: string, routes: Array<AsyncRoute>) => ?AsyncRoute = converge(
  find,
  [
    pipe(
      nthArg(0),
      propEq('path')
    ),
    nthArg(1)
  ]
);

/**
 * Inject querystring into the react-router match object
 * @param {object} match react-router match
 * @param {object} location react-router Location
 * @param {object} props component inital props
 */
const getPageProps = (match: Match, { search }: LocationType, props: InitialProps) => ({
  ...props,
  match: {
    ...match,
    querystring: parse(search)
  }
});

/**
 * Retrieve the initial props from given component route.
 * @param {object} route react-router-v4 route object
 * @param {object} context object to pass into the getInitialProps
 * @param {function} setInitialProps react state hook
 */
const fetchInitialProps = async (
  route: ?AsyncRoute,
  context: Context,
  setInitialProps: (props: { [key: string]: string }) => void
) => {
  try {
    if (route) {
      const { component } = route;
      if (component && component.getInitialProps) {
        const {
          location: { pathname }
        } = context;
        const data = await component.getInitialProps(context);
        setInitialProps({ [pathname]: data });
      }
    }
  } catch (error) {
    setInitialProps({});
  }
};

/**
 * React Component that wraps all async router components into a Route react-router
 * inside a Switch.
 * @function
 */
export function Before(props: BeforeComponentWithRouterProps) {
  const { data, routes, location } = props;
  const { pathname, key } = location;
  const [currentLocation, setCurrentLocation] = useState(location);
  const [isFetching, setIsFetching] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);
  const [initialProps, setInitialProps] = useState({
    [pathname]: data
  });
  const getRoute = useCallback(getCurrentRouteByPath, [pathname, routes]);

  useEffect(() => {
    isClientSide() && setIsFetching(true);
  }, [key]);

  useEffect(() => {
    if (isFetching) {
      setNextLocation(location);
    }
  }, [isFetching]);

  useEffect(() => {
    if (isFetching && nextLocation) {
      const route = getRoute(nextLocation.pathname, routes);
      fetchInitialProps(route, { ...props, location: nextLocation }, data =>
        setInitialProps({ ...initialProps, ...data })
      );
    }
  }, [nextLocation]);

  useEffect(() => {
    if (isFetching && nextLocation) {
      setCurrentLocation(nextLocation);
    }
  }, [initialProps]);

  useEffect(() => {
    setIsFetching(false);
  }, [currentLocation]);

  const routeProps = initialProps[currentLocation.pathname];
  return (
    <Switch location={currentLocation}>
      {routes.map(({ component: Component, exact, path }, index) => (
        <Route
          key={index}
          path={path}
          exact={exact}
          render={({ match, location }) => (
            <Component {...getPageProps(match, location, routeProps)} />
          )}
        />
      ))}
    </Switch>
  );
}

export default withRouter(Before);
