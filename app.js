const express = require('express')
const app = express()
const http = require('http').Server()
const io = require('socket.io')(http)

let users = [] //储存登录用户
let userInfo = [] //储存用户姓名和头像

app.use('/', express.static(__dirname + 'www'))

io.on('connection', (socket) => {
    //渲染在线人员
    io.emit('allUser', userInfo)

    //登录、检测用户姓名
    socket.on('login', (user) => {

    })

    //发送抖动窗口
    socket.on('shake', () => {

    })

    //发送消息事件
    socket.on('sendMsg', data => {

    })

    //断开连接时
    socket.on('disconnect', () => {

    })
})


http.listen(3000)