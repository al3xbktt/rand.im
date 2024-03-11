var socket = io();
var connected = false;
var userName = 'cyb3rflare';
var room = '';


socket.on('connect', (data) =>{
    connected = true;
    if (userName) socket.emit('login', {"username :" : userName});
});

socket.on('chatStart', (data) => {
    clearChat();
    room = data.room;

});

socket.on('chatEnd', (data) => {
    
    socket.leave(room);
    room = '';  

});

socket.on ('disconnect', (data) => {

    console.log("connection terminated");

});

socket.on('chatMessage', (message) => {
    writeMessage(message,false);
});

socket.on('isTyping',(data) => {
    if (!isTyping())
        isTyping(data);
    
    
});

function emitMessage(text) {

    if (connected) socket.emit('chatMessage', text);
  
};

function emitTyping(data){
    if (connected) socket.emit('isTyping',data);
};