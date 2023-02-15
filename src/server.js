const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const app = express()

const { formatMessage } = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/user')
const PORT = process.env.PORT || 3333

const server = http.createServer(app)
const io = socketio(server)

app.use('/', express.static(__dirname + '/public'))

const chatBot = 'Chat App Bot'

io.on('connection', (socket) => {
    console.log("Connection", socket.id)
    socket.on('joinRoom', (data) => {
        // Send to the user that is connecting
        const user = userJoin(socket.id, data.username, data.room)
        socket.join(user.room)

        socket.emit('message', formatMessage(chatBot, 'Welcome to Chat App!'))

        // Notify all other users that a user has just joined
        socket.broadcast.to(user.room).emit('message', formatMessage(chatBot, `${user.username} has joined the chat`))

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    socket.on('chatMessage', (data) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, data))
    })

    // Notify all other users that a user has left the chat
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            socket.broadcast.to(user.room).emit('message', formatMessage(chatBot, `${user.username} has left the chat`))
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})

server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`)
})