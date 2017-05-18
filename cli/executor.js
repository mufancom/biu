const FS = require('fs');
const Path = require('path');
const EventEmitter = require('events').EventEmitter;
const { spawn } = require('child_process');

const v = require('villa');

class Executor extends EventEmitter {
  constructor({ command, npm, args, cwd, stdout, stderr }) {
    super();

    if (npm && process.platform === 'win32') {
      command += '.cmd';
    }

    this.command = command;
    this.args = args;
    this.cwd = cwd;
    this.stdout = stdout;
    this.stderr = stderr;

    this.process = undefined;
    this.stopping = false;
  }

  start() {
    if (this.process) {
      return;
    }

    console.log(`Starting command ${this.command}...`);

    this.process = spawn(this.command, this.args, {
      cwd: this.cwd,
    });

    this.emit('start');

    this.process.once('error', error => this.emit('error', error));
    this.process.once('exit', code => this.emit('exit', code));

    this.process.stdout.on('data', data => this.emit('stdout', data));
    this.process.stderr.on('data', data => this.emit('stderr', data));

    if (this.stdout) {
      this.process.stdout.pipe(this.stdout)
    }

    if (this.stderr) {
      this.process.stderr.pipe(this.stderr);
    }
  }

  async _stop() {
    let pid = this.process.pid;

    console.log(`Stopping command ${this.command} (PID: ${pid})...`);

    if (process.platform === 'win32') {
      spawn('taskkill', ['/f', '/t', '/pid', pid]);
    } else {
      this.process.kill();
    }

    try {
      await v.awaitable(this.process, 'exit');
      this.process = undefined;
    } finally {
      this.stopping = undefined;
    }
  }

  async stop() {
    if (!this.process) {
      return;
    }

    if (this.stopping) {
      return this.stopping;
    }

    return this.stopping = this._stop();
  }

  async restart() {
    await this.stop();
    this.start();
  }
}

module.exports = Executor;
