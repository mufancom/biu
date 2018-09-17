import {IDtplConfig, IUserTemplate, Source} from 'dot-template-types';

export default function(source: Source): IDtplConfig {
  const basename = source.filePath.match(/([^\\/]+?)(?:\.\w+){0,2}$/)![1];
  const url = basename.replace(/^@/, '').replace(/\./, '-');

  const localData = {
    htmlClassName: basename.replace(/^@/, ''),
    defaultUrl: url,
  };

  const templates: IUserTemplate[] = [
    {
      name: 'templates/module',
      matches: '*/src/**',
    },
    {
      name: 'templates/react/component.tsx.dtpl',
      matches: 'src/client/components/**/*.tsx',
    },
    {
      name: 'templates/react/component-module',
      matches: 'src/client/components/**',
    },
  ].map(template => {
    return {localData, ...template};
  });

  return {templates};
}
