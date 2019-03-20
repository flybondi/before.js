// @flow strict
import type {
  AsyncRoute,
  BeforeAction,
  BeforeComponentWithRouterProps,
  BeforeState,
  Context,
  InitialProps,
  QueryType,
  ShouldRenderProps
} from 'Before.component';
import React, { useReducer, useEffect, memo } from 'react';
import { withRouter, Switch, Route, type ContextRouter } from 'react-router-dom';
import { converge, find, nthArg, pipe, propEq } from 'ramda';
import { isClientSide, getQueryString } from './utils';

/**
 * Retrieve the current route by a given path.
 * @func
 * @param {string} pathname
 * @param {array} routes an array of route to filter
 * @returs {object|undefined} a valid route
 **/
const getRouteByPathname: (path: string, routes: Array<AsyncRoute>) => ?AsyncRoute = converge(
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
 * @param {function} dispatch a useReducer dispatch function
 */
const fetchInitialProps = async (route: ?AsyncRoute, context: Context, dispatch) => {
  const { location } = context;
  const { pathname } = location;
  try {
    if (route) {
      const { component } = route;
      if (component && component.getInitialProps) {
        const data = await component.getInitialProps(context);
        dispatch({ type: 'end', location, props: { [pathname]: data } });
      }
    }
  } catch (error) {
    dispatch({ type: 'end', location, props: { [pathname]: null } });
  }
};

/**
 * Dispacher function to be use with `useReducer` hook.
 * Manages the state of Before component
 * @param {object} state Current state
 * @param {object} action The dispatched action
 * @return object
 */
const reducer = (state: BeforeState, { location, props, type }: BeforeAction) => {
  switch (type) {
    case 'start':
      return { ...state, isFetching: true, nextLocation: location };
    case 'end':
      const { initialProps } = state;
      return {
        isFetching: false,
        initialProps: { ...initialProps, ...props },
        currentLocation: location,
        nextLocation: null
      };
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
  const { data, routes, location, req } = props;
  const { pathname, key } = location;
  const [state, dispatch] = useReducer(reducer, {
    currentLocation: location,
    isFetching: false,
    nextLocation: null,
    initialProps: { [pathname]: data }
  });
  const { isFetching, nextLocation, initialProps, currentLocation } = state;

  useEffect(() => {
    isClientSide() && dispatch({ type: 'start', location });
  }, [key, location]);

  useEffect(() => {
    if (isFetching && nextLocation) {
      const route = getRouteByPathname(nextLocation.pathname, routes);
      fetchInitialProps(
        route,
        { ...props, location: nextLocation, query: getQueryString(nextLocation, req) },
        dispatch
      );
    }
  }, [isFetching, nextLocation, props, req, routes]);

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
              <ShouldRender isFetching={isFetching} location={context.location}>
                <Component {...getPageProps(context, routeProps, req)} />
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
    return nextProps.isFetching || nextProps.location === prevProps.location;
  }
);

export default withRouter(Before);
