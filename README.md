# Biu: The Command-line Task Hub

Biu is a simple command-line tool for running multiple command-line tasks at the same time. It provides a simple GUI interface and aggregates stdout/stderr streams produced by tasks on demand.

![image](https://cloud.githubusercontent.com/assets/970430/26506654/fcafead6-427f-11e7-946c-4090bf8117d9.png)

## Features

- Start tasks in a group with one click.
- Selectively pipe stdout and stderr of specific tasks.
- Aggregate problems from several tasks with different problem matchers.

## Installation

```sh
# global
npm install biu --global
yarn global add biu

# local
npm install biu --save-dev
yarn add biu --dev
```

## Usage

```sh
biu --help
```

## Configuration

Biu loads configuration from a Node.js module, it could either be a `.js` or `.json` file. By default, it tries to require `.biu`, or read `scripts` section of `package.json` from the current working directory if no configuration file is specified and the default `.biu` (`.js`, `.json`) does not exist.

The configuration contains three fields: `problemMatchers`, `tasks` (required) and `groups`. And here's an example:

**.biu.json**

```json
{
  "problemMatchers": {
    "typescript-tsc": {
      "owner": "typescript",
      "pattern": {
        "regexp": "^([^\\s].*)\\((\\d+|\\d+,\\d+|\\d+,\\d+,\\d+,\\d+)\\):\\s+(error|warning|info)\\s+(TS\\d+)\\s*:\\s*(.*)$",
        "file": 1,
        "location": 2,
        "severity": 3,
        "code": 4,
        "message": 5
      },
      "watching": {
        "activeOnStart": true,
        "beginsPattern": "^\\s*(?:message TS6032:|\\d{1,2}:\\d{1,2}:\\d{1,2}(?: AM| PM)? -) File change detected\\. Starting incremental compilation\\.\\.\\.",
        "endsPattern": "^\\s*(?:message TS6042:|\\d{1,2}:\\d{1,2}:\\d{1,2}(?: AM| PM)? -) Compilation complete\\. Watching for file changes\\."
      }
    },
    "typescript-ng-cli": {
      "owner": "typescript",
      "pattern": {
        "regexp": "^(ERROR|WARNING) in (.+\\.ts) \\((\\d+|\\d+,\\d+|\\d+,\\d+,\\d+,\\d+)\\): (.+)$",
        "severity": 1,
        "file": 2,
        "location": 3,
        "message": 4
      },
      "watching": {
        "activeOnStart": true,
        "beginsPattern": "webpack: Compiling...",
        "endsPattern": "webpack: (?:Compiled successfully|Compiled with warnings|Failed to compile)."
      }
    },
    "typescript-at-loader": {
      "owner": "typescript",
      "pattern": [
        {
          "regexp": "^(ERROR) in \\[at-loader\\] (.+\\.ts):(\\d+|\\d+:\\d+)\\s*$",
          "severity": 1,
          "file": 2,
          "location": 3
        },
        {
          "regexp": "^\\s+(TS\\d+): (.+)$",
          "code": 1,
          "message": 2
        }
      ],
      "watching": {
        "beginsPattern": "^\\[at-loader\\] Checking started in a separate process\\.\\.\\.$"
      }
    }
  },
  "tasks": {
    "start-app": {
      "executable": "ng",
      "args": [
        "serve", "--hmr", "-e=hmr"
      ],
      "problemMatcher": "typescript-ng-cli"
    },
    "start-server": {
      "executable": "node",
      "args": [
        "bld/server/main.js"
      ],
      "watch": [
        "bld/server/*.js",
        "bld/server/modules/**/*.js"
      ]
    },
    "build-app": {
      "executable": "ng",
      "args": [
        "build"
      ]
    },
    "build-server": {
      "executable": "tsc",
      "args": [
        "-p", "src/server",
        "-w"
      ],
      "problemMatcher": "typescript-tsc"
    },
    "build-website-desktop": {
      "executable": "webpack",
      "cwd": "src/website",
      "args": [
        "--env.TARGET", "desktop",
        "--env.ENV", "dev",
        "--env.WATCH"
      ],
      "problemMatcher": "typescript-at-loader"
    },
    "build-website-libs": {
      "executable": "webpack",
      "cwd": "src/website",
      "args": [
        "--env.TARGET", "libs",
        "--env.ENV", "dev"
      ]
    }
  },
  "groups": {
    "app": ["start-app", "start-server", "build-server", "build-website-desktop"],
    "server": ["build-app", "start-server", "build-server", "build-website-desktop"]
  }
}
```

Checkout [config.ts](src/core/config.ts) for options supported.

#### package.json `scripts` section support

If biu read configuration from `package.json`, it will convert all keys in `scripts` section into `tasks` configuration. And if you add `biuGroups`, `biu-groups` or `groups` under `biu` section into your `package.json`, biu will read it as `groups` configuration.

### VS Code Problem Matcher Support

To make the aggregated problem matcher output work in VS Code, you'll need to define biu as a task and configure proper problem matcher options in `tasks.json`:

```json
{
  "version": "0.1.0",
  "tasks": [
    {
      "taskName": "biu",
      "command": "npm",
      "isShellCommand": true,
      "isBackground": true,
      "isBuildCommand": true,
      "args": ["run", "biu"],
      "showOutput": "silent",
      "problemMatcher": {
        "owner": "typescript",
        "fileLocation": "absolute",
        "applyTo": "closedDocuments",
        "pattern": {
          "regexp": "^\\[biu-problem:typescript:([^;]*);([^;]*);([^;]*);([^;]*);(.*)\\]$",
          "severity": 1,
          "file": 2,
          "location": 3,
          "code": 4,
          "message": 5
        },
        "background": {
          "activeOnStart": false,
          "beginsPattern": "^\\[biu-problems:typescript:begin\\]$",
          "endsPattern": "^\\[biu-problems:typescript:end\\]$"
        }
      }
    }
  ]
}
```

## License

MIT License.
