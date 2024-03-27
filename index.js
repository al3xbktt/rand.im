const app = require('express')();
const express = require('express');
const bodyParser = require("body-parser");
const http = require('http').createServer(app);
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const io = require('socket.io')(http);
const Pool = require('pg').Pool;
var session = require('express-session')


const sessionMiddleware = session({
  secret: "471e296e02d268b260756579d15e0bd7",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({extended: true}));
app.use("/public", express.static(__dirname + '/public'));
app.use(cors());

//database connection
const pool = new Pool({
  user:'postgres',
  host:'localhost',
  database: 'rand.im',
  password: 'arbecket',
  port: '5432'

});

app.post("/api/login/create", (req,res,next) => {

 createUser(req,res,next);

});

app.post("/api/login/check", (req,res,next) => {

  checkUser(req,res,next);
  
 });

 app.post("/api/login/authenticate", (req,res,next) => {

  authenticateUser(req,res,next);
  
 });

const insertUser = "INSERT INTO users (username,password) VALUES ($1,crypt( $2, gen_salt('bf')))"
const checkSQL = "SELECT EXISTS (SELECT 1 FROM users WHERE username = $1) AS it_does_exist"; 
const authenticate = "SELECT EXISTS (SELECT 1 FROM users WHERE username = $1 AND password=crypt( $2, password)) AS it_does_exist";



const authenticateUser = async (req, res, next) => {
  const { username,password } = req.body;
  try {
    const checkIn = await pool.query(authenticate, [
      username,
      password
    ]);
    var check = Object.values(checkIn.rows[0])[0] != false
    if (check){
      console.log("User " + username + " passed authentication");
    res
      .status(201)
      .json(check);
    }
    else {
      console.log("User " + username + " failed authentication");
      res
        .status(201)
        .json(check);
      }
    } catch (err) {
      console.error(err.message);
      const error = new Error("Something Went Wrong!");
      error.status = 500;
      next(error);
    }
};


const checkUser = async (req, res, next) => {
  const { username } = req.body;

  try {
    const checkIn = await pool.query(checkSQL, [
      username,
    ]);
    var check = Object.values(checkIn.rows[0])[0] != false
    if (check){
      console.log("User " + username + " does exist");
    res
      .status(201)
      .json(check);
    }
    else {
      console.log("User " + username + " does not exist");
      res
        .status(201)
        .json(check);
      }
    } catch (err) {
      console.error(err.message);
      const error = new Error("Something Went Wrong!");
      error.status = 500;
      next(error);
    }
};


const createUser = async (req, res, next) => {
  const { username,password } = req.body;

  try {
    const create = await pool.query(insertUser, [
      username,
      password,
    ]);

    res
      .status(201)
      .json({ message: "User Created Successfully!", user: create.rows[0] });
  } catch (err) {
    // If UNIQUE constraint is violated
    if (err.code == "23505") {
      console.error(err.message);
      const error = new Error("Username Already Exists!");
      error.status = 400;
      next(error);
    } else {
      console.error(err.message);
      const error = new Error("Something Went Wrong!");
      error.status = 500;
      next(error);
    }
  }
};

let connectedUsers = 0; // Counter for connected users

// Increment the connectedUsers counter on each connection
io.on('connection', (socket) => {
  socket.on('disconnect', () => {
   
  });

  // Send the initial count when a new user connects
});

// Endpoint to get the count of connected users
app.get('/connectedUsers', (req, res) => {
  res.json({ count: connectedUsers });
});

app.get('/alreadyExists', (req,res) => {
  res.json({ alreadyExists: check});
});


app.get('/name', (req, res) => {
  res.sendFile(__dirname + '/Userpage.html');
});

app.get('/profiles', (req, res) => {
  res.sendFile(__dirname + '/profiles.html');
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
  connectedUsers++;
  console.log('user #' + socket.id +' connected. Total users: ' + connectedUsers);


  socket.on('login', (data) => {
    names[socket.id] = data;
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
    connectedUsers--;
    console.log('user #' + socket.id +' disconnected. Total users: ' + connectedUsers);
    io.emit('connectedUsersCount', connectedUsers); // Emit the updated count
    var room = rooms[socket.id];
    socket.broadcast.to(room).emit('chatEnd',names[socket.id]);
    socket.broadcast.to(room).emit('disconnected',names[socket.id]);
    allUsers[socket.id] = null;
    rooms[socket.id] = null;
    removeFromQueue(socket);
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

  io.emit('connectedUsersCount', connectedUsers);

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

