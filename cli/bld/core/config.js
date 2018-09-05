"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const FS = tslib_1.__importStar(require("fs"));
const Path = tslib_1.__importStar(require("path"));
const clime_1 = require("clime");
function readConfigFromPackageFile(cwd = process.cwd()) {
    let packageData;
    let useYarn = FS.existsSync(Path.join(cwd, 'yarn.lock'));
    let executable = useYarn ? 'yarn' : 'npm';
    try {
        packageData = require(Path.join(cwd, 'package.json'));
    }
    catch (error) {
        throw new clime_1.ExpectedError('Error requiring "package.json"');
    }
    let scriptDict = packageData.scripts;
    if (!scriptDict) {
        throw new clime_1.ExpectedError('No `scripts` defined in "package.json"');
    }
    let taskDict = {};
    for (let name of Object.keys(scriptDict)) {
        taskDict[name] = {
            executable,
            args: ['run', name],
        };
    }
    let groupDict = (packageData.biu && packageData.biu.groups) ||
        packageData.biuGroups ||
        packageData['biu-groups'];
    return {
        tasks: taskDict,
        groups: groupDict,
        problemMatchers: undefined,
    };
}
exports.readConfigFromPackageFile = readConfigFromPackageFile;
//# sourceMappingURL=config.js.map