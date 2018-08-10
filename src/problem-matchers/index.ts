import {ProblemMatcherConfig} from '../core/config';

import {tscWatch, tslint} from './typescript';

export const builtInProblemMatcherDict: Dictionary<ProblemMatcherConfig> = {
  '$typescript:tsc-watch': tscWatch,
  '$typescript:tslint': tslint,
};
