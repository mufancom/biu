const groupList = document.getElementById('group-list');
const taskList = document.getElementById('task-list');
const closeAllButton = document.getElementById('close-all-button');
const outputsWrapper = document.getElementById('outputs-wrapper');

let taskGroupMap;
let taskDataMap;

groupList.addEventListener('click', event => {
  let target = event.target;

  if (target.tagName !== 'BUTTON') {
    return;
  }

  let name = target.getAttribute('data-name');

  socket.emit('create', {
    names: taskGroupMap.get(name),
    closeAll: true,
  });
});

taskList.addEventListener('click', event => {
  let target = event.target;

  if (target.tagName !== 'BUTTON') {
    return;
  }

  let name = target.getAttribute('data-name');

  socket.emit('create', {
    names: [name],
    closeAll: false,
  });
});

closeAllButton.addEventListener('click', () => {
  socket.emit('close-all');
});

let socket = io();

socket.connect();

socket.on('connect', () => {
  console.log('connected');
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
});

socket.on('start', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.task.running = true;
  taskData.block.setState('running');
  taskData.block.append('Task started.\n');
});

socket.on('stop', data => {
  let taskData = taskDataMap.get(data.id);

  if (!taskData) {
    return;
  }

  taskData.task.running = false;
  taskData.block.setState('stopped');
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

  block.setState(task.running ? 'running' : 'stopped');

  outputsWrapper.appendChild(block.wrapper);

  taskDataMap.set(task.id, {
    task,
    block,
  });

  return block;
}
