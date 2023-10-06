const express = require('express');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const PORT = 3000;
const io = socketIo(server);


app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('client connected');

  socket.on('playerOne', (data) => {
    console.log(data);
    io.emit('playerOne', data);
    console.log('emmitted');
  });

  socket.on('playerTwo', (data) => {
    console.log(data);
    io.emit('playerTwo', data);
    console.log('emmitted');
  });

});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/display', (req, res) => {
  res.sendFile(__dirname + '/public/display.html');
});

app.get('/player1', (req, res) => {
  res.sendFile(__dirname + '/public/player1.html');
});

app.get('/player2', (req, res) => {
  res.sendFile(__dirname + '/public/player2.html');
});

server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
