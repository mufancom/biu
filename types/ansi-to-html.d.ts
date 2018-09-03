declare module 'ansi-to-html' {
  interface AnsiConverterOptions {
    fg?: string;
    bg?: string;
    newline?: boolean;
    escapeXML?: boolean;
    stream?: boolean;
    colors?: {[key: string]: string} | string[];
  }

  class AnsiConverter {
    constructor(options?: AnsiConverterOptions);
    toHtml(ansi: string): string;
  }

  namespace AnsiConverter {

  }

  export = AnsiConverter;
}
