#!/usr/bin/env node

const Path = require('path');

const program = require('commander');
const express = require('express');
const open = require('open');
const AnsiConverter = require('ansi-to-html');
const v = require('villa');

let ansiConverter = new AnsiConverter();

let Executor = require('./executor');

let app = express();

let server = require('http').Server(app);
let io = require('socket.io')(server);

program
  .version(require('../package.json').version)
  .usage('[biu.json]')
  .option('-o, --open-browser', 'Open browser')
  .option('-p, --port <port>', 'Port to listen', /^\d+$/, 8088)
  .parse(process.argv);

let biuFilePath = program.args[0] || 'biu.json';

app.use(express.static(Path.join(__dirname, '../static')));

let config = require(Path.join(process.cwd(), biuFilePath));

let commands = config.commands;

commands.forEach(function (options) {
  options.display = [options.command]
    .concat(options.args || [])
    .map(function (part) {
      if (/[\s"]/.test(part)) {
        return '"' + part.replace(/"/g, '""') + '"'
      } else {
        return part;
      }
    })
    .join(' ');
});

let executors;
let commandsStarted = false;

let room = io.in('biu');

io.on('connection', async socket => {
  initialize(socket);

  if (commandsStarted) {
    await v.parallel(executors, executor => executor.restart());
  } else {
    if (socket.handshake.query.everConnected === 'true') {
      socket.emit('reload');
      return;
    }

    startCommands();
    commandsStarted = true;
  }
});

let port = program.port;
let url = 'http://localhost:' + port + '/';

server.listen(port);

console.log('Listening on port ' + port + '.');

if (program.openBrowser) {
  open(url);
} else {
  console.log('Open ' + url + ' in browser to start commands.');
}

process.on('unhandledRejection', error => console.error(error));

function initialize(socket) {
  socket.join('biu');

  socket.on('restart-command', data => executors[data.id].restart());
  socket.on('start-command', data => executors[data.id].start());
  socket.on('stop-command', data => executors[data.id].stop());

  socket.emit('initialize', { commands });
}

function startCommands() {
  executors = commands.map((options, index) => {
    let command = options.command;

    let stdout, stderr;

    if (options.stdout) {
      stdout = process.stdout;
      stderr = process.stderr;
    }

    let executor = new Executor({
      command,
      npm: options.npm,
      args: options.args,
      cwd: options.cwd,
      stdout,
      stderr,
    });

    executor.on('start', () => {
      room.emit('command-start', { id: index });
    });

    executor.on('exit', code => {
      room.emit('command-exit', {
        id: index,
        code,
      });
    });

    executor.on('error', error => {
      room.emit('command-error', {
        id: index,
        error: error.stack,
      });

      console.error(error.stack);
    });

    executor.on('stdout', data => {
      room.emit('stdout', {
        id: index,
        html: ansiConverter.toHtml(data.toString()),
      });
    });

    executor.on('stderr', data => {
      room.emit('stderr', {
        id: index,
        html: ansiConverter.toHtml(data.toString()),
      });
    });

    executor.start();

    return executor;
  });
}

function ansiToHtml(data) {
  return ansiConverter
    .toHtml(data.toString())
    .replace(/\r?\n/g, '<br />');
}

