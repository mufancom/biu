import {ProblemMatcherConfig} from '../core/config';
import {tscWatch} from './tsc-watch';

export const builtInProblemMatcherDict: Dictionary<ProblemMatcherConfig> = {
  '$tsc-watch': tscWatch,
};
