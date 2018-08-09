import {ProblemMatcherConfig} from '../core/config';

export const tscWatch: ProblemMatcherConfig = {
  owner: 'typescript',
  pattern: {
    regexp:
      '^([^\\s].*)[\\(:](\\d+[,:]\\d+)(?:\\):\\s+|\\s+-\\s+)(error|warning|info)\\s+(TS\\d+)\\s*:\\s*(.*)$',
    file: 1,
    location: 2,
    severity: 3,
    code: 4,
    message: 5,
  },
  background: {
    activeOnStart: true,
    beginsPattern:
      '^\\s*(?:message TS6032:|\\[?\\d{1,2}:\\d{1,2}:\\d{1,2}(?: AM| PM| a\\.m\\.| p\\.m\\.)?(?:\\]| -)) File change detected\\. Starting incremental compilation\\.\\.\\.',
    endsPattern:
      '^\\s*(?:message TS6042:|\\[?\\d{1,2}:\\d{1,2}:\\d{1,2}(?: AM| PM| a\\.m\\.| p\\.m\\.)?(?:\\]| -)) (?:Compilation complete\\.|Found \\d+ errors?\\.) Watching for file changes\\.',
  },
};
