// @flow strict
import type { ErrorProps } from 'Error.component';
import React from 'react';

// @NOTE(lf): I'll assume that the user is using tachyons for now. When we open source this, we should
// change this implementation to use inline styles (maybe?).

/**
 * Creates a new react Error component.
 * @param {object} Props component props
 * @returns {React$Element<'article'>}
 */
export const Error = ({ message, stack }: ErrorProps) => (
  <article style={{ width: '75%', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
    <span
      style={{ fontSize: '120px', display: 'block', width: '100%' }}
      role="img"
      aria-label="scream"
    >
      😱
    </span>
    <h1>Whoops!</h1>
    <h2>Something went wrong.</h2>
    <section style={{ fontSize: '.75rem' }}>
      <p>
        <strong>{message}</strong>
      </p>
      <p>{stack}</p>
    </section>
  </article>
);
