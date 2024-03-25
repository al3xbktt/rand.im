var socket = io();
var connected = false;
var userName = 'cyb3rflare';
var room = '';

socket.on('connect', (data) =>{
    var userName= generateUsername();
    connected = true;
    if (userName) socket.emit('login',userName);
    setUser(userName);
});

socket.on('chatStart', (data) => {
    hideModal();
    clearChat();
    textAbility(true);
    room = data.room;
    peer = data.name;
    introduce(peer);
    setResponder(peer);
});

socket.on('chatEnd', (data) => {
    socket.leave(room);
    room = '';  
    leaveRoom(data);
    textAbility(false);
    socket.emit("waiting");

});

socket.on('disconnect', (data) => {

    console.log("connection terminated");
    textAbility(false);
    connected = false;
});

socket.on('disconnected', (data) => {

    textAbility(false);
    leaveRoom(data);
    socket.emit("waiting");
});

socket.on('rerolled', (data) => {

    textAbility(false);
    leaveRoom(data);
    socket.emit("waiting");
});

socket.on('chatMessage', (message) => {
    writeMessage(message,false);
});

socket.on('isTyping',(data) => {
    if (!isTyping())
        isTyping(data);
    
});

socket.on('loading', (data) => {

    if (data){
        showModal();
        textAbility(false);
    }
});

function emitMessage(text) {

    if (connected) {
        if (text.length > 0 && text.trim().length > 0){
            writeMessage(text,true);
            socket.emit('chatMessage', text);
            clearChatBar();
        };
    }

};

function emitTyping(data){
    if (connected) socket.emit('isTyping',data);
};

function reroll(){
    if (connected) {
        socket.emit('reroll');
        console.log(room);
    }
};

function generateUsername(){
    var name = 'User#' + Math.floor((Math.random() * 9999) + 1);
    return name;
};

function acceptUsername(name){

    socket.emit('setUsername',name);
    setUser(name);
};