// @flow strict;

import React, { Component } from 'react';
import { Switch, Route, withRouter, type Location, type ContextRouter } from 'react-router-dom';
import {
  fetchInitialPropsFromRoute,
  getInitialPropsFromComponent
} from './fetchInitialPropsFromRoute';
import { isClientSide } from './utils';

type State = {
  previousLocation: ?Location,
  data: any
};

const throwError = (error: Error) => {
  console.error('There was an error', error);
  throw error;
};

const createRenderRoute = (initialData: any, Component: any) => (props: ContextRouter) => {
  const routeProps = {
    ...initialData,
    history: props.history,
    match: props.match
  };

  return <Component {...routeProps} />;
};

const getDataFromStore = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const setDataIntoStore = (route: any) => (data: any) => {
  if (route && data) {
    const { path } = route;
    const { hostname } = window.location;
    localStorage.setItem(`${hostname}${path || ''}`, JSON.stringify(data));
  }
};

class Before extends Component<any, State> {
  state = {
    previousLocation: this.props.location,
    data: this.props.data
  };
  prefetchInitialPropsFromAllRoutes = async () => {
    const { location, routes } = this.props;
    const routesForpreFetch = routes.filter(r => r.prefetch);
    const promises = routesForpreFetch.map(route =>
      getInitialPropsFromComponent(route.component, route).then(setDataIntoStore(route))
    );

    return Promise.all(promises).catch(throwError);
  };

  constructor(props) {
    super(props);
    isClientSide() && this.prefetchInitialPropsFromAllRoutes();
  }

  componentDidUpdate(prevProps: any) {
    if (isClientSide() && prevProps.location !== this.props.location) {
      const { history, location, routes, ...rest } = this.props;
      const notPrefetchedRoutes = routes.filter(r => !r.prefetch);
      // @ToDo This could be update to use the `getInitialPropsFromComponent` method instead.
      fetchInitialPropsFromRoute(notPrefetchedRoutes, location.pathname, {
        location,
        history,
        ...rest
      })
        .then(({ data }) => {
          this.setState(() => ({
            previousLocation: location,
            data
          }));
        })
        .catch(throwError);
    }
  }

  shouldComponentUpdate(nextProps: any, nextState: State) {
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
