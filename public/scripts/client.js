var socket = io();
var connected = false;
var userName = 'cyb3rflare';
var room = '';
var myStream;
var videoSwitch = true;
var micSwitch = true;
var currentCall;

var setMyStream = function(stream){
    myStream = stream;
}

var setMyCall = function(call){
    currentCall = call;
}

var setMyName = function(name){
    userName = name;
}


navigator.mediaDevices.getUserMedia({

    video: true,
    audio: true

}).then(stream => {
    addVideoStream(myVideo,stream)
    setMyStream(stream);

    myPeer.on('call', call => {
        call.answer(myStream);
        const video = document.createElement('video');
        call.on('stream',myStream => {
            addVideoStream(video,myStream,true);
        })
    })
});


// SOCKET.IO
socket.on('connect', (data) =>{
    if (socket.userName == undefined)
         setMyName(generateUsername());
    else
        setMyName(socket.username);
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
    setUser(data.myname);
    socket.emit("peerID",myPeer.id);
    console.log(myPeer.id);
});


socket.on('videoStart', (data) => {
    connectToCall(data,myStream);
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
    leaveRoom(data.name);
    socket.emit("waiting");
    disconnectFromCall(currentCall);
    
});

socket.on('peerMuted', (data) => {

    replaceCard(false,data);
    
});


socket.on('peerUnMuted', (data) => {

    video.show();
    
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
        socket.emit('reroll',myPeer.id);
    }
};

function generateUsername(){
    var name = 'User#' + Math.floor((Math.random() * 9999) + 1);
    return name;
};

function acceptUsername(name){

    socket.emit('setUsername',name);
    setUser(name);
    setMyName(name);
};

// PEERJS

const myPeer = new Peer(undefined, {
    host: "localhost",
    port: 9000,
    path: "/myapp",});

    const myVideo = document.createElement('video') // Create a new video tag to show our video
    myVideo.muted = true;

function connectToCall(userId, stream){
    console.log(userId + " " + stream);
    const call = myPeer.call(userId,stream);
    setMyCall(call);
    const video = document.createElement('video'); 
    call.on('stream', stream => {
        addVideoStream(video,stream,true);
        video.setAttribute("id","peerVideo");
    })
    call.on('close', () => {
        disconnectFromCall(call);
    })
}

function disconnectFromCall(call){

    call.close();
}

function addVideoStream(video, stream, isPeer) {
    video.srcObject = stream ;
    video.addEventListener('loadedmetadata', () => { // Play the video as it loads
        video.play()
    })
    if (!isPeer){
    $( "#userVideo" ).empty();        
    $( "#userVideo" ).append(video);        
    }
    if (isPeer){
        $( "#peerVideo" ).empty();        
        $( "#peerVideo" ).append(video);        
        }
}


function toggleVideo(stream) {
    if(stream != null && stream.getVideoTracks().length > 0){
      videoSwitch = !videoSwitch;
      if (videoSwitch == false){
        replaceCard(true,userName);
        socket.emit("videoMute");
      }
      else{
        const video = document.createElement('video');
        socket.emit("videoUnMute");
        addVideoStream(video,stream,false)
      }
        stream.getVideoTracks()[0].enabled = videoSwitch;
    }
  
  }


