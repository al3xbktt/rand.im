const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const io = require('socket.io')(http)
app.use("/public", express.static(__dirname + '/public'));
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/chatroom.html');
});

http.listen(PORT, 5001, () => {
  console.log(`Listening to ${PORT}`);
});





var queue = [];
var rooms = [];
var names = {};
var allUsers = {};

var findLonePeer = function(socket) {

  if (queue.length != 0){
    // there is someone in queue
    var peer = queue.pop();
    var room = socket.id + '#' + peer.id;
    // join peers into one room
    peer.join(room);
    socket.join(room);
    // register room to their names
    rooms[peer.id] = room;
    rooms[socket.id] = room;
    // exchange names
    peer.emit('chatStart', {name: names[socket.id],'room':room});
    socket.emit('chatStart', {name: names[peer.id],'room':room});
  }

  else{ 
    console.log(socket.id + " pushed into queue with username: " + socket.Username);
    queue.push(socket);
  }
};

io.on('connection', (socket) => {
  console.log('user #' + socket.id +' connected');
  
  socket.on('login', (data) => {
    names[socket.id] = data.username;
    console.log(data.username);
    allUsers[socket.id] = socket;
    findLonePeer(socket);
    console.log(socket.id + " logged in");
  });


  // chat message
  socket.on("chatMessage", (message) => {
    var room = rooms[socket.id];
    console.log('message from ' + socket.id + ': ' + message + ' in room: ' + room);
    socket.broadcast.to(room).emit("chatMessage", message);
  });
  
  socket.on('reroll', () => {
    var room = rooms[socket.id];
    socket.broadcast.to(room).emit('chatEnd');
    var peerID = room.split('#');
    peerID = peerID[0] === socket.id ? peerID[1] : peerID[0];
    // add both current and peer to the queue
    findPeerForLoneSocket(allUsers[peerID]);
    findPeerForLoneSocket(socket);
    });

  // disconnect
  socket.on("disconnect", () => {
    var room = rooms[socket.id];
    socket.broadcast.to(room).emit('chatEnd');
    var peerID = room.split('#');
    peerID = peerID[0] === socket.id ? peerID[1] : peerID[0];

    // add peer to queue
    findLonePeer(allUsers[peerID]);
  });

  socket.on('isTyping',(data)=>{
    var room = rooms[socket.id];
    if (data)
      socket.broadcast.to(room).emit('isTyping',data);
    if (!data)
      socket.broadcast.to(room).emit('isTyping',data);
  });

});

