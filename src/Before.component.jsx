// @flow strict
import type {
  AsyncRoute,
  BeforeAction,
  BeforeComponentWithRouterProps,
  BeforeState,
  Context,
  InitialProps,
  LocationType,
  QueryType,
  ShouldRenderProps
} from 'Before.component';
import React, { useCallback, useEffect, useReducer, useRef, useMemo, memo } from 'react';
import { withRouter, Switch, Route, type ContextRouter } from 'react-router-dom';
import {
  compose,
  concat,
  find,
  has,
  head,
  ifElse,
  identity,
  last,
  propOr,
  prop,
  propEq,
  split,
  useWith
} from 'ramda';
import { getQueryString } from './utils';

/**
 * Extract the base path from given full pathname, for example given the following url `/foo?bar=2`
 * will return `/foo`.
 * @func
 * @param {string} pathname the pathname to retrieve the pathname
 * @returns {string} the base path
 */
const getBasePath: (pathname: string) => string = compose(
  head,
  split('#'),
  head,
  split('?')
);

/**
 * Extract the search part of a given full pathname or window.Location, for example given the following url `/foo?bar=2`
 * will return `?bar=2`.
 * @func
 * @param {string|object} pathname | Location
 * @returns {string} the querystring
 */
const getSearch: (pathname: string | LocationType) => string = ifElse(
  has('search'),
  prop('search'),
  compose(
    concat('?'),
    last,
    split('?')
  )
);

/**
 * Retrieve the current route by a given path.
 * @func
 * @param {string} pathname
 * @param {array} routes an array of route to filter
 * @returs {object|undefined} a valid route
 **/
const getRouteByPathname: (path: string, routes: Array<AsyncRoute>) => ?AsyncRoute = useWith(find, [
  compose(
    propEq('path'),
    getBasePath
  ),
  identity
]);

/**
 * Generates a random string
 * @func
 * @retuns {string} the generated key
 **/
const createLocationKey = () =>
  Math.random()
    .toString(36)
    .substr(2, 5);

/**
 * Inject querystring into the react-router match object
 * @param {object} context react-router context router
 * @param {object} props component inital props
 * @param {object} req server-side request object
 */
const getPageProps = (
  { match, location, history }: ContextRouter,
  props: InitialProps,
  req: { query: QueryType }
) => ({
  ...props,
  history,
  query: getQueryString(location, req),
  match
});

/**
 * Retrieve the initial props from given component route.
 * @param {object} route react-router-v4 route object
 * @param {object} context object to pass into the getInitialProps
 * @param {function} dispatch a callback function
 */
const fetchInitialProps = async (
  route: AsyncRoute,
  context: Context,
  next: (props: ?InitialProps, error?: Error) => void
) => {
  try {
    const { component } = route;
    if (component && component.getInitialProps) {
      const data = await component.getInitialProps(context);
      next(data);
    }
  } catch (error) {
    next(undefined, error);
  }
};

/**
 * Dispacher function to be use with `useReducer` hook.
 * Manages the state of Before component
 * @param {object} state Current state
 * @param {object} action The dispatched action
 * @return object
 */
const reducer = (state: BeforeState, { location, type }: BeforeAction) => {
  switch (type) {
    case 'update-location':
      return { currentLocation: location };
    default:
      throw new Error('Invalid reducer type');
  }
};

/**
 * React Component that wraps all async router components into a Route react-router
 * inside a Switch.
 * @function
 */
export function Before(props: BeforeComponentWithRouterProps) {
  const { data, routes, location, req, history } = props;
  const [state, dispatch] = useReducer(reducer, {
    currentLocation: location
  });
  const { currentLocation } = state;
  const interrupt = useRef(false);
  const initialProps = useRef({ [currentLocation.pathname]: data });

  const createHistoryMethod = useCallback(
    (name: string) => (obj: string | LocationType, state?: { [key: string]: string }) => {
      const path: string = propOr(obj, 'pathname', obj);
      const route = getRouteByPathname(path, routes);
      if (route) {
        const search = getSearch(obj);
        fetchInitialProps(
          route,
          {
            ...props,
            location: { pathname: route.path, hash: '', search, state },
            query: getQueryString({ search })
          },
          props => {
            if (!interrupt.current) {
              initialProps.current[route.path] = props;
              dispatch({
                type: 'update-location',
                location: {
                  hash: '',
                  key: `before-${createLocationKey()}`,
                  pathname: route.path,
                  search,
                  state
                }
              });
              history[name](obj, state);
            }
          }
        );
      }
    },
    [history, props, routes]
  );

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      interrupt.current = action === 'POP';
      if (!initialProps.current[location.pathname]) {
        // This solves a weird case when, on an advanced step of the flow, the user does a browser back
        const route = getRouteByPathname(location.pathname, routes);
        if (route) {
          fetchInitialProps(
            route,
            { ...props, location, query: getQueryString(location) },
            props => {
              initialProps.current[route.path] = props;
              dispatch({ type: 'update-location', location });
              interrupt.current = false;
            }
          );
        }
      } else {
        dispatch({ type: 'update-location', location });
        interrupt.current = false;
      }
    });
    return unlisten;
    // note(lf): I don't want to re-create this effect each time the react-router history change, which changes on each update to the location.
    // Keeping the history object outside the dependency array, will garauntee that we are always listeners is working a expected.
    // eslint-disable-next-line
  }, []);

  const beforeHistory = useMemo(
    () => ({
      ...history,
      unstable_location: history.location,
      unstable_push: history.push,
      unstable_replace: history.replace,
      push: createHistoryMethod('push'),
      replace: createHistoryMethod('replace'),
      location: currentLocation
    }),
    [history, createHistoryMethod, currentLocation]
  );

  const routeProps = initialProps.current[currentLocation.pathname];
  return (
    <Switch location={currentLocation}>
      {routes.map(({ component: Component, exact, path }, index) => {
        return (
          <Route
            key={index}
            path={path}
            exact={exact}
            render={(context: ContextRouter) => (
              <ShouldRender location={context.location}>
                <Component
                  {...getPageProps({ ...context, history: beforeHistory }, routeProps, req)}
                />
              </ShouldRender>
            )}
          />
        );
      })}
    </Switch>
  );
}

/**
 * Wrapper component that has a `shouldComponentUpdate` logic.
 * Will only allow rendering on a location change and when the initial props were fetched.
 */
const ShouldRender = memo(
  ({ children }: ShouldRenderProps) => children,
  (prevProps: ShouldRenderProps, nextProps: ShouldRenderProps) => {
    return nextProps.location === prevProps.location;
  }
);

export default withRouter(Before);
