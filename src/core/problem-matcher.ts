import { EventEmitter } from 'events';
import * as Path from 'path';

import * as Chalk from 'chalk';

import {
  ProblemMatcherConfig,
  ProblemMatcherPatternConfig,
  ProblemMatcherWatchingConfig,
} from './config';

export interface Problem {
  severity: string;
  file: string;
  location: string;
  code?: string;
  message?: string;
}

export class ProblemMatcher extends EventEmitter {
  pattern: ProblemMatcherPatternConfig;
  watching: ProblemMatcherWatchingConfig;

  pendingOutput = '';

  owner: string;
  regex: RegExp;
  active: boolean;
  beginsRegex: RegExp;
  endsRegex: RegExp;

  problems: Problem[];

  constructor(
    config: ProblemMatcherConfig,
    public cwd: string,
  ) {
    super();

    this.pattern = config.pattern;
    this.watching = config.watching;

    this.owner = config.owner;
    this.regex = new RegExp(config.pattern.regexp);
    this.active = config.watching.activeOnStart;
    this.beginsRegex = new RegExp(config.watching.beginsPattern);
    this.endsRegex = new RegExp(config.watching.endsPattern);

    this.reset();
  }

  reset(): void {
    this.problems = [];
    this.pendingOutput = '';
  }

  match(line: string): void {
    if (this.active) {
      if (this.endsRegex.test(line)) {
        this.active = false;

        this.emit('problems-update');
      }
    } else {
      if (this.beginsRegex.test(line)) {
        this.active = true;
        this.problems = [];
      }
    }

    if (!this.active) {
      return;
    }

    let groups = this.regex.exec(line);

    if (!groups) {
      return;
    }

    this.problems.push({
      severity: this.pattern.severity && groups[this.pattern.severity] || 'error',
      file: Path.resolve(this.cwd, groups[this.pattern.file]!),
      location: groups[this.pattern.location]!,
      code: this.pattern.code ? groups[this.pattern.code] : undefined,
      message: this.pattern.message ? groups[this.pattern.message] : undefined,
    });
  }

  push(chunk: Buffer): void {
    this.pendingOutput += chunk.toString();

    let lineRegex = /(.*)([\r\n\u2028\u2029]?)/g;

    while (true) {
      let groups = lineRegex.exec(this.pendingOutput)!;

      let line = groups[1];
      let lineTerminator = groups[2];

      if (lineTerminator) {
        this.match(Chalk.stripColor(line));
      } else {
        this.pendingOutput = line;
        break;
      }
    }
  }
}
