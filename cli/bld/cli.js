#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Path = tslib_1.__importStar(require("path"));
const Util = tslib_1.__importStar(require("util"));
require("source-map-support/register");
require("villa/platform/node");
const clime_1 = require("clime");
process.on('uncaughtException', exitWithError);
process.on('unhandledRejection', exitWithError);
let cli = new clime_1.CLI('biu', Path.join(__dirname, 'commands'));
let shim = new clime_1.Shim(cli);
shim.execute(process.argv).catch(exitWithError);
function exitWithError(error) {
    process.stderr.write(`${Util.inspect(error)}\n`);
    process.exit(1);
}
//# sourceMappingURL=cli.js.map