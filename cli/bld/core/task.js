"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const events_1 = require("events");
const Chokidar = tslib_1.__importStar(require("chokidar"));
const npm_which_1 = tslib_1.__importDefault(require("npm-which"));
const shell_escape_1 = tslib_1.__importDefault(require("shell-escape"));
const v = tslib_1.__importStar(require("villa"));
const problem_matcher_1 = require("./problem-matcher");
class Task extends events_1.EventEmitter {
    constructor(name, executable, args, options) {
        super();
        this.name = name;
        this.executable = executable;
        this.args = args;
        this.options = options;
        this.running = false;
        try {
            this.path = npm_which_1.default(options.cwd).sync(executable);
        }
        catch (error) {
            this.path = executable;
        }
        if (options.problemMatcher) {
            let configs = Array.isArray(options.problemMatcher)
                ? options.problemMatcher
                : [options.problemMatcher];
            this.problemMatcherMap = new Map(configs.map(config => {
                let matcher = new problem_matcher_1.ProblemMatcher(config, options.cwd);
                let owner = matcher.owner;
                matcher.on('problems-update', () => this.emit('problems-update', { owner }));
                return [owner, matcher];
            }));
        }
        if (options.watch) {
            Chokidar.watch(options.watch, {
                cwd: options.cwd,
                ignoreInitial: true,
            }).on('all', () => this.scheduleRestart());
        }
    }
    get line() {
        return shell_escape_1.default([this.executable, ...this.args]);
    }
    start() {
        if (this.running) {
            return false;
        }
        if (this.problemMatcherMap) {
            for (let [, matcher] of this.problemMatcherMap) {
                matcher.reset();
            }
        }
        this.emit('start');
        this.running = true;
        try {
            this.process = child_process_1.spawn(this.path, this.args, {
                cwd: this.options.cwd,
            });
        }
        catch (error) {
            this.handleStop(error);
            return true;
        }
        this.process.once('error', error => this.handleStop(error));
        this.process.once('exit', code => this.handleStop(undefined, code));
        this.process.stdout.on('data', (data) => {
            let map = this.problemMatcherMap;
            if (map) {
                for (let [, matcher] of map) {
                    matcher.push(data);
                }
            }
            this.emit('stdout', data);
        });
        this.process.stderr.on('data', (data) => {
            let map = this.problemMatcherMap;
            if (map) {
                for (let [, matcher] of map) {
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
    stop() {
        if (!this.running) {
            return false;
        }
        if (process.platform === 'win32') {
            child_process_1.spawn('taskkill', ['/f', '/t', '/pid', this.process.pid.toString()]);
        }
        else {
            this.process.kill();
        }
        return true;
    }
    async stopWait() {
        if (this.stop()) {
            await v.awaitable(this, 'stop');
        }
    }
    async restart() {
        await this.stopWait();
        this.start();
    }
    handleStop(error, code) {
        if (this.problemMatcherMap) {
            for (let [, matcher] of this.problemMatcherMap) {
                if (!matcher.background) {
                    this.emit('problems-update', { owner: matcher.owner });
                }
            }
        }
        if (error) {
            this.emit('error', error);
        }
        else {
            this.emit('exit', {
                code,
                close: this.options.autoClose && code === 0,
            });
        }
        if (this.running) {
            this.emit('stop');
            this.running = false;
        }
    }
    scheduleRestart() {
        clearTimeout(this.restartScheduleTimer);
        this.restartScheduleTimer = setTimeout(async () => {
            if (this.running) {
                this.emit('restarting-on-change');
                await this.restart();
            }
        }, 1000);
    }
}
exports.Task = Task;
//# sourceMappingURL=task.js.map