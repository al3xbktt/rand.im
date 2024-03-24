const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const io = require('socket.io')(http);
app.use("/public", express.static(__dirname + '/public'));
app.use(cors());

let connectedUsers = 0; // Counter for connected users

// Increment the connectedUsers counter on each connection
io.on('connection', (socket) => {
  connectedUsers++;
  console.log('user #' + socket.id +' connected. Total users: ' + connectedUsers);

  socket.on('disconnect', () => {
    connectedUsers--;
    console.log('user #' + socket.id +' disconnected. Total users: ' + connectedUsers);
    io.emit('connectedUsersCount', connectedUsers); // Emit the updated count
  });

  // Send the initial count when a new user connects
  io.emit('connectedUsersCount', connectedUsers);
});

// Endpoint to get the count of connected users
app.get('/connectedUsers', (req, res) => {
  res.json({ count: connectedUsers });
});

app.get('/name', (req, res) => {
  res.sendFile(__dirname + '/Userpage.html');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Landingpage.html');
});

app.get('/privacypolicy', (req, res) => {
  res.sendFile(__dirname + '/privacypolicy.html');
});


http.listen(PORT, 5001, () => {
  console.log(`Listening to ${PORT}`);
});

app.get('/chatroom', (req, res) => {
  res.sendFile(__dirname + '/chatroom.html');
});


var queue = [];
var rooms = [];
var names = {};
var allUsers = {};

var findLonePeer = function(socket) {

  var inQueue;

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
    console.log(socket.id + " matched with " + peer.id + " in room: " + room );
    inQueue = false;
  }

  else{ 
    console.log(socket.id + " pushed into queue with username: " + names[socket.id]);
    queue.push(socket);
    inQueue = true;
    socket.emit('loading', inQueue);
    console.log("\ncurrent queue:");
    printArray(queue);
  }
};

io.on('connection', (socket) => {
  console.log('user #' + socket.id +' connected');
  
  socket.on('login', (data) => {
    names[socket.id] = data.username;
    allUsers[socket.id] = socket;
    findLonePeer(socket);
    console.log(socket.id + " logged in");
  });


  // chat message
  socket.on("chatMessage", (message) => {
    var room = rooms[socket.id];
    if (room != undefined ){
      if (message.length >= 0){
      console.log('message from ' + socket.id + ': "' + message + '" in room: ' + room);
      socket.broadcast.to(room).emit("chatMessage", message);
      }
    }
  });
  
  socket.on('reroll', () => {
    var room = rooms[socket.id];
    socket.broadcast.to(room).emit('chatEnd',names[socket.id]);
    if (room!=null){
    var peerID = room.split('#');
    peerID = peerID[0] === socket.id ? peerID[1] : peerID[0];
    socket.leave(room);
    socket.broadcast.to(room).emit('rerolled',names[socket.id]);
    rooms[socket.id] = null;
    console.log(socket.id + " hit reroll!");
    }
    // add current to the queue 
    findLonePeer(socket);
    });

  // disconnect
  socket.on("disconnect", () => {
    var room = rooms[socket.id];
    socket.broadcast.to(room).emit('chatEnd',names[socket.id]);
    console.log(socket.id + " disconnected.");
    socket.broadcast.to(room).emit('disconnected',names[socket.id]);
    allUsers[socket.id] = null;
    rooms[socket.id] = null;
    removeFromQueue(socket);
    console.log("Due to Disconnect, queue is now:");
    printArray(queue);
  });

  socket.on("waiting", () => {
    var room = rooms[socket.id];
    console.log(socket.id + " is alone, waiting on reroll");
    socket.leave(room);
    rooms[socket.id] = null;
  });

  socket.on('isTyping',(data)=>{
    var room = rooms[socket.id];
    if (data)
      socket.broadcast.to(room).emit('isTyping',data);
    if (!data)
      socket.broadcast.to(room).emit('isTyping',data);
  });

  socket.on('loading',(data)=>{
    var room = rooms[socket.id];
    if (data)
      socket.broadcast.to(room).emit('loading',data);
    if (!data)
      socket.broadcast.to(room).emit('loading',data);
  });

  socket.on('setUsername',(data) =>{
    socket.data.userName = data;
    names[socket.id] = data;
  });

});

function printArray(array){

  array.forEach(function(x){
    console.log(x.id + '\n');
  });

}

function removeFromQueue(socket){

  var index = queue.indexOf(socket);
  if (index != -1){
    queue.splice(index,1);
  }
}