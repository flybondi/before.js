// @flow strict
import { parse } from 'query-string';
import { complement } from 'ramda';
import type { QueryType } from 'Before.component';

/**
 * Check if current execution belongs to a server.
 * @func
 * @returns {boolean}
 */
export const isServerSide: () => boolean = () =>
  typeof process !== 'undefined' && process.release && process.release.name === 'node';

/**
 * Check if current execution belongs to a browser.
 * @func
 * @returns {boolean}
 */
export const isClientSide: () => boolean = complement(isServerSide);

/**
 * Retrieve the querystring value from the location object if we are in the client or
 * from the request query if we are in the server.
 * @func
 * @param {Location} location a request location object
 * @param {Request} req a request object
 * @returns {object}
 */
export const getQueryString = (
  { search }: { search: string } = {},
  { query }: { query: QueryType } = {}
) => (isClientSide() ? parse(search) : query);
