import * as FS from 'fs';
import * as Path from 'path';

import {ExpectedError} from 'clime';

import {ProblemMatcherPatternBase} from './problem-matcher';

export interface ProblemMatcherPatternConfig extends ProblemMatcherPatternBase {
  regexp: string;
}

export interface ProblemMatcherBackgroundConfig {
  activeOnStart: boolean;
  beginsPattern: string;
  endsPattern: string;
}

export interface ProblemMatcherConfig {
  owner: string;
  pattern: ProblemMatcherPatternConfig | ProblemMatcherPatternConfig[];
  background?: ProblemMatcherBackgroundConfig;
}

export interface TaskConfig {
  executable: string;
  args?: string[];
  cwd?: string;
  stdout?: boolean;
  stderr?: boolean;
  watch?: string | string[];
  problemMatcher?: string | ProblemMatcherConfig;
  autoClose?: boolean;
}

export interface Config {
  tasks: Dictionary<TaskConfig>;
  groups: Dictionary<string[]> | undefined;
  problemMatchers: Dictionary<ProblemMatcherConfig> | undefined;
}

interface PackageData {
  scripts: Dictionary<string>;
  biu?: {
    groups?: Dictionary<string[]>;
  };
  biuGroups?: Dictionary<string[]>;
  'biu-groups'?: Dictionary<string[]>;
}

export function readConfigFromPackageFile(cwd = process.cwd()): Config {
  let packageData: PackageData;
  let useYarn = FS.existsSync(Path.join(cwd, 'yarn.lock'));

  let executable = useYarn ? 'yarn' : 'npm';

  try {
    packageData = require(Path.join(cwd, 'package.json'));
  } catch (error) {
    throw new ExpectedError('Error requiring "package.json"');
  }

  let scriptDict = packageData.scripts;

  if (!scriptDict) {
    throw new ExpectedError('No `scripts` defined in "package.json"');
  }

  let taskDict: Dictionary<TaskConfig> = {};

  for (let name of Object.keys(scriptDict)) {
    taskDict[name] = {
      executable,
      args: ['run', name],
    };
  }

  let groupDict =
    (packageData.biu && packageData.biu.groups) ||
    packageData.biuGroups ||
    packageData['biu-groups'];

  return {
    tasks: taskDict,
    groups: groupDict,
    problemMatchers: undefined,
  };
}
