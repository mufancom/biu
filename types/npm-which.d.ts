declare module 'npm-which' {
  const builder: (dir: string) => {
    sync(name: string): string;
  };

  export = builder;
}
