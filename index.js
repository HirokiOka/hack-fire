const express = require('express');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const io = socketIo(server);


app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('client connected');

  socket.on('playerOne', (data) => {
    io.emit('playerOne', data);
    console.log('emmitted');
  });

  socket.on('playerTwo', (data) => {
    io.emit('playerTwo', data);
    console.log('emmitted');
  });

});


//Game Display
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/game', (req, res) => {
  res.sendFile(__dirname + '/public/game.html');
});

//Input Display
//player1
app.get('/p1_title', (req, res) => {
  res.sendFile(__dirname + '/public/p1_title.html');
});

app.get('/player1', (req, res) => {
  res.sendFile(__dirname + '/public/player1.html');
});

//player2
app.get('/p2_title', (req, res) => {
  res.sendFile(__dirname + '/public/p2_title.html');
});
app.get('/player2', (req, res) => {
  res.sendFile(__dirname + '/public/player2.html');
});

server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
