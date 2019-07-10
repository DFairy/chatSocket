const socket = io('http://localhost:4000');
// const timer = ''
init();

function $(id) {
    return document.getElementById(id)
}
// 追加内容
function append(parent, text) {
    if (typeof text === 'string') {
        var temp = document.createElement('div');
        temp.innerHTML = text;
        // 防止元素太多 进行提速
        var frag = document.createDocumentFragment();
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        parent.appendChild(frag);
    } else {
        parent.appendChild(text);
    }
}

function init() {
    for (var i = 0; i < 141; i++) {
        let html = '<li id=' + i + '><img src="img/emoji/emoji (' + (i + 1) + ').png"></li>'
        append($('emoji'), html);
    }
}
$('nameBtn').addEventListener('click', () => {
    let index = Math.floor(Math.random() * 4) + 1
    const value = $('inputName').value
    if (value) {
        socket.emit('login', {
            name: value,
            img: `img/user${index}.jpg`
        })
    } else {
        alert('请输入昵称')
    }
})

$('send').addEventListener('click', () => {
    let txt = $('txt').value
    if (txt == '') {
        alert('请输入内容')
        return false
    }
    socket.emit('sendMsg', {
        msg: txt,
        type: 'text'
    })
    $('txt').value = ''
})

$('shake').addEventListener('click', () => {
    socket.emit('shake');
})

$('smile').addEventListener('click', () => {
    $('emojiSmile').style.display = 'block'
})
$('txt').addEventListener('click', () => {
    $('emojiSmile').style.display = 'none'
})
$('file').addEventListener('change', (e) => {
    var reader = new FileReader();
    reader.onerror = function() {
        console.log('读取文件失败，请重试！');
    };
    reader.onload = function() {
        var src = reader.result; // 读取结果
        var img = '<img class="sendImg" src="' + src + '">';
        socket.emit('sendMsg', { // 发送
            msg: img,
            type: 'img'
        });
    };
    reader.readAsDataURL($('file').files[0]);

})

$('emoji').addEventListener('click', (e) => {
    let src = e.path[0].src
    let emoji = src.replace(/\D*/g, '').substr(6, 8);
    let old = $('txt').value;
    $('txt').value = old + '[emoji' + emoji + ']';
    $('emojiSmile').style.display = 'none'
})

socket.on('loginSuc', () => {
    $('name').style.display = "none"
})
socket.on('loginError', () => {
    alert('用户名已存在')
    $('inputName').value = ''
})
socket.on('system', (data) => {
    let now = new Date().toTimeString().substr(0, 8);
    let html = `<div class="system">
                    <div>${now}</div>
                    <br/>
                    <div>${data.name}${data.status}了聊天室</div>
                </div>`
    append($('message'), html)
    $('message').scrollTo(0, $('message').clientHeight)
})
socket.on('receiveMsg', obj => {
    let msg = obj.msg;
    let html = ''
        // 提取文字中的表情加以渲染
    var content = '';
    while (msg.indexOf('[') > -1) { // 其实更建议用正则将[]中的内容提取出来
        var start = msg.indexOf('[');
        var end = msg.indexOf(']');

        content += '<span>' + msg.substr(0, start) + '</span>';
        content += '<img src="img/emoji/emoji%20(' + msg.substr(start + 6, end - start - 6) + ').png" class="emojiImg">';
        msg = msg.substr(end + 1, msg.length);
    }
    content += '<span>' + msg + '</span>';
    if (obj.side == 'right') {
        html = `<div class="right">
                <div class="user-content">
                    <p>${content}</p>
                </div>
                <img src="${obj.img}" class='avatar' alt="">
            </div>`
    } else {
        html = `<div class="left">
                <img src="${obj.img}" class='avatar' alt="">
                <div class="user-content">
                    <div>${obj.name}</div>
                    <p>${content}</p>
                </div>
            </div>`
    }
    append($('message'), html)
    $('message').scrollTo(0, $('message').clientHeight)
})
socket.on('allUser', userInfo => {
    $('users').innerHTML = ''
    let html = ''
    let len = userInfo.length

    $('num').innerText = len
    for (let i = 0; i < len; i++) {
        html += `<li>
                    <img src="${userInfo[i].img}" alt="">
                    <div class="nickname">${userInfo[i].name}</div>
                </li>`
    }
    $('users').innerHTML = html
})
socket.on('shake', (data) => {
    let now = new Date().toTimeString().substr(0, 8);
    let html = `<div class="system">
                    <div>${now}</div>
                    <br/>
                    <div>${data.name}发送了窗口振动</div>
                </div>`
    append($('message'), html)
    $('main').className = 'shaking'
    setTimeout(() => {
        $('main').className = ''
    }, 500)
    $('message').scrollTo(0, $('message').clientHeight)
})