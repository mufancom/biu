import {
  Castable,
  Command,
  Options,
  command,
  option,
  param,
} from 'clime';

import { Config } from '../core/config';
import { Server } from '../core/server';

export class BiuOptions extends Options {
  @option({
    description: 'Port to listen, default to `8088`.',
    default: 8088,
  })
  port: number;
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
    let server = new Server(config);

    server.listen(options.port);
  }
}
