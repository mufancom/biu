#!/usr/bin/env node

import 'source-map-support/register';
import 'villa/platform/node';

import * as Path from 'path';
import * as Util from 'util';

import { CLI, Shim } from 'clime';

process.on('uncaughtException', (error: any) => {
  process.stderr.write(`${Util.inspect(error)}\n`);
  process.exit(1);
});

let cli = new CLI('biu', Path.join(__dirname, 'commands'));

let shim = new Shim(cli);
shim.execute(process.argv);
