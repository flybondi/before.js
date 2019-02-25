// @flow strict
import type {
  AsyncRoute,
  BeforeComponentWithRouterProps,
  Context,
  InitialProps,
  Request
} from 'Before.component';
import React, { useState, useEffect, useCallback } from 'react';
import { parse } from 'query-string';
import { withRouter, Switch, Route, type ContextRouter } from 'react-router-dom';
import { converge, find, nthArg, pipe, propOr, propEq } from 'ramda';
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
 * @param {object} context react-router context router
 * @param {object} props component inital props
 * @param {object} req server-side request object
 */
const getPageProps = (
  { match, location: { search }, history }: ContextRouter,
  props: InitialProps,
  req: Request
) => ({
  ...props,
  history,
  match: {
    ...match,
    // $FlowFixMe Ramda path type is not working as expected
    querystring: isClientSide() ? parse(search) : propOr({}, 'query', req)
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
  const { data, routes, location, req } = props;
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
      {routes.map(({ component: Component, exact, path }, index) => {
        return (
          <Route
            key={index}
            path={path}
            exact={exact}
            render={(context: ContextRouter) => (
              <Component {...getPageProps(context, routeProps, req)} />
            )}
          />
        );
      })}
    </Switch>
  );
}

export default withRouter(Before);
