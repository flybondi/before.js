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
    toComponent(): [React$Element<*>] | React$Element<*> | Array<Object>
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

  declare type ExtraTag = {
    name: string,
    tag: string,
    content: string,
    attribs?: {
      [key: string]: string
    }
  };

  declare type DocumentInitialProps = {
    assets: Assets,
    criticalCSS: boolean | string,
    data: DataType,
    renderPage?: (data: { [key: string]: any }) => Promise<any>,
    generateCriticalCSS?: () => string | boolean,
    title: string,
    extractor: ?Extractor,
    helmet: Helmet,
    error: Error,
    errorComponent?: React$ComponentType<ErrorProps>,
    filterServerData?: (data: DataType) => DataType,
    extraHeadTags?: Array<ExtraTag>,
    extraBodyTags?: Array<ExtraTag>,
    [key: string]: any
  };

  declare type DocumentGetInitialProps = {
    criticalCSS: boolean | string,
    assets: Assets,
    data: DataType,
    extractor: Extractor,
    html: string,
    [key: string]: any
  };

  declare type DocumentComponent = {
    getInitialProps(context: Context): Promise<DocumentGetInitialProps>
  } & $Subtype<React$ComponentType<DocumentInitialProps>>;

  declare module.exports: {
    DocumentComponent: DocumentComponent,
    Root: (props: { jsx: ?string }) => React$Element<'div'>,
    Data: (arg: { data: DataType }) => React$Element<'script'>
  };
}
