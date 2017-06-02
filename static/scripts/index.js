const groupList = document.getElementById('group-list');
const taskList = document.getElementById('task-list');
const closeAllButton = document.getElementById('close-all-button');
const outputsWrapper = document.getElementById('outputs-wrapper');
const disconnectedMask = document.getElementById('disconnected-mask');

let taskGroupMap;
let taskDataMap;

groupList.addEventListener('click', event => {
  let target = event.target;

  if (target.tagName !== 'BUTTON') {
    return;
  }

  let name = target.getAttribute('data-name');

  let createdTaskNameSet = new Set(
    Array.from(taskDataMap.values())
      .map(taskData => taskData.task.name),
  );

  socket.emit('create', {
    names: taskGroupMap.get(name)
      .filter(name => !createdTaskNameSet.has(name)),
    closeAll: false,
  });
});

taskList.addEventListener('click', event => {
  let target = event.target;

  if (target.tagName !== 'BUTTON') {
    return;
  }

  let name = target.getAttribute('data-name');
  let id = target.getAttribute('data-id');

  if (id) {
    let taskData = taskDataMap.get(id);

    if (!taskData) {
      return;
    }

    if (taskData.task.running) {
      return;
    }

    socket.emit('start', { id });
  } else {
    socket.emit('create', {
      names: [name],
      closeAll: false,
    });
  }
});

closeAllButton.addEventListener('click', () => {
  socket.emit('close-all');
});

let socket = io();

socket.connect();

socket.on('connect', () => {
  disconnectedMask.style.display = 'none';
  console.log('connected');
});

socket.on('disconnect', () => {
  disconnectedMask.style.display = '';
  console.log('disconnected');
});

socket.on('initialize', data => {
  groupList.innerHTML = '';
  taskList.innerHTML = '';
  outputsWrapper.innerHTML = '';

  let groupDict = data.taskGroups || {};
  let groupNames = Object.keys(groupDict);
  let taskNames = data.taskNames || [];

  taskGroupMap = Object
    .keys(groupDict)
    .reduce((map, name) => {
      map.set(name, groupDict[name]);
      return map;
    }, new Map());

  if (groupNames.length) {
    let groupsFragment = document.createDocumentFragment();

    for (let name of groupNames) {
      let button = document.createElement('button');
      button.innerText = name;
      button.setAttribute('data-name', name);
      groupsFragment.appendChild(button);
    }

    groupList.appendChild(groupsFragment);
  } else {
    groupList.innerHTML = 'none';
  }

  let tasksFragment = document.createDocumentFragment();

  for (let name of taskNames) {
    let button = document.createElement('button');
    button.classList.add('green');
    button.innerText = name;
    button.setAttribute('data-name', name);
    tasksFragment.appendChild(button);
  }

  taskList.appendChild(tasksFragment);

  taskDataMap = new Map();

  for (let task of data.createdTasks) {
    appendTask(task);
  }
});

socket.on('create', data => {
  appendTask(Object.assign({ running: true }, data));
});

socket.on('close', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.block.remove();
  taskData.button.removeAttribute('data-id');
  updateTaskButtonState(data.id, []);
  taskDataMap.delete(data.id);
});

socket.on('start', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.task.running = true;
  taskData.block.setState('running');
  taskData.block.append('Task started.\n');
  updateTaskButtonState(data.id, ['created', 'running']);
});

socket.on('stop', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.task.running = false;
  taskData.block.setState('stopped');
  updateTaskButtonState(data.id, ['created']);
});

socket.on('error', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.block.append(`${data.error}\n`);
});

socket.on('exit', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  let text = data.code ?
    `Task exited with code ${data.code}.\n` :
    `Task exited.`;

  taskData.block.append(text);
});

socket.on('stdout', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.block.append(data.html);
});

socket.on('stderr', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.block.append(data.html);
});

function appendTask(task) {
  let block = new OutputBlock(task.id, task.line);

  let button = document.querySelector(`#task-list button[data-name="${task.name}"]`);
  button.setAttribute('data-id', task.id);

  block.setState(task.running ? 'running' : 'stopped');

  outputsWrapper.appendChild(block.wrapper);

  taskDataMap.set(task.id, {
    task,
    block,
    button,
  });

  updateTaskButtonState(task.id, task.running ? ['created', 'running'] : ['created']);

  return block;
}

function updateTaskButtonState(id, states) {
  let taskData = taskDataMap.get(id);

  if (!taskData) {
    return;
  }

  let button = taskData.button;

  button.classList.remove('created', 'running');
  button.classList.add(...states);
}
