import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';

import * as Chokidar from 'chokidar';
import * as whichBuilder from 'npm-which';
import * as shellEscape from 'shell-escape';
import * as v from 'villa';

import { ProblemMatcherConfig } from './config';
import { ProblemMatcher } from './problem-matcher';

// tslint:disable-next-line:no-unbound-method
const which = whichBuilder(process.cwd()).sync;

export interface TaskExitEventData {
  code: number;
  close: boolean;
}

export interface TaskProblemsUpdateEventData {
  owner: string;
}

export interface TaskOptions {
  cwd: string;
  stdout: boolean;
  stderr: boolean;
  problemMatcher: ProblemMatcherConfig | ProblemMatcherConfig[] | undefined;
  watch: string | string[] | undefined;
  closeOnExit: boolean;
}

export class Task extends EventEmitter {
  path: string;
  running = false;
  problemMatcherMap: Map<string, ProblemMatcher> | undefined;

  private process: ChildProcess | undefined;
  private restartScheduleTimer: NodeJS.Timer | undefined;

  constructor(
    public name: string,
    public executable: string,
    public args: string[],
    public options: TaskOptions,
  ) {
    super();

    try {
      this.path = which(executable);
    } catch (error) {
      this.path = executable;
    }

    if (options.problemMatcher) {
      let configs = Array.isArray(options.problemMatcher) ? options.problemMatcher : [options.problemMatcher];

      this.problemMatcherMap = new Map(
        configs.map<[string, ProblemMatcher]>(config => {
          let matcher = new ProblemMatcher(config, options.cwd);
          let owner = matcher.owner;

          matcher.on('problems-update', () => this.emit('problems-update', { owner }));

          return [owner, matcher];
        }),
      );
    }

    if (options.watch) {
      let watcher = Chokidar
        .watch(options.watch, {
          cwd: options.cwd,
        })
        .on('ready', () => {
          watcher.on('all', () => this.scheduleRestart());
        });
    }
  }

  get line(): string {
    return shellEscape([this.executable, ...this.args]);
  }

  start(): boolean {
    if (this.running) {
      return false;
    }

    if (this.problemMatcherMap) {
      for (let [_, matcher] of this.problemMatcherMap) {
        matcher.reset();
      }
    }

    this.emit('start');
    this.running = true;

    try {
      this.process = spawn(this.path, this.args, {
        cwd: this.options.cwd,
      });
    } catch (error) {
      this.handleStop(error);
      return true;
    }

    this.process.once('error', error => this.handleStop(error));
    this.process.once('exit', code => this.handleStop(undefined, code));

    this.process.stdout.on('data', (data: Buffer) => {
      let map = this.problemMatcherMap;

      if (map) {
        for (let [_, matcher] of map) {
          matcher.push(data);
        }
      }

      this.emit('stdout', data);
    });

    this.process.stderr.on('data', (data: Buffer) => {
      let map = this.problemMatcherMap;

      if (map) {
        for (let [_, matcher] of map) {
          matcher.push(data);
        }
      }

      this.emit('stderr', data);
    });

    if (this.options.stdout) {
      this.process.stdout.pipe(process.stdout);
    }

    if (this.options.stderr) {
      this.process.stderr.pipe(process.stderr);
    }

    return true;
  }

  stop(): boolean {
    if (!this.running) {
      return false;
    }

    if (process.platform === 'win32') {
      spawn('taskkill', ['/f', '/t', '/pid', this.process!.pid.toString()]);
    } else {
      this.process!.kill();
    }

    return true;
  }

  async stopWait(): Promise<void> {
    if (this.stop()) {
      await v.awaitable(this, 'stop');
    }
  }

  async restart(): Promise<void> {
    await this.stopWait();
    this.start();
  }

  private handleStop(error: any, code?: number): void {
    if (this.problemMatcherMap) {
      for (let [_, matcher] of this.problemMatcherMap) {
        if (!matcher.watching) {
          this.emit('problems-update', { owner: matcher.owner });
        }
      }
    }

    if (error) {
      this.emit('error', error);
    } else {
      this.emit('exit', { code, close: this.options.closeOnExit });
    }

    if (this.running) {
      this.emit('stop');
      this.running = false;
    }
  }

  private scheduleRestart(): void {
    clearTimeout(this.restartScheduleTimer!);

    this.restartScheduleTimer = setTimeout(async () => {
      if (this.running) {
        this.emit('restarting-on-change');
        await this.restart();
      }
    }, 1000);
  }
}
