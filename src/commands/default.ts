import * as Path from 'path';

import {
  Castable,
  Command,
  Context,
  ExpectedError,
  Options,
  command,
  option,
  param,
} from 'clime';

import * as open from 'open';

import { Config, readConfigFromPackageFile } from '../core/config';
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
      description: 'Task configuration file to require, default to `.biu`.',
      default: '.biu',
    })
    configFile: Castable.File,

    options: BiuOptions,

    {cwd}: Context,
  ) {
    let config: Config;

    let configFilePath = await configFile.exists(['', '.js', '.json']);

    if (configFilePath) {
      config = configFile.require<Config>();
    } else if (configFile.default) {
      config = readConfigFromPackageFile(cwd);
      log('Configuration loaded from "package.json".');
    } else {
      throw new ExpectedError(`Config file "${configFile.source}" (.js, .json) does not exist`);
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
