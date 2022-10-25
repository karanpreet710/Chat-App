$('.parent').show()
$('.chat-container').hide()
$('#join').click(() => {
    const socket = io()
    const username = $('#username').val()
    const room = $('#room').val()
    socket.emit('joinRoom', {
        username,
        room
    })
    $('.parent').hide()
    $('.chat-container').show()
    socket.on('roomUsers', (data) => {
        outputRoomName(data.room)
        outputUsers(data.users)
    })
    const chatForm = $('#chat-form')
    socket.on('message', (data) => {
        console.log(data)
        outputMessage(data)
        let chatMessages = document.getElementById('chat-messages')
        chatMessages.scrollTop = chatMessages.scrollHeight
    })

    chatForm.submit((event) => {
        event.preventDefault()
        const msg = $('#msg').val()
        // Send user's message to server
        socket.emit('chatMessage', msg)
        $('#msg').val('')
        $('#msg').focus()
    })
})

function outputMessage(data) {
    $('#chat-messages').append(`<div class="message">
                                    <p class="meta">${data.username} <span>${data.time}</span></p>
                                    <p class="text">
                                        ${data.text}
                                    </p>
                                </div>`)
}

function outputRoomName(room) {
    const roomName = $('#room-name')
    roomName.text(room)
}

function outputUsers(users) {
    const userList = $('#users')
    userList.empty()
    for (let user of users) {
        userList.append($(`
        <li>${user.username}</li>
        `))
    }
}