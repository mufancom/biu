export interface ProblemMatcherPatternConfig {
  regexp: string;
  severity?: number;
  file: number;
  location: number;
  code?: number;
  message?: number;
}

export interface ProblemMatcherWatchingConfig {
  activeOnStart: boolean;
  beginsPattern: string;
  endsPattern: string;
}

export interface ProblemMatcherConfig {
  owner: string;
  pattern: ProblemMatcherPatternConfig;
  watching: ProblemMatcherWatchingConfig;
}

export interface TaskConfig {
  executable: string;
  args?: string[];
  cwd?: string;
  stdout?: boolean;
  stderr?: boolean;
  problemMatcher?: string | ProblemMatcherConfig;
}

export interface Config {
  problemMatchers: Dictionary<ProblemMatcherConfig>;
  tasks: Dictionary<TaskConfig>;
  groups: Dictionary<string[]>;
}
