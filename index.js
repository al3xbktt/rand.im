
const express = require('express');
const path = require('path');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use("/public", express.static(__dirname + '/public'));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/chatroom.html');
  });
  
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log ('a user disconnected');
    });
});

  server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
  });
  
  io.on('connection', (socket) => {
    socket.on('chatmessage', (msg) => {
      console.log('message:'  + msg);
    });
  });

  
