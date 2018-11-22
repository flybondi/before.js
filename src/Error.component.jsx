// @flow strict
import React from 'react';

// @NOTE(lf): I'll assume that the user is using tachyons for now. When we open source this, we should
// change this implementation to use inline styles (maybe?).

type ErrorProps = {|
  className?: string,
  message: string,
  stack: string
|};

const Error = ({ className = 'w-75 center mt6', message, stack }: ErrorProps) => (
  <article className={className}>
    <span className="tc w-100 db" style={{ fontSize: '120px' }} role="img" aria-label="scream">
      😱
    </span>
    <h1 className="f1 font-p-semibold tc">Whoops!</h1>
    <h2 className="f2 font-p tc">Something went wrong.</h2>
    <section className="f6">
      <p>
        <strong>{message}</strong>
      </p>
      <p>{stack}</p>
    </section>
  </article>
);

export default Error;
