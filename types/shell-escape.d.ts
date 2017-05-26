declare module 'shell-escape' {
  function escape(args: string[]): string;
  namespace escape { }
  export = escape;
}
