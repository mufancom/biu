import {EventEmitter} from 'events';
import * as Path from 'path';

import {ExpectedError} from 'clime';
import stripColor from 'strip-color';

import {ProblemMatcherBackgroundConfig, ProblemMatcherConfig} from './config';

export interface ProblemMatcherPatternBase {
  severity?: number | string;
  file: number | string;
  location: number | string;
  code?: number | string;
  message?: number | string;
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
  patternIndex!: number;
  pendingOutput!: string;
  active!: boolean;
  problems!: Problem[];

  patterns: ProblemMatcherPattern[];
  background: ProblemMatcherBackgroundConfig | undefined;

  owner: string;
  beginsRegex: RegExp | undefined;
  endsRegex: RegExp | undefined;

  private problemsUpdateEventTimer: NodeJS.Timer | undefined;
  private loopedPattern: ProblemMatcherPattern | undefined;
  private activeMatch!: Partial<Problem>;

  constructor(config: ProblemMatcherConfig, public cwd: string) {
    super();

    let patternConfigs = Array.isArray(config.pattern)
      ? config.pattern
      : [config.pattern];

    this.patterns = patternConfigs.map(config => {
      return {
        regex: new RegExp(config.regexp),
        ...config,
      };
    });

    this.owner = config.owner;

    let background = (this.background = config.background);

    if (background) {
      if (background.beginsPattern) {
        this.beginsRegex = new RegExp(background.beginsPattern);
      }

      if (background.endsPattern) {
        this.endsRegex = new RegExp(background.endsPattern);
      }
    }

    this.reset();
  }

  reset(): void {
    clearTimeout(this.problemsUpdateEventTimer!);

    this.problems = [];
    this.pendingOutput = '';
    this.patternIndex = 0;

    let background = this.background;
    this.active =
      !background || !background.beginsPattern || background.activeOnStart;
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
    } else if (this.background) {
      throw new ExpectedError(
        'At least one of "beginsPattern" and "endsPattern" is required',
      );
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

    if (
      this.loopedPattern !== pattern &&
      this.patternIndex === 0 &&
      pattern.loop
    ) {
      this.loopedPattern = pattern;
    }

    let activeMatch = this.activeMatch;

    let severity = resolveCapture(groups, pattern.severity);

    if (severity !== undefined) {
      activeMatch.severity = severity;
    }

    let file = resolveCapture(groups, pattern.file);

    if (file !== undefined) {
      activeMatch.file = Path.resolve(this.cwd, file);
    }

    let location = resolveCapture(groups, pattern.location);

    if (location !== undefined) {
      activeMatch.location = location;
    }

    let code = resolveCapture(groups, pattern.code);

    if (code !== undefined) {
      activeMatch.code = code;
    }

    let message = resolveCapture(groups, pattern.message);

    if (message !== undefined) {
      activeMatch.message = message;
    }

    if (this.patternIndex === 0) {
      this.pushProblem(!!this.background && !this.endsRegex);
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
        this.match(stripColor(line));
      } else {
        this.pendingOutput = line;
        break;
      }
    }
  }

  private pushProblem(schedule: boolean): void {
    this.problems.push({...(this.activeMatch as Problem)});

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

function resolveCapture(
  groups: RegExpExecArray,
  index: number | string | undefined,
): string | undefined {
  if (index === undefined) {
    return undefined;
  }

  if (typeof index === 'number') {
    return groups[index];
  }

  return index.replace(/\$(&|\d+)/g, (text, indexStr: string) => {
    let str = groups[indexStr === '&' ? 0 : Number(indexStr)] as
      | string
      | undefined;
    return typeof str === 'string' ? str : text;
  });
}
