import {EventEmitter} from 'events';
import {Server as HttpServer, createServer} from 'http';
import * as Path from 'path';

import AnsiConverter from 'ansi-to-html';
import express from 'express';
import socketIO from 'socket.io';
import * as v from 'villa';

import {builtInProblemMatcherDict} from '../problem-matchers';

import {Config, ProblemMatcherConfig} from './config';
import {Task, TaskExitEventData, TaskProblemsUpdateEventData} from './task';

export interface TaskCreationCommand {
  names: string[];
  closeAll: boolean;
}

export interface TaskOperationCommand {
  id: string;
}

interface TaskInfo {
  converter: AnsiConverter;
  lastData: string;
}

interface TaskInfoDict {
  stdout: TaskInfo;
  stderr: TaskInfo;
}

export class Server extends EventEmitter {
  server: HttpServer;
  app: express.Express;
  io: SocketIO.Server;
  room: SocketIO.Namespace;

  lastTaskId = 0;
  taskMap = new Map<string, Task>();
  taskInfoDictMap = new Map<string, TaskInfoDict>();

  constructor(public config: Config, public configDir: string) {
    super();

    this.app = express();
    this.server = createServer(this.app);
    this.io = socketIO(this.server);
    this.room = this.io.in('biu');

    this.setup();
  }

  async listen(port: number): Promise<void> {
    await v.call<void>(this.server.listen.bind(this.server), port);
  }

  async create(taskNames: string[], closeAll: boolean): Promise<void> {
    if (closeAll) {
      await this.closeAll();
    }

    let problemMatcherDict: Dictionary<ProblemMatcherConfig> = {
      ...builtInProblemMatcherDict,
      ...this.config.problemMatchers,
    };

    for (let name of taskNames) {
      let id = (++this.lastTaskId).toString();

      let options = this.config.tasks[name];

      let problemMatcherConfig =
        typeof options.problemMatcher === 'string'
          ? problemMatcherDict[options.problemMatcher]
          : options.problemMatcher;

      let task = new Task(name, options.executable, options.args || [], {
        cwd: options.cwd
          ? Path.resolve(this.configDir, options.cwd)
          : process.cwd(),
        env: options.env,
        stdout: !!options.stdout,
        stderr: !!options.stderr,
        problemMatcher: problemMatcherConfig,
        watch: options.watch,
        autoClose: !!options.autoClose,
      });

      this.taskInfoDictMap.set(id, {
        stdout: {
          converter: new AnsiConverter({stream: true}),
          lastData: '',
        },
        stderr: {
          converter: new AnsiConverter({stream: true}),
          lastData: '',
        },
      });

      this.room.emit('create', {
        id,
        name,
        line: task.line,
      });

      this.initializeTask(id, task);

      task.start();

      this.taskMap.set(id, task);
    }
  }

  async startAll(): Promise<void> {
    await v.parallel(Array.from(this.taskMap), ([id]) => this.start(id));
  }

  async restartAll(): Promise<void> {
    await v.parallel(Array.from(this.taskMap), ([id]) => this.restart(id));
  }

  async stopAll(): Promise<void> {
    await v.parallel(Array.from(this.taskMap), ([id]) => this.stop(id));
  }

  async closeAll(): Promise<void> {
    await v.parallel(Array.from(this.taskMap), ([id]) => this.close(id));
  }

  async start(id: string): Promise<void> {
    let task = this.taskMap.get(id);

    if (!task) {
      return;
    }

    task.start();
  }

  async stop(id: string): Promise<void> {
    let task = this.taskMap.get(id);

    if (!task) {
      return;
    }

    task.stop();
  }

  async restart(id: string): Promise<void> {
    let task = this.taskMap.get(id);

    if (!task) {
      return;
    }

    await task.restart();
  }

  async close(id: string): Promise<void> {
    let task = this.taskMap.get(id);

    if (!task) {
      return;
    }

    await task.stopWait();

    this.taskMap.delete(id);

    this.room.emit('close', {id});
  }

  private setup(): void {
    this.app.use(express.static(Path.join(__dirname, '../../static')));
    this.io.on('connection', socket => this.initializeConnection(socket));
  }

  private outputProblems(owner: string): void {
    let lineSet = new Set<string>();

    for (let [, {problemMatcherMap}] of this.taskMap) {
      let problemMatcher = problemMatcherMap && problemMatcherMap.get(owner);

      if (!problemMatcher) {
        continue;
      }

      for (let problem of problemMatcher.problems) {
        lineSet.add(
          [
            problem.severity,
            problem.file,
            problem.location,
            problem.code,
            problem.message,
          ].join(';'),
        );
      }
    }

    process.stdout.write(`[biu-problems:${owner}:begin]\n`);

    for (let line of lineSet) {
      process.stdout.write(`[biu-problem:${owner}:${line}]\n`);
    }

    process.stdout.write(`[biu-problems:${owner}:end]\n`);
  }

  private initializeTask(id: string, task: Task): void {
    task.on('start', () => this.room.emit('start', {id}));
    task.on('stop', () => this.room.emit('stop', {id}));
    task.on('restarting-on-change', () =>
      this.room.emit('restarting-on-change', {id}),
    );

    task.on('error', (error: any) => {
      error =
        error instanceof Error ? error.stack || error.message : `${error}`;

      this.room.emit('error', {
        id,
        error: encodeOutput(error),
      });
    });

    task.on('exit', async (data: TaskExitEventData) => {
      this.room.emit('exit', {id, code: data.code});

      if (data.close) {
        await this.close(id);
      }
    });

    task.on('stdout', (data: Buffer) => {
      this.onStdData(id, 'stdout', data);
    });

    task.on('stderr', (data: Buffer) => {
      this.onStdData(id, 'stderr', data);
    });

    task.on('problems-update', (data: TaskProblemsUpdateEventData) => {
      this.outputProblems(data.owner);
    });
  }

  private onStdData(id: string, event: keyof TaskInfoDict, data: Buffer): void {
    let html = '';
    let taskInfo = this.taskInfoDictMap.get(id)![event];

    let lines = data.toString().split('\n');
    let dataCompleted = lines[lines.length - 1] === '';

    lines[0] = taskInfo.lastData + lines[0];

    taskInfo.lastData = lines[lines.length - 1];

    if (dataCompleted) {
      lines = lines.slice(0, lines.length - 1);
    }

    for (let [index, line] of lines.entries()) {
      if (index === lines.length - 1 && !dataCompleted) {
        html += `<div data-type='${event}' data-uncompleted="true">${taskInfo.converter.toHtml(
          line,
        )}</div>`;
      } else {
        html += `<div data-type='${event}'>${taskInfo.converter.toHtml(
          line,
        )}</div>`;
      }
    }

    this.room.emit(event, {
      id,
      html,
    });
  }

  private initializeConnection(socket: SocketIO.Socket): void {
    socket.join('biu');

    socket.on('create', async (data: TaskCreationCommand) => {
      await this.create(data.names, data.closeAll);
    });

    socket.on('close', async (data: TaskOperationCommand) => {
      await this.close(data.id);
    });

    socket.on('restart', async (data: TaskOperationCommand) => {
      await this.restart(data.id);
    });

    socket.on('start', async (data: TaskOperationCommand) => {
      await this.start(data.id);
    });

    socket.on('stop', async (data: TaskOperationCommand) => {
      await this.stop(data.id);
    });

    socket.on('start-all', async () => {
      await this.startAll();
    });

    socket.on('stop-all', async () => {
      await this.stopAll();
    });

    socket.on('restart-all', async () => {
      await this.restartAll();
    });

    socket.on('close-all', async () => {
      await this.closeAll();
    });

    socket.emit('initialize', {
      taskNames: Object.keys(this.config.tasks),
      taskGroups: this.config.groups,
      createdTasks: Array.from(this.taskMap).map(([id, task]) => {
        return {
          id,
          name: task.name,
          line: task.line,
          running: task.running,
        };
      }),
    });
  }
}

function encodeOutput(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
