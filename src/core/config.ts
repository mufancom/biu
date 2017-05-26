export interface TaskConfig {
  executable: string;
  args?: string[];
  cwd?: string;
  stdout?: boolean;
  stderr?: boolean;
}

export interface Config {
  tasks: Dictionary<TaskConfig>;
  groups: Dictionary<string[]>;
}
