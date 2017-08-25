import * as Path from 'path';

import {
  Castable,
  Command,
  Options,
  command,
  option,
  param,
} from 'clime';

import * as open from 'open';

import { Config } from '../core/config';
import { Server } from '../core/server';

const log = console.log.bind(undefined);

export class BiuOptions extends Options {
  @option({
    flag: 'p',
    description: 'Port to listen, default to `8088`.',
    default: 8088,
  })
  port: number;

  @option({
    flag: 'o',
    description: 'Open browser.',
    toggle: true,
  })
  open: boolean;
}

@command({
  description: 'Biu! Biu! Biu!',
})
export default class extends Command {
  async execute(
    @param({
      description: 'Task configuration file to require, default to `.biu` ' +
        'or read `scripts` section from `package.json`.',
      default: '.biu',
    })
    configFile: Castable.File,

    options: BiuOptions,
  ) {
    let config: Config;
    try {
      config = configFile.require<Config>();
      log('Using', configFile.baseName);
    } catch ( err ) {
      let pkg;
      try {
        pkg = require(Path.resolve(process.cwd(), './package.json'));
        log('Using', 'package.json');
      } catch ( err ) {
        return Promise.reject('Can not find `.biu` or `package.json`');
      }
      config = {
        problemMatchers: undefined,
        tasks: {},
        groups: undefined,
      };
      let hasTask = false;
      if (pkg && typeof pkg.scripts === 'object') {
        Object.keys(pkg.scripts).map( task => {
          config.tasks[task] = {
            executable: 'npm',
            args: ['run', task],
          };
          hasTask = true;
        });
      }
      if (pkg && pkg['biu-groups'] && typeof pkg['biu-groups'] === 'object') {
        config.groups = pkg['biu-groups'];
      }
      if (!hasTask) {
        return Promise.reject('No scripts in package.json');
      }
    }
    let server = new Server(config, Path.dirname(configFile.fullName));

    await server.listen(options.port);

    let url = `http://localhost:${options.port}/`;

    log(`Open ${url} to start tasks.`);

    if (options.open) {
      open(url);
    }
  }
}
