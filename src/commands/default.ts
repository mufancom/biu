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

const log = console.log;

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
      description: 'Task configuration file to require, default to `.biu`.',
      default: '.biu',
    })
    configFile: Castable.File,

    options: BiuOptions,
  ) {
    let config = configFile.require<Config>();
    let server = new Server(config, Path.dirname(configFile.fullName));

    await server.listen(options.port);

    let url = `http://localhost:${options.port}/`;

    log(`Open ${url} to start tasks.`);

    if (options.open) {
      open(url);
    }
  }
}
