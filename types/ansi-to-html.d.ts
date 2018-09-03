declare module 'ansi-to-html' {
  interface AnsiConverterOpts {
    fg?: string;
    bg?: string;
    newline?: boolean;
    escapeXML?: boolean;
    stream?: boolean;
    colors?: {[key: string]: string} | string[];
  }
  class AnsiConverter {
    constructor(opts?: AnsiConverterOpts);
    toHtml(ansi: string): string;
  }

  namespace AnsiConverter {

  }

  export = AnsiConverter;
}
