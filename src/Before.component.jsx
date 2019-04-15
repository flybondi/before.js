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
  converge,
  find,
  has,
  head,
  ifElse,
  last,
  nthArg,
  pathOr,
  pipe,
  prop,
  propEq,
  split
} from 'ramda';
import { getQueryString } from './utils';

const getBasePath: (pathname: string) => string = pipe(
  split('?'),
  head
);

const getSearch: (path: string | LocationType) => string = ifElse(
  has('search'),
  prop('search'),
  compose(
    concat('?'),
    pipe(
      split('?'),
      last
    )
  )
);

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
      getBasePath,
      propEq('path')
    ),
    nthArg(1)
  ]
);

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
  dispatch: (props: ?InitialProps) => void
) => {
  try {
    const { component } = route;
    if (component && component.getInitialProps) {
      const data = await component.getInitialProps(context);
      dispatch(data);
    }
  } catch (error) {
    dispatch(null);
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
    case 'update-location':
      return { ...state, currentLocation: location };
    case 'update-props-location':
      return {
        currentLocation: location,
        initialProps: { ...state.initialProps, ...props }
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
  const { data, routes, location, req, history } = props;
  const [state, dispatch] = useReducer(reducer, {
    currentLocation: location,
    initialProps: { [location.pathname]: data }
  });
  const interrupt = useRef(false);
  const { currentLocation, initialProps } = state;

  const createHistoryMethod = useCallback(
    (name: string) => (obj: string | LocationType, state?: { [key: string]: string }) => {
      const path = pathOr(obj, ['pathname'], obj);
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
              dispatch({
                type: 'update-props-location',
                location: {
                  hash: '',
                  key: `before-key-${createLocationKey()}`,
                  pathname: route.path,
                  search,
                  state
                },
                props: { [route.path]: props }
              });
              history[name](path, state);
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
      if (!initialProps[location.pathname]) {
        // This solves a wierd case where landing on an advance step of the flow and the user does a browser back.
        const route = getRouteByPathname(location.pathname, routes);
        if (route) {
          fetchInitialProps(
            route,
            { ...props, location, query: getQueryString(location) },
            props => {
              dispatch({ type: 'update-props-location', location, props: { [route.path]: props } });
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
  }, [initialProps, props, routes]);

  const beforeHistory = useMemo(
    () => ({
      ...history,
      unstable_push: history.push,
      unstable_replace: history.replace,
      push: createHistoryMethod('push'),
      replace: createHistoryMethod('replace')
    }),
    [history, createHistoryMethod]
  );

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
