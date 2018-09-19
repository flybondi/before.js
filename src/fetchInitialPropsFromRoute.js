// @flow strict;
import type { BeforeRoute } from './Before.component';
import { matchPath, type Match } from 'react-router-dom';
import { complement, has, find, isNil } from 'ramda';

declare class BeforeComponent<TProps, TState> extends React$Component<TProps, TState> {
  default?: BeforeComponent<TProps, TState>;
  getInitialProps: (data: any) => Promise<any | Error>;
  load: () => Promise<BeforeComponent<TProps, TState>>;
}

export type InitialProps = {
  [key: string]: any,
  assets?: {
    client: {
      css: ?string
    }
  },
  match: ?BeforeRoute<any, any>,
  data?: Promise<any>
};

type ContextType = {
  [key: string]: any,
  req?: any,
  res?: any
};

type Route = {
  ...Match,
  ...BeforeRoute<any, any>
};

const isNotNil: (x: any) => boolean = complement(isNil);
const checkMatchPath = (pathname: string) => (route: BeforeRoute<any, any>) =>
  isNotNil(matchPath(pathname, route));
const findRouteByPathname = (pathname: string) => find(checkMatchPath(pathname));

const throwError = (error: Error) => {
  console.error('There was an error while trying to retrieve the initial props', error);
  throw error;
};

const hasGetInitialProps = has('getInitialProps');
const hasLoad = has('load');

export const getInitialPropsFromComponent = async (
  component: BeforeComponent<any, any>,
  match: ?Match,
  context?: ContextType
) => {
  if (match && hasGetInitialProps(component)) {
    try {
      if (hasLoad(component)) {
        await component.load();
      }
      return await component.getInitialProps({
        // Note: context contains the old `match` too, so it's important to overwrite that with the new `match`
        ...context,
        match
      });
    } catch (error) {
      throwError(error);
    }
  }
  return null;
};

export async function fetchInitialPropsFromRoute(
  routes: Array<BeforeRoute<any, any>>,
  pathname: string = '',
  context?: ContextType
): Promise<{
  route: ?Route,
  data: ?any
}> {
  const route = findRouteByPathname(pathname)(routes);
  if (route) {
    const match = matchPath(pathname, route);
    const { component } = route;
    return {
      route: {
        ...match,
        ...route
      },
      // $FlowFixMe
      data: await getInitialPropsFromComponent(component, match, context)
    };
  }

  return {
    route: null,
    data: null
  };
}
