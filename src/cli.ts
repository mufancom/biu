#!/usr/bin/env node

import 'source-map-support/register';
import 'villa/platform/node';

import * as Path from 'path';

import { CLI, Shim } from 'clime';

let cli = new CLI('biu', Path.join(__dirname, 'commands'));

let shim = new Shim(cli);
shim.execute(process.argv);
