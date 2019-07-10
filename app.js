const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

let users = [] //储存登录用户
let userInfo = [] //储存用户姓名和头像

app.use('/', express.static(__dirname + '/www'))
io.on('connection', (socket) => {
    //渲染在线人员
    io.emit('allUser', userInfo)

    //登录、检测用户姓名
    socket.on('login', (user) => {
        if (users.indexOf(user.name) > -1) {
            socket.emit('loginError')
        } else {
            users.push(user.name)
            userInfo.push(user)
            socket.emit('loginSuc')
            socket.nickname = user.name
            io.emit('system', {
                name: user.name,
                status: '进入'
            })
            io.emit('allUser', userInfo)
            console.log(users.length)
        }
    })

    //发送抖动窗口
    socket.on('shake', () => {
        socket.emit('shake', {
            name: '您'
        })
        socket.broadcast.emit('shake', {
            name: socket.nickname
        });
    })

    //发送消息事件
    socket.on('sendMsg', data => {
        let img = ''
        for (var i = 0; i < userInfo.length; i++) {
            if (userInfo[i].name == socket.nickname) {
                img = userInfo[i].img;
            }
        }
        socket.broadcast.emit('receiveMsg', {
            name: socket.nickname,
            msg: data.msg,
            img: img,
            type: data.type,
            side: 'left'
        })
        socket.emit('receiveMsg', {
            name: socket.nickname,
            msg: data.msg,
            img: img,
            type: data.type,
            side: 'right'
        })
    })

    //断开连接时
    socket.on('disconnect', () => {
        var index = users.indexOf(socket.nickname);
        if (index > -1) {
            users.splice(index, 1)
            userInfo.splice(index, 1)
            io.emit('system', {
                name: socket.nickname,
                status: '离开'
            })
            io.emit('allUser', userInfo)
        }
    })
})


http.listen(4000, function() {
    console.log('listen 4000 port.');
});