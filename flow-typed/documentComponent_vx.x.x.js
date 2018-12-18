declare module 'Document.component' {
  import type { Extractor } from '@loadable/server';

  declare type Assets = {
    client: {
      css: string,
      js: string
    }
  };

  declare type DataType = {
    [key: string]: any
  };

  declare type Page = {
    html: string,
    [key: string]: any
  };

  declare type Context = {
    assets: Assets,
    data: ?DataType,
    renderPage(data: ?DataType): Promise<Page>,
    generateCriticalCSS(): string | boolean,
    title: string,
    extractor: ?Extractor,
    [key: string]: any
  };

  declare type TagMethods = {
    toString(): string,
    toComponent(): Array<React$Element<any>> | React$Element<any> | Array<Object>
  };

  declare type AttributeTagMethods = {
    toString(): string,
    toComponent(): { [key: string]: any }
  };

  declare type Helmet = {
    base: TagMethods,
    bodyAttributes: AttributeTagMethods,
    htmlAttributes: AttributeTagMethods,
    link: TagMethods,
    meta: TagMethods,
    noscript: TagMethods,
    script: TagMethods,
    style: TagMethods,
    title: TagMethods
  };

  declare type ErrorProps = {
    error: Error
  };

  declare type DocumentInitialProps = {
    assets: Assets,
    criticalCSS: boolean | string,
    data: DataType,
    renderPage: (data: { [key: string]: any }) => Promise<any>,
    generateCriticalCSS: () => string | boolean,
    title: string,
    extractor: Extractor,
    helmet: Helmet,
    error: Error,
    errorComponent: React$ComponentType<ErrorProps>,
    filterServerData: (data: DataType) => DataType,
    html: string,
    [key: string]: any
  };

  declare type DocumentComponent = {
    getInitialProps(context: Context): Promise<DocumentInitialProps>
  } & $Subtype<React$ComponentType<DocumentInitialProps>>;

  declare module.exports: {
    DocumentComponent: DocumentComponent,
    Root: (props: { jsx: ?string }) => React$Element<'div'>,
    Data: (arg: { data: DataType }) => React$Element<'script'>
  };
}
