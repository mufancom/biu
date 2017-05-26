# Biu: The Command-line Task Hub

Biu is a simple command-line tool for running multiple command-line tasks at the same time. It provides a simple GUI interface and aggregates stdout/stderr streams produced by tasks on demand.

![image](https://cloud.githubusercontent.com/assets/970430/26506654/fcafead6-427f-11e7-946c-4090bf8117d9.png)

## Installation

```sh
# global
npm install biu --global

# local
npm install biu --save-dev
```

## Usage

```sh
biu --help
```

## Configuration

Biu loads configuration from a Node.js module, it could either be a `.js` or `.json` file. By default, it tries to require `.biu` from the current working directory.

The configuration contains two field: `tasks` and `groups`. And here's an example:

```json
{
  "tasks": {
    "start-app": {
      "executable": "npm",
      "args": [
        "run", "start:app:hmr"
      ],
      "stdout": false
    },
    "start-server": {
      "executable": "npm",
      "args": [
        "run", "start:server"
      ],
      "stdout": false
    },
    "build-server": {
      "executable": "npm",
      "args": [
        "run", "build:server:tsc", "--", "-w"
      ],
      "stdout": true
    },
    "build-website-desktop": {
      "executable": "npm",
      "args": [
        "run", "build:website:desktop"
      ],
      "stdout": false
    }
  },
  "groups": {
    "app": ["start-app", "start-server", "build-server", "build-website-desktop"],
    "server": ["start-server", "build-server", "build-website-desktop"]
  }
}
```

Checkout [config.ts](src/core/config.ts) for options supported.

## License

MIT License.
