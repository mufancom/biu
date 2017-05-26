import {
  Server as HttpServer,
  createServer,
} from 'http';

import { EventEmitter } from 'events';
import * as Path from 'path';

import * as ansiHtml from 'ansi-html';
import * as express from 'express';
import * as socketIO from 'socket.io';
import * as v from 'villa';

import { Config } from './config';
import { Task } from './task';

export interface TaskCreationCommand {
  names: string[];
  closeAll: boolean;
}

export interface TaskOperationCommand {
  id: string;
}

export class Server extends EventEmitter {
  server: HttpServer;
  app: express.Express;
  io: SocketIO.Server;
  room: SocketIO.Namespace;

  lastTaskId = 0;
  taskMap = new Map<string, Task>();

  constructor(
    public config: Config,
  ) {
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

    for (let name of taskNames) {
      let id = (++this.lastTaskId).toString();

      let options = this.config.tasks[name];

      let task = new Task(
        name,
        options.executable,
        options.args || [],
        {
          cwd: options.cwd || process.cwd(),
          stdout: !!options.stdout,
          stderr: !!options.stderr,
        },
      );

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

  async closeAll(): Promise<void> {
    await v.parallel(Array.from(this.taskMap), ([id]) => this.close(id));
  }

  async close(id: string): Promise<void> {
    let task = this.taskMap.get(id);

    if (!task) {
      return;
    }

    await task.stopWait();

    this.taskMap.delete(id);

    this.room.emit('close', { id });
  }

  private setup(): void {
    this.app.use(express.static(Path.join(__dirname, '../../static')));
    this.io.on('connection', socket => this.initializeConnection(socket));
  }

  private initializeTask(id: string, task: Task): void {
    task.on('start', () => this.room.emit('start', { id }));
    task.on('stop', () => this.room.emit('stop', { id }));

    task.on('error', (error: any) => {
      error = error instanceof Error ?
        error.stack || error.message :
        `${error}`;

      this.room.emit('error', { id, error });
    });

    task.on('exit', (code: number) => this.room.emit('exit', { id, code }));

    task.on('stdout', (data: Buffer) => {
      this.room.emit('stdout', {
        id,
        html: ansiHtml(data.toString()),
      });
    });

    task.on('stderr', (data: Buffer) => {
      this.room.emit('stderr', {
        id,
        html: ansiHtml(data.toString()),
      });
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

    socket.on('close-all', async () => {
      await this.closeAll();
    });

    socket.on('restart', (data: TaskOperationCommand) => {
      let task = this.taskMap.get(data.id);

      if (!task) {
        return;
      }

      task.restart();
    });

    socket.on('start', (data: TaskOperationCommand) => {
      let task = this.taskMap.get(data.id);

      if (!task) {
        return;
      }

      task.start();
    });

    socket.on('stop', (data: TaskOperationCommand) => {
      let task = this.taskMap.get(data.id);

      if (!task) {
        return;
      }

      task.stop();
    });

    socket.emit('initialize', {
      taskNames: Object.keys(this.config.tasks),
      taskGroups: this.config.groups,
      createdTasks: Array
        .from(this.taskMap)
        .map(([id, task]) => {
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
