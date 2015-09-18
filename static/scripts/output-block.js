function OutputBlock(id, display) {
    var that = this;
    
    var wrapper = document.createElement('div');
    wrapper.className = 'output-block-wrapper';
    
    wrapper.innerHTML = `
        <div class="output-block">
            <div class="operations">
                <button class="restart" data-type="restart-command">restart</button>
                <button class="start" data-type="start-command">start</button>
                <button class="stop" data-type="stop-command">stop</button>
            </div>
            <div class="command"></div>
            <pre class="output"></pre>
        </div>
    `;
    
    wrapper
        .getElementsByClassName('command')[0]
        .innerText = display;
    
    this.block = wrapper.getElementsByClassName('output-block')[0];
    this.pre = wrapper.getElementsByClassName('output')[0];
    this.wrapper = wrapper;
    
    var opWrapper = wrapper.getElementsByClassName('operations')[0];
    
    opWrapper.addEventListener('click', function (event) {
        var button = event.target;
        var type = button.getAttribute('data-type');
        
        socket.emit(type, {
            id: id
        }, function () {
            
        });
        
        switch (type) {
            case 'restart-command':
            case 'stop-command':
                that.setState(undefined);
                break;
        }
    });
}

OutputBlock.prototype.setState = function (state) {
    var block = this.block;
    block.classList.remove('running');
    block.classList.remove('stopped');
    
    if (state) {
        block.classList.add(state);
    }
};

OutputBlock.prototype.append = function (html) {
    var pre = this.pre;
    var atBottom = pre.scrollHeight === pre.scrollTop + pre.clientHeight;
    
    var temp = document.createElement('div');
    temp.innerHTML = html;
    
    var fragment = document.createDocumentFragment();
    
    while (temp.childNodes.length) {
        fragment.appendChild(temp.childNodes[0]);
    }
    
    pre.appendChild(fragment);
    
    if (atBottom) {
        pre.scrollTop = pre.scrollHeight - pre.clientHeight;
    }
};