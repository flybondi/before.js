// flow-typed signature: 356b4a542fa64b3738983d98d83080dc
// flow-typed version: <<STUB>>/@loadable/server_v^5.2.0/flow_v0.87.0

declare module '@loadable/server' {
  declare type ChunkOptions = {
    statsFile: string
  };

  declare class ChunkClass {
    constructor(options: ChunkOptions): void;
    getStyleTags(): Array<React$Element<'link'>>;
    getStyleElements(): Array<React$Element<'link'>>;
    getLinkElements(): Array<React$Element<'link'>>;
  }

  declare module.exports: {
    ChunkExtractor: typeof ChunkClass
  };
}