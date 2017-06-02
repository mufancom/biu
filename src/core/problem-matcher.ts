import { EventEmitter } from 'events';
import * as Path from 'path';

import * as Chalk from 'chalk';
import { ExpectedError } from 'clime';

import {
  ProblemMatcherConfig,
  ProblemMatcherWatchingConfig,
} from './config';

export interface ProblemMatcherPatternBase {
  severity?: number;
  file: number;
  location: number;
  code?: number;
  message?: number;
  loop?: boolean;
}

export interface ProblemMatcherPattern extends ProblemMatcherPatternBase {
  regex: RegExp;
}

export interface Problem {
  severity?: string;
  file: string;
  location: string;
  code?: string;
  message?: string;
}

export class ProblemMatcher extends EventEmitter {
  patternIndex = 0;
  patterns: ProblemMatcherPattern[];
  watching: ProblemMatcherWatchingConfig;

  pendingOutput = '';

  owner: string;
  active: boolean;
  beginsRegex: RegExp | undefined;
  endsRegex: RegExp | undefined;

  problems: Problem[];

  private problemsUpdateEventTimer: NodeJS.Timer | undefined;
  private loopedPattern: ProblemMatcherPattern | undefined;
  private activeMatch: Partial<Problem>;

  constructor(
    config: ProblemMatcherConfig,
    public cwd: string,
  ) {
    super();

    let patternConfigs = Array.isArray(config.pattern) ? config.pattern : [config.pattern];

    this.patterns = patternConfigs.map(config => {
      return {
        regex: new RegExp(config.regexp),
        ...config,
      };
    });

    let watching = this.watching = config.watching;

    this.owner = config.owner;
    this.active = watching.activeOnStart;

    if (watching.beginsPattern) {
      this.beginsRegex = new RegExp(watching.beginsPattern);
    } else {
      this.active = true;
    }

    if (watching.endsPattern) {
      this.endsRegex = new RegExp(watching.endsPattern);
    }

    this.reset();
  }

  reset(): void {
    this.problems = [];
    this.pendingOutput = '';
  }

  match(line: string): void {
    if (this.beginsRegex && this.endsRegex) {
      if (this.active) {
        if (this.endsRegex.test(line)) {
          this.active = false;
          this.emit('problems-update');
        }
      } else if (this.beginsRegex.test(line)) {
        this.active = true;
        this.problems = [];
      }

      if (!this.active) {
        return;
      }
    } else if (this.beginsRegex) {
      if (this.beginsRegex.test(line)) {
        this.active = true;
        this.problems = [];
        this.scheduleProblemsUpdateEvent();
      }

      if (!this.active) {
        return;
      }
    } else if (this.endsRegex) {
      if (this.endsRegex.test(line)) {
        this.emit('problems-update');
      }
    } else {
      throw new ExpectedError('At least one of "beginsPattern" and "endsPattern" is required');
    }

    let pattern = this.loopedPattern!;
    let groups: RegExpExecArray | undefined | null;

    if (pattern) {
      groups = pattern.regex.exec(line);

      if (!groups) {
        this.loopedPattern = undefined;
        this.patternIndex = 0;
      }
    }

    if (!groups) {
      if (this.patternIndex === 0) {
        this.activeMatch = {};
      }

      pattern = this.patterns[this.patternIndex];
      groups = pattern.regex.exec(line);

      if (!groups && this.patternIndex !== 0) {
        this.patternIndex = 0;
        pattern = this.patterns[this.patternIndex];
        groups = pattern.regex.exec(line);
      }

      if (groups) {
        this.patternIndex++;

        if (this.patternIndex >= this.patterns.length) {
          this.patternIndex = 0;
        }
      }
    }

    if (!groups) {
      return;
    }

    if (this.loopedPattern !== pattern && this.patternIndex === 0 && pattern.loop) {
      this.loopedPattern = pattern;
    }

    let activeMatch = this.activeMatch;

    if (pattern.severity && groups[pattern.severity]) {
      activeMatch.severity = groups[pattern.severity];
    }

    if (pattern.file && groups[pattern.file]) {
      activeMatch.file = Path.resolve(this.cwd, groups[pattern.file]);
    }

    if (pattern.location && groups[pattern.location]) {
      activeMatch.location = groups[pattern.location];
    }

    if (pattern.code && groups[pattern.code]) {
      activeMatch.code = groups[pattern.code];
    }

    if (pattern.message && groups[pattern.message]) {
      activeMatch.message = groups[pattern.message];
    }

    if (this.patternIndex === 0) {
      this.pushProblem(!this.endsRegex);
    }
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

  private pushProblem(schedule: boolean): void {
    this.problems.push({ ...this.activeMatch as Problem });

    if (schedule) {
      this.scheduleProblemsUpdateEvent();
    }
  }

  private scheduleProblemsUpdateEvent(): void {
    clearTimeout(this.problemsUpdateEventTimer!);

    this.problemsUpdateEventTimer = setTimeout(() => {
      this.emit('problems-update');
    }, 200);
  }
}
