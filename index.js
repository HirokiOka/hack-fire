const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, 'public');
const viewPath = path.join(publicPath, 'views');

app.use(express.static(publicPath));


//Routing
const pages = ['/', '/game', '/description', '/mode_select', '/p1_title', '/p1_desc', '/player1', '/p2_title', '/p2_desc', '/player2'];

pages.forEach((page) => {
  app.get(page, (_, res) => {
    res.sendFile(path.join(viewPath, page.endsWith('/') ? '/index.html' : page + '.html'));
  });
});

//socket
function handlePlayerEvent(socket, player) {
  socket.on(player, (data) => {
    console.log(`[${player}]`, data);
    io.emit(player, data);
    if (['cancel', 'join'].includes(data)){
      io.emit(data, data);
    }
  });
}

io.on('connection', (socket) => {
  console.log('client connected');

  handlePlayerEvent(socket, 'playerOne');
  handlePlayerEvent(socket, 'playerTwo');

  const events = ['gameStart', 'gameOver', 'coding'];
  events.forEach((event) => {
    socket.on(event, (data) => {
      console.log(event);
      io.emit(event, data);
    });
  });
});

server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
