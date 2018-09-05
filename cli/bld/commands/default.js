"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Path = tslib_1.__importStar(require("path"));
const clime_1 = require("clime");
const open_1 = tslib_1.__importDefault(require("open"));
const config_1 = require("../core/config");
const server_1 = require("../core/server");
class BiuOptions extends clime_1.Options {
}
tslib_1.__decorate([
    clime_1.option({
        flag: 'p',
        description: 'Port to listen, defaults to `8088`.',
        default: 8088,
    }),
    tslib_1.__metadata("design:type", Number)
], BiuOptions.prototype, "port", void 0);
tslib_1.__decorate([
    clime_1.option({
        flag: 'o',
        description: 'Open browser.',
        toggle: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], BiuOptions.prototype, "open", void 0);
exports.BiuOptions = BiuOptions;
let default_1 = class default_1 extends clime_1.Command {
    async execute(configFile, options, context) {
        let config;
        let configFilePath = await configFile.exists(['', '.js', '.json']);
        if (configFilePath) {
            config = configFile.require();
        }
        else if (configFile.default) {
            config = config_1.readConfigFromPackageFile(context.cwd);
            console.info('Configuration loaded from "package.json".');
        }
        else {
            throw new clime_1.ExpectedError(`Config file "${configFile.source}" (.js, .json) does not exist`);
        }
        let server = new server_1.Server(config, Path.dirname(configFile.fullName));
        await server.listen(options.port);
        let url = `http://localhost:${options.port}/`;
        console.info(`Open ${url} to start tasks.`);
        if (options.open) {
            open_1.default(url);
        }
    }
};
tslib_1.__decorate([
    tslib_1.__param(0, clime_1.param({
        description: 'Task configuration file to require, defaults to `.biu`.',
        default: '.biu',
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [clime_1.Castable.File, BiuOptions,
        clime_1.Context]),
    tslib_1.__metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = tslib_1.__decorate([
    clime_1.command({
        description: 'Biu! Biu! Biu!',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=default.js.map