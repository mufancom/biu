const groupList = document.getElementById('group-list');
const taskList = document.getElementById('task-list');
const allOperationsWrapper = document.getElementById('all-operations-wrapper');
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

allOperationsWrapper.addEventListener('click', () => {
  let button = event.target;

  if (button.tagName !== 'BUTTON') {
    return;
  }

  let type = button.getAttribute('data-type');

  socket.emit(type);
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

  updateAllOperationsVisibility();
});

socket.on('create', data => {
  appendTask(Object.assign({ running: true }, data));
  updateAllOperationsVisibility();
});

socket.on('close', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.block.remove();
  taskData.button.removeAttribute('data-id');
  updateTaskButtonStatuses(data.id, []);
  taskDataMap.delete(data.id);
  updateAllOperationsVisibility();
});

socket.on('start', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.task.running = true;
  taskData.block.setState('running');
  taskData.block.append('Task started.\n');
  updateTaskButtonStatuses(data.id, ['created', 'running']);
  updateAllOperationsVisibility();
});

socket.on('stop', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.task.running = false;
  taskData.block.setState('stopped');
  updateTaskButtonStatuses(data.id, ['created']);
  updateAllOperationsVisibility();
});

socket.on('restarting-on-change', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.block.append('Restarting on change...\n');
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

  updateTaskButtonStatuses(task.id, task.running ? ['created', 'running'] : ['created']);

  return block;
}

function updateTaskButtonStatuses(id, statuses) {
  let taskData = taskDataMap.get(id);

  if (!taskData) {
    return;
  }

  let button = taskData.button;

  button.classList.remove('created', 'running');
  button.classList.add(...statuses);
}

function updateAllOperationsVisibility() {
  allOperationsWrapper.classList.remove('none-running', 'some-running', 'all-running');

  let tasks = Array.from(taskDataMap.values()).map(taskData => taskData.task);

  if (!tasks.length) {
    return;
  }

  let running = tasks.filter(task => task.running);

  let statuses = [];

  if (running.length === tasks.length) {
    statuses.push('all-running');
  } else if (running.length) {
    statuses.push('some-running');
  } else {
    statuses.push('none-running');
  }

  allOperationsWrapper.classList.add(...statuses);
}
