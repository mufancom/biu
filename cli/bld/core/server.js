"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = require("events");
const http_1 = require("http");
const Path = tslib_1.__importStar(require("path"));
const ansi_to_html_1 = tslib_1.__importDefault(require("ansi-to-html"));
const express_1 = tslib_1.__importDefault(require("express"));
const socket_io_1 = tslib_1.__importDefault(require("socket.io"));
const v = tslib_1.__importStar(require("villa"));
const problem_matchers_1 = require("../problem-matchers");
const task_1 = require("./task");
class Server extends events_1.EventEmitter {
    constructor(config, configDir) {
        super();
        this.config = config;
        this.configDir = configDir;
        this.lastTaskId = 0;
        this.taskMap = new Map();
        this.taskInfoDictMap = new Map();
        this.app = express_1.default();
        this.server = http_1.createServer(this.app);
        this.io = socket_io_1.default(this.server);
        this.room = this.io.in('biu');
        this.setup();
    }
    async listen(port) {
        await v.call(this.server.listen.bind(this.server), port);
    }
    async create(taskNames, closeAll) {
        if (closeAll) {
            await this.closeAll();
        }
        let problemMatcherDict = Object.assign({}, problem_matchers_1.builtInProblemMatcherDict, this.config.problemMatchers);
        for (let name of taskNames) {
            let id = (++this.lastTaskId).toString();
            let options = this.config.tasks[name];
            let problemMatcherConfig = typeof options.problemMatcher === 'string'
                ? problemMatcherDict[options.problemMatcher]
                : options.problemMatcher;
            let task = new task_1.Task(name, options.executable, options.args || [], {
                cwd: options.cwd
                    ? Path.resolve(this.configDir, options.cwd)
                    : process.cwd(),
                stdout: !!options.stdout,
                stderr: !!options.stderr,
                problemMatcher: problemMatcherConfig,
                watch: options.watch,
                autoClose: !!options.autoClose,
            });
            this.taskInfoDictMap.set(id, {
                stdout: {
                    converter: new ansi_to_html_1.default({ stream: true }),
                    lastData: '',
                },
                stderr: {
                    converter: new ansi_to_html_1.default({ stream: true }),
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
    async startAll() {
        await v.parallel(Array.from(this.taskMap), ([id]) => this.start(id));
    }
    async restartAll() {
        await v.parallel(Array.from(this.taskMap), ([id]) => this.restart(id));
    }
    async stopAll() {
        await v.parallel(Array.from(this.taskMap), ([id]) => this.stop(id));
    }
    async closeAll() {
        await v.parallel(Array.from(this.taskMap), ([id]) => this.close(id));
    }
    async start(id) {
        let task = this.taskMap.get(id);
        if (!task) {
            return;
        }
        task.start();
    }
    async stop(id) {
        let task = this.taskMap.get(id);
        if (!task) {
            return;
        }
        task.stop();
    }
    async restart(id) {
        let task = this.taskMap.get(id);
        if (!task) {
            return;
        }
        await task.restart();
    }
    async close(id) {
        let task = this.taskMap.get(id);
        if (!task) {
            return;
        }
        await task.stopWait();
        this.taskMap.delete(id);
        this.room.emit('close', { id });
    }
    setup() {
        let clientBuildPath = Path.join(__dirname, '../../../client/bld');
        this.app.use(express_1.default.static(clientBuildPath));
        this.io.on('connection', socket => this.initializeConnection(socket));
    }
    outputProblems(owner) {
        let lineSet = new Set();
        for (let [, { problemMatcherMap }] of this.taskMap) {
            let problemMatcher = problemMatcherMap && problemMatcherMap.get(owner);
            if (!problemMatcher) {
                continue;
            }
            for (let problem of problemMatcher.problems) {
                lineSet.add([
                    problem.severity,
                    problem.file,
                    problem.location,
                    problem.code,
                    problem.message,
                ].join(';'));
            }
        }
        process.stdout.write(`[biu-problems:${owner}:begin]\n`);
        for (let line of lineSet) {
            process.stdout.write(`[biu-problem:${owner}:${line}]\n`);
        }
        process.stdout.write(`[biu-problems:${owner}:end]\n`);
    }
    initializeTask(id, task) {
        task.on('start', () => this.room.emit('start', { id }));
        task.on('stop', () => this.room.emit('stop', { id }));
        task.on('restarting-on-change', () => this.room.emit('restarting-on-change', { id }));
        task.on('error', (error) => {
            error =
                error instanceof Error ? error.stack || error.message : `${error}`;
            this.room.emit('error', {
                id,
                error: encodeOutput(error),
            });
        });
        task.on('exit', async (data) => {
            this.room.emit('exit', { id, code: data.code });
            if (data.close) {
                await this.close(id);
            }
        });
        task.on('stdout', (data) => {
            this.onStdData(id, 'stdout', data);
        });
        task.on('stderr', (data) => {
            this.onStdData(id, 'stderr', data);
        });
        task.on('problems-update', (data) => {
            this.outputProblems(data.owner);
        });
    }
    onStdData(id, event, data) {
        let html = '';
        let taskInfo = this.taskInfoDictMap.get(id)[event];
        let lines = data.toString().split('\n');
        let dataCompleted = lines[lines.length - 1] === '';
        lines[0] = taskInfo.lastData + lines[0];
        taskInfo.lastData = lines[lines.length - 1];
        if (dataCompleted) {
            lines = lines.slice(0, lines.length - 1);
        }
        for (let [index, line] of lines.entries()) {
            if (index === lines.length - 1 && !dataCompleted) {
                html += `<div data-type='${event}' data-uncompleted="true">${taskInfo.converter.toHtml(line)}</div>`;
            }
            else {
                html += `<div data-type='${event}'>${taskInfo.converter.toHtml(line)}</div>`;
            }
        }
        this.room.emit(event, {
            id,
            html,
        });
    }
    initializeConnection(socket) {
        socket.join('biu');
        socket.on('create', async (data) => {
            await this.create(data.names, data.closeAll);
        });
        socket.on('close', async (data) => {
            await this.close(data.id);
        });
        socket.on('restart', async (data) => {
            await this.restart(data.id);
        });
        socket.on('start', async (data) => {
            await this.start(data.id);
        });
        socket.on('stop', async (data) => {
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
exports.Server = Server;
function encodeOutput(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
//# sourceMappingURL=server.js.map