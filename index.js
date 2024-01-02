const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const io = socketIo(server);
/*
const { Client } = require('pg');

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

client.connect().then(() => console.log('DB connected successfully'));
*/

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
const viewPath = path.join(__dirname, '/public', '/views');
app.get('/', (_, res) => {
  res.sendFile(viewPath + '/index.html');
});

app.get('/game', (_, res) => {
  res.sendFile(viewPath + '/game.html');
});

app.get('/description', (_, res) => {
  res.sendFile(viewPath + '/description.html');
});

app.get('/mode_select', (_, res) => {
  res.sendFile(viewPath + '/mode_select.html');
});

//Input Display
//player1
app.get('/p1_title', (_, res) => {
  res.sendFile(viewPath + '/p1_title.html');
});

app.get('/p1_desc', (_, res) => {
  res.sendFile(viewPath + '/p1_desc.html');
});

app.get('/player1', (_, res) => {
  res.sendFile(viewPath + '/player1.html');
});

//player2
app.get('/p2_title', (_, res) => {
  res.sendFile(viewPath + '/p2_title.html');
});

app.get('/p2_desc', (_, res) => {
  res.sendFile(viewPath + '/p2_desc.html');
});

app.get('/player2', (_, res) => {
  res.sendFile(viewPath + '/player2.html');
});

server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
