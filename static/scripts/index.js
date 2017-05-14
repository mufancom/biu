var outputBlocks;

var everConnected = false;

var socket = io({
    query: {
        get everConnected() {
            return everConnected;
        }
    }
});

socket.connect();

socket.on('connect', function () {
    everConnected = true;
    console.log('connected');
});

socket.on('reload', function () {
    location.reload();
});

socket.on('initialize', function (data) {
    var outputsWrapper = document.getElementById('outputs-wrapper');

    outputBlocks = data
        .commands
        .map(function (options, index) {
            var block = new OutputBlock(index, options.display);

            outputsWrapper.appendChild(block.wrapper);

            return block;
        });
});

socket.on('command-start', function (data) {
    var block = outputBlocks[data.id];
    block.setState('running');
});

socket.on('command-exit', function (data) {
    var block = outputBlocks[data.id];
    block.setState('stopped');

    if (data.error) {
        block.append('Command exited with error.\n' + data.error + '\n');
    } else {
        block.append('Command exited with no error.\n');
    }

});

socket.on('stdout', function (data) {
    var block = outputBlocks[data.id];
    block.append(data.html);
});

socket.on('stderr', function (data) {
    var block = outputBlocks[data.id];
    block.append(data.html);
});
