declare module 'Error.component' {
  declare type ErrorProps = {|
    className?: string,
    message: string,
    stack: string
  |};

  declare module.exports: {
    Error: ErrorProps => React$Element<'article'>
  };
}
