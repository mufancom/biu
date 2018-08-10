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
yarn global add biu

# local
yarn add biu --dev
```

## Usage

```sh
biu --help
```

## Configuration

Biu loads configuration from a Node.js module, it could either be a `.js` or `.json` file. By default, it tries to require `.biu`, or read `scripts` section of `package.json` from the current working directory if no configuration file is specified and the default `.biu` (`.js`, `.json`) does not exist.

The configuration contains three fields: `tasks` (required), `groups` and `problemMatchers`.

### Using built-in problem matchers

Currently Biu has the following built-in problem matchers:

- `$typescript:tsc-watch`
- `$typescript:tslint`

```json
{
  "tasks": {
    "build-app": {
      "executable": "tsc",
      "args": ["-p", "src/app", "-w"],
      "problemMatcher": "$typescript:tsc-watch"
    },
    "build-server": {
      "executable": "tsc",
      "args": ["-p", "src/server", "-w"],
      "problemMatcher": "$typescript:tsc-watch"
    }
  },
  "groups": {
    "all": ["build-app", "build-server"]
  }
}
```

### Using custom problem matchers

To use custom problem matchers, add it to the `problemMatchers` field:

```json
{
  "tasks": {
    "build-app": {
      "executable": "tsc",
      "args": ["-p", "src/app", "-w"],
      "problemMatcher": "$typescript:tsc-watch"
    },
    "build-server": {
      "executable": "tsc",
      "args": ["-p", "src/server", "-w"],
      "problemMatcher": "$typescript:tsc-watch"
    },
    "build-website": {
      "executable": "webpack",
      "problemMatcher": "$typescript:at-loader"
    }
  },
  "groups": {
    "all": ["build-app", "build-server", "build-website"]
  },
  "problemMatchers": {
    "$typescript:at-loader": {
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
      "background": {
        "beginsPattern": "^\\[at-loader\\] Checking started in a separate process\\.\\.\\.$"
      }
    }
  }
}
```

Checkout [config.ts](src/core/config.ts) for more options.

### VSCode Problem Matcher Support

To make the aggregated problem matcher output work in VSCode, you'll need to define Biu as a task and configure proper problem matcher options in `tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "biu",
      "type": "shell",
      "command": "yarn",
      "args": ["biu"],
      "isBackground": true,
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "problemMatcher": {
        "name": "biu-typescript",
        "owner": "typescript",
        "applyTo": "closedDocuments",
        "fileLocation": "absolute",
        "pattern": {
          "regexp": "^\\[biu-problem:typescript:([^;]*);([^;]*);([^;]*);([^;]*);(.*?)\\]?$",
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

You can also install [Biu Problem Matchers] extension which contributes the following problem matchers:

- `$biu-typescript`

Thus you will be able to simplify your task configuration.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "biu",
      "type": "shell",
      "command": "yarn",
      "args": ["biu"],
      "isBackground": true,
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "problemMatcher": "$biu-typescript"
    }
  ]
}
```

### Support for package.json `scripts`

If configuration is loaded from `package.json`, Biu will convert all keys in `scripts` section into `tasks`. And if you add `biuGroups`, `biu-groups` or `groups` under `biu` section into your `package.json`, Biu will load it as `groups`.

## License

MIT License.
