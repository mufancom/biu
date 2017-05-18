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

    this.process = spawn(
      this.command,
      this.args,
      { cwd: this.cwd }
    );

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

    this.process.kill();

    try {
      await Promise.race([
        v.awaitable(this.process, 'exit'),
        v.sleep(3000).then(() => Promise.reject(`Timeout killing process ${pid}`)),
      ]);

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

// function Executor(command, args, npm, cwd, stdout, stderr) {
//   EventEmitter.call(this);

//   var info = getCommandSpawnInfo(command, args, npm);

//   this.command = info.command;
//   this.args = info.args;
//   this.cwd = cwd;
//   this.stdout = stdout;
//   this.stderr = stderr;
//   this.process = undefined;
//   this.restartPending = false;
// }

// Executor.prototype = (function () {
//   function _() { }
//   _.prototype = EventEmitter.prototype;
//   return new _();
// })();

// Executor.prototype.start = function () {
//   var that = this;

//   if (this.process) {
//     return;
//   }

//   // var exitCode;

//   var cp =
//   this.process = spawn(this.command, this.args, {
//     cwd: this.cwd,
//     shell: true
//   });

//   this.emit('start');

//   // cp.on('exit', function (code) {
//   //     exitCode = code || 0;
//   //
//   //     if (that.process.killed) {
//   //         that.emit('exit', {
//   //             code: exitCode
//   //         });
//   //     }
//   //
//   //     that.process = undefined;
//   //
//   //     if (that.restartPending) {
//   //         that.restartPending = false;
//   //         that.start();
//   //     }
//   // });

//   cp.stdout.on('data', function(data) {
//     that.emit('stdout', data);
//   });

//   cp.stderr.on('data', function(data) {
//     that.emit('stderr', data);
//   });

//   if (this.stdout) {
//     cp.stdout.pipe(this.stdout)
//   }

//   if (this.stderr) {
//     cp.stderr.pipe(this.stderr);
//   }
// };

// Executor.prototype.restart = function (silent) {
//   if (this.process) {
//     this.restartPending = true;
//     this.process.kill();
//   } else {
//     this.start();
//   }
// };

// Executor.prototype.stop = function (silent) {
//   if (this.process) {
//     this.restartPending = false;
//     this.process.kill();
//   }
// };

// Executor.prototype._handleExit = function (error, silent) {
//   if (!silent) {
//     this.emit('exit', error);
//   }

//   this.process = undefined;

//   if (this.restartPending) {
//     this.restartPending = false;
//     this.start();
//   }
// };

module.exports = Executor;
