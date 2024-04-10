var socket = io();
var connected = false;
var userName = 'cyb3rflare';
var room = '';
var myStream;
var peerStream;
var peerVideo;
var videoSwitch = true;
var micSwitch = true;
var currentCall;

var setMyStream = function(stream){
    myStream = stream;
}

var setPeerStream = function(stream){
    peerStream = stream;
}

var setMyCall = function(call){
    currentCall = call;
}

var setMyName = function(name){
    userName = name;
}

var setPeerVideo = function(video){
    peerVideo = video;
}

navigator.mediaDevices.getUserMedia({

    video: true,
    audio: true

}).then(stream => {
    if (typeof(stream) === 'undefined'){
    const audioTrack = createEmptyAudioTrack();
    const videoTrack = createEmptyVideoTrack({ width:640, height:480 });
    const mediaStream = new MediaStream([audioTrack, videoTrack]);
    addVideoStream(myVideo,mediaStream)
    setMyStream(mediaStream);
    }
    else {
        setMyStream(stream);
    }
    myPeer.on('call', call => {
        call.answer(myStream);
        const video = document.createElement('video');
        call.on('stream',myStream => {
            addVideoStream(video,myStream,true);
        })
    })
}).catch(err => {

    if (err = 'NotAllowedError'){
        const audioTrack = createEmptyAudioTrack();
        const videoTrack = createEmptyVideoTrack({ width:640, height:480 });
        const mediaStream = new MediaStream([audioTrack, videoTrack]);
        addVideoStream(myVideo,mediaStream)
        setMyStream(mediaStream);
    }
    
    if (err = 'NotFoundError'){
        const audioTrack = createEmptyAudioTrack();
        const videoTrack = createEmptyVideoTrack({ width:640, height:480 });
        const mediaStream = new MediaStream([audioTrack, videoTrack]);
        addVideoStream(myVideo,mediaStream)
        setMyStream(mediaStream);
    }

    if (err = 'TypeError'){
        const audioTrack = createEmptyAudioTrack();
        const videoTrack = createEmptyVideoTrack({ width:640, height:480 });
        const mediaStream = new MediaStream([audioTrack, videoTrack]);
        addVideoStream(myVideo,mediaStream)
        setMyStream(mediaStream);
    }

});


// SOCKET.IO
socket.on('connect', (data) =>{
    
    if (socket.userName == undefined)
         setMyName(generateUsername());
    else
        setMyName(socket.userName);
    connected = true;

    if (connected) socket.emit('login', userName);
    showMediaModal();
});

socket.on('chatStart', (data) => {
    micSwitch = true;
    if (!videoSwitch)
        toggleVideo(myStream);
    setMyName(data.myname);
    hideLoadModal();
    hideMediaModal();
    clearChat();
    textAbility(true);
    room = data.room;
    peer = data.name;
    replaceCard(false,peer);
    introduce(peer);
    setResponder(peer);
    switchMic(true,false);
    switchMic(false,false);
    setUser(data.myname);
    socket.emit("peerID",myPeer.id);
});


socket.on('videoStart', (data) => {
    connectToCall(data,myStream);
    toggleVideo(myStream);
    toggleMic(myStream);
});


socket.on('chatEnd', (data) => {
    socket.leave(room);
    room = '';  
    leaveRoom(data);
    textAbility(false);
    if (!micSwitch)
        toggleMic(myStream);
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

socket.on('peerMutedMic', (data) => {

    switchMic(false,false);
    
});


socket.on('peerUnMutedMic', (data) => {

    switchMic(false,true);
    
});

socket.on('peerMuted', (data) => {

    replaceCard(false,data);

});


socket.on('peerUnMuted', (data) => {

    addVideoStream(peerVideo,peerStream,true);
    
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
        showLoadModal();
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

function mediaAnswer(data){
    if (data === true){
        hideMediaModal();
        if (connected) socket.emit('ready');
    }
    else if (data === false){
        hideMediaModal();
        const audioTrack = createEmptyAudioTrack();
        const videoTrack = createEmptyVideoTrack({ width:640, height:480 });
        const mediaStream = new MediaStream([audioTrack, videoTrack]);
        setMyStream(mediaStream);
        if (connected) socket.emit('ready');
    }
    
}

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
        socket.emit("videoMute");
        socket.emit("micMute")
        setPeerStream(stream);
        setPeerVideo(video);
        video.setAttribute("id","VideoPeer");
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
    if(stream.getVideoTracks().length > 0){
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

  function toggleMic(stream) {
    if(stream.getAudioTracks().length > 0){
      micSwitch = !micSwitch;
      if (micSwitch == false){
        socket.emit("micMute");
        switchMic(true,micSwitch);
      }
      else{
        socket.emit("micUnMute");
        switchMic(true,micSwitch);
      }
        stream.getAudioTracks()[0].enabled = micSwitch;
    }
  
  }

const createEmptyVideoTrack = ({ width, height }) => {
    const canvas = Object.assign(document.createElement('canvas'), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
  
    const stream = canvas.captureStream();
    const track = stream.getVideoTracks()[0];
  
    return Object.assign(track, { enabled: false });
  };
  
  const createEmptyAudioTrack = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    return Object.assign(track, { enabled: false });
  };
  


