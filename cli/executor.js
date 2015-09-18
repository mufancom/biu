var FS = require('fs');
var Path = require('path');
var ChildProcess = require('child_process');
var EventEmitter = require('events').EventEmitter;

var Promise = require('thenfail').Promise;

var spawn = ChildProcess.spawn;
var execSync = ChildProcess.execSync;

function getCommandSpawnInfo(command, args, npm) {
    if (npm && process.platform === 'win32') {
        var result = execSync('where "' + command + '.cmd"', {
            encoding: 'utf-8'
        }) || '';
        
        var cmdPath = result.match(/.*/)[0];
        var cmdText = FS.readFileSync(cmdPath, 'utf-8');
        
        var path = Path.dirname(cmdPath) + cmdText.match(/"%~dp0(\\node_modules\\.+?)"\s%\*/)[1];
        
        command = 'node';
        args = [/\s/.test(path) ? '"' + path + '"' : path].concat(args || []);
    }
    
    return {
        command: command,
        args: args
    };
}

// var info = getCommandSpawnInfo('tsc', [], true);
// 
// console.log(info);

function Executor(command, args, npm, cwd, stdout, stderr) {
    EventEmitter.call(this);
    
    var info = getCommandSpawnInfo(command, args, npm);
    
    this.command = info.command;
    this.args = info.args;
    this.cwd = cwd;
    this.stdout = stdout;
    this.stderr = stderr;
    this.process = undefined;
    this.restartPending = false;
}

Executor.prototype = (function () {
    function _() { }
    _.prototype = EventEmitter.prototype;
    return new _();
})();

Executor.prototype.start = function () {
    var that = this;
    
    if (this.process) {
        return;
    }
    
    // var exitCode;
    
    var cp =
    this.process = spawn(this.command, this.args, {
        cwd: this.cwd
    }, function (error) {
        that._handleExit(error);
    });
    
    this.emit('start');
    
    // cp.on('exit', function (code) {
    //     exitCode = code || 0;
    //     
    //     if (that.process.killed) {
    //         that.emit('exit', {
    //             code: exitCode
    //         });
    //     }
    //     
    //     that.process = undefined;
    //     
    //     if (that.restartPending) {
    //         that.restartPending = false;
    //         that.start();
    //     }
    // });
    
    cp.stdout.on('data', function(data) {
        that.emit('stdout', data);
    });
    
    cp.stderr.on('data', function(data) {
        that.emit('stderr', data);
    });
    
    if (this.stdout) {
        cp.stdout.pipe(this.stdout)
    }
    
    if (this.stderr) {
        cp.stderr.pipe(this.stderr);
    }
};

Executor.prototype.restart = function (silent) {
    if (this.process) {
        this.restartPending = true;
        this.process.kill();
        this._handleExit(undefined, silent);
    } else {
        this.start();
    }
};

Executor.prototype.stop = function (silent) {
    if (this.process) {
        this.restartPending = false;
        this.process.kill();
        this._handleExit(undefined, silent);
    }
};

Executor.prototype._handleExit = function (error, silent) {
    if (!silent) {
        this.emit('exit', error);
    }
    
    this.process = undefined;
    
    if (this.restartPending) {
        this.restartPending = false;
        this.start();
    }
};

module.exports = Executor;