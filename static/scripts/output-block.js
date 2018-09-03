const MAX_LINES = 3000;

class OutputBlock {
  constructor(id, name, line) {
    let that = this;

    let wrapper = document.createElement('div');
    wrapper.className = 'output-block-wrapper';

    wrapper.innerHTML = `\
<div class="output-block">
  <div class="operations">
    <button class="start" data-type="start">start</button>
    <button class="restart" data-type="restart">restart</button>
    <button class="stop" data-type="stop">stop</button>
    <button class="close red" data-type="close">close</button>
  </div>
  <div class="command">
    <span class="name"></span>
    <span class="line"></span>
  </div>
  <pre class="output"></pre>
</div>`;

    let command = wrapper.getElementsByClassName('command')[0];

    command.title = line;

    command.getElementsByClassName('name')[0].innerText = name;
    command.getElementsByClassName('line')[0].innerText = line;

    this.block = wrapper.getElementsByClassName('output-block')[0];
    this.pre = wrapper.getElementsByClassName('output')[0];
    this.wrapper = wrapper;

    let opWrapper = wrapper.getElementsByClassName('operations')[0];

    opWrapper.addEventListener('click', event => {
      let button = event.target;

      if (button.tagName !== 'BUTTON') {
        return;
      }

      let type = button.getAttribute('data-type');

      socket.emit(type, {id});
    });
  }

  setState(state) {
    let block = this.block;
    block.classList.remove('running');
    block.classList.remove('stopped');

    if (state) {
      block.classList.add(state);
    }
  }

  append(html) {
    let pre = this.pre;
    let atBottom =
      Math.abs(pre.scrollHeight - (pre.scrollTop + pre.clientHeight)) < 1;

    let temp = document.createElement('div');
    temp.innerHTML = html;

    let fragment = document.createDocumentFragment();

    while (temp.childNodes.length) {
      fragment.appendChild(temp.childNodes[0]);
    }

    let type = fragment.firstChild.dataset.type;
    let lastSameTypeNode = this.findLastNodeByType(type);

    if (lastSameTypeNode && lastSameTypeNode.dataset.uncompleted) {
      pre.insertBefore(fragment, lastSameTypeNode);
      pre.removeChild(lastSameTypeNode);
    } else {
      pre.appendChild(fragment);
    }

    let over = pre.childNodes.length - MAX_LINES;

    for (let i = over - 1; i > -1; i--) {
      pre.removeChild(pre.childNodes[i]);
    }

    if (atBottom) {
      pre.scrollTop = pre.scrollHeight - pre.clientHeight;
    }
  }

  findLastNodeByType(type) {
    let pre = this.pre;

    for (let i = pre.childNodes.length - 1; i > -1; i--) {
      let node = pre.childNodes[i];

      if (node.dataset && node.dataset.type === type) {
        return node;
      }
    }
    return null;
  }

  remove() {
    let parentNode = this.wrapper.parentNode;
    parentNode.removeChild(this.wrapper);
  }
}
