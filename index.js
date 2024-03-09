const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const io = require('socket.io')(http)


app.use("/public", express.static(__dirname + '/public'));

app.use(cors());

io.on('connection', (socket) => {
  console.log('user #' + socket.id +' connected');
  
  socket.on("sendMessage", message => {
    console.log('message from ' + socket.id + ': ' + message);
  });

  socket.on("disconnect", () => {
    console.log('user #' + socket.id + ' disconnected');
  });

});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/chatroom.html');
});

http.listen(PORT, 5001, () => {
  console.log(`Listening to ${PORT}`);
});

