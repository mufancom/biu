"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = require("events");
const Path = tslib_1.__importStar(require("path"));
const clime_1 = require("clime");
const strip_color_1 = tslib_1.__importDefault(require("strip-color"));
class ProblemMatcher extends events_1.EventEmitter {
    constructor(config, cwd) {
        super();
        this.cwd = cwd;
        let patternConfigs = Array.isArray(config.pattern)
            ? config.pattern
            : [config.pattern];
        this.patterns = patternConfigs.map(config => {
            return Object.assign({ regex: new RegExp(config.regexp) }, config);
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
    reset() {
        clearTimeout(this.problemsUpdateEventTimer);
        this.problems = [];
        this.pendingOutput = '';
        this.patternIndex = 0;
        let background = this.background;
        this.active =
            !background || !background.beginsPattern || background.activeOnStart;
    }
    match(line) {
        if (this.beginsRegex && this.endsRegex) {
            if (this.active) {
                if (this.endsRegex.test(line)) {
                    this.active = false;
                    this.emit('problems-update');
                }
            }
            else if (this.beginsRegex.test(line)) {
                this.active = true;
                this.problems = [];
            }
            if (!this.active) {
                return;
            }
        }
        else if (this.beginsRegex) {
            if (this.beginsRegex.test(line)) {
                this.active = true;
                this.problems = [];
                this.scheduleProblemsUpdateEvent();
            }
            if (!this.active) {
                return;
            }
        }
        else if (this.endsRegex) {
            if (this.endsRegex.test(line)) {
                this.emit('problems-update');
            }
        }
        else if (this.background) {
            throw new clime_1.ExpectedError('At least one of "beginsPattern" and "endsPattern" is required');
        }
        let pattern = this.loopedPattern;
        let groups;
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
        if (this.loopedPattern !== pattern &&
            this.patternIndex === 0 &&
            pattern.loop) {
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
    push(chunk) {
        this.pendingOutput += chunk.toString();
        let lineRegex = /(.*)([\r\n\u2028\u2029]?)/g;
        while (true) {
            let groups = lineRegex.exec(this.pendingOutput);
            let line = groups[1];
            let lineTerminator = groups[2];
            if (lineTerminator) {
                this.match(strip_color_1.default(line));
            }
            else {
                this.pendingOutput = line;
                break;
            }
        }
    }
    pushProblem(schedule) {
        this.problems.push(Object.assign({}, this.activeMatch));
        if (schedule) {
            this.scheduleProblemsUpdateEvent();
        }
    }
    scheduleProblemsUpdateEvent() {
        clearTimeout(this.problemsUpdateEventTimer);
        this.problemsUpdateEventTimer = setTimeout(() => {
            this.emit('problems-update');
        }, 200);
    }
}
exports.ProblemMatcher = ProblemMatcher;
function resolveCapture(groups, index) {
    if (index === undefined) {
        return undefined;
    }
    if (typeof index === 'number') {
        return groups[index];
    }
    return index.replace(/\$(&|\d+)/g, (text, indexStr) => {
        let str = groups[indexStr === '&' ? 0 : Number(indexStr)];
        return typeof str === 'string' ? str : text;
    });
}
//# sourceMappingURL=problem-matcher.js.map