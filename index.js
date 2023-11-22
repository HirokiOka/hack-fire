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
    console.log('[p1]', data);
    io.emit('playerOne', data);
    if (data === 'cancel') io.emit('cancel', data);
    if (data === 'join') io.emit('join', data);
  });

  socket.on('playerTwo', (data) => {
    console.log('[p2]', data);
    io.emit('playerTwo', data);
    if (data === 'cancel') io.emit('cancel', data);
    if (data === 'join') io.emit('join', data);
  });

  socket.on('gameStart', (data) => {
    console.log('gameStart');
    io.emit('gameStart', data);
  });

  socket.on('gameOver', (data) => {
    console.log('game over');
    io.emit('gameOver', data);
  });

  socket.on('coding', (data) => {
    console.log('coding');
    setTimeout(() => {
      io.emit('coding', data);
    }, 1000);
  });

});


//Game Display
app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/game', (_, res) => {
  res.sendFile(__dirname + '/public/game.html');
});

app.get('/description', (_, res) => {
  res.sendFile(__dirname + '/public/description.html');
});

app.get('/mode_select', (_, res) => {
  res.sendFile(__dirname + '/public/mode_select.html');
});

//Input Display
//player1
app.get('/p1_title', (_, res) => {
  res.sendFile(__dirname + '/public/p1_title.html');
});

app.get('/p1_desc', (_, res) => {
  res.sendFile(__dirname + '/public/p1_desc.html');
});

app.get('/player1', (_, res) => {
  res.sendFile(__dirname + '/public/player1.html');
});

//player2
app.get('/p2_title', (_, res) => {
  res.sendFile(__dirname + '/public/p2_title.html');
});

app.get('/p2_desc', (_, res) => {
  res.sendFile(__dirname + '/public/p2_desc.html');
});

app.get('/player2', (_, res) => {
  res.sendFile(__dirname + '/public/player2.html');
});

server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
