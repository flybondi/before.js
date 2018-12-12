declare module 'Document.component' {
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

  declare type Extractor = {
    getStyleTags(): Array<React$Element<'link'>>,
    getStyleElements(): Array<React$Element<'link'>>,
    getLinkElements(): Array<React$Element<'link'>>
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

  declare class DocumentComponent extends React$PureComponent<DocumentInitialProps> {
    static getInitialProps(context: Context): Promise<DocumentInitialProps>;
    render(): React$Element<'html'>;
  }

  declare module.exports: {
    DocumentComponent: typeof DocumentComponent,
    Root: () => React$Element<'div'>,
    Data: (arg: { data: DataType }) => React$Element<'script'>
  };
}
