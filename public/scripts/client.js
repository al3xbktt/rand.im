var socket = io();
var connected = false;
var userName = 'cyb3rflare';
var room = '';


socket.on('connect', (data) =>{
    console.log(data);
    if (userName) socket.emit('login', {"username :" : userName});
});

socket.on('chatStart', (data) => {
    hideModal();
    clearChat();
    textAbility(true);
    room = data.room;
    peer = data.name;
    introduce(peer);
});

socket.on('chatEnd', () => {
    socket.leave(room);
    room = '';  
    leaveRoom("test");
    textAbility(false);

});

socket.on ('disconnect', (data) => {

    console.log("connection terminated");

});

socket.on ('disconnected', (data) => {

    textAbility(false);
    leaveRoom("test");
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