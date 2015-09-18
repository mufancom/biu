var Path = require('path');

var program = require('commander');
var express = require('express');
var AnsiConverter = require('ansi-to-html');

var ansiConverter = new AnsiConverter();

var Executor = require('./executor');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

program
    .version(require('../package.json').version)
    .option('-o, --open-browser', 'Open browser')
    .option('-p, --port <port>', 'Open browser', /^\d+$/, 8088)
    .parse(process.argv);

app.use(express.static(Path.join(__dirname, '../static')));

server.listen(program.port);

console.log('Listening to port ' + program.port + '.');

var config = require(process.cwd() + '/biu.json');

var commands = config.commands;

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

var executors;
var commandsStarted = false;

var room = io.in('biu');

io.on('connection', function (socket) {
    if (commandsStarted) {
        executors.forEach(function (executor) {
            executor.stop(true);
        });
        
    } else {
        if (socket.handshake.query.everConnected === 'true') {
            socket.emit('reload');
            return;
        }
        
        commandsStarted = true;
    }
    
    initializeSocket(socket);
    startCommands();
});

function initializeSocket(socket) {
    socket.join('biu');
    
    socket.on('restart-command', function (data) {
        var executor = executors[data.id];
        executor.restart();
    });
    
    socket.on('start-command', function (data) {
        var executor = executors[data.id];
        executor.start();
    });
    
    socket.on('stop-command', function (data) {
        var executor = executors[data.id];
        executor.stop();
    });
}

function startCommands() {
    room.emit('initialize', {
        commands: commands
    });
    
    executors = commands.map(function (options, index) {
        var command = options.command;
        
        console.log('Executing command `' + options.display + '`.');
        
        var stdout, stderr;
        
        if (options.stdout) {
            stdout = process.stdout;
            stderr = process.stderr;
        }
        
        var executor = new Executor(command, options.args, options.npm, options.cwd, stdout, stderr);
        
        executor.on('start', function () {
            room.emit('command-start', {
                id: index
            });
        });
        
        executor.on('exit', function (error) {
            room.emit('command-exit', {
                id: index,
                error: error && error.stack
            });
            
            if (error) {
                console.error(error.stack);
            }
        });
        
        executor.on('stdout', function (data) {
            room.emit('stdout', {
                id: index,
                html: ansiConverter.toHtml(data.toString())
            });
        });
        
        executor.on('stderr', function (data) {
            room.emit('stderr', {
                id: index,
                html: ansiConverter.toHtml(data.toString())
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

