const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const DB_COLLECTION = process.env.DB_COLLECTION;
const publicPath = path.join(__dirname, 'public');
const viewPath = path.join(publicPath, 'views');

let isPlayerOneJoined = false;
let isPlayerTwoJoined = false;
let isPlayerOneReady = false;
let isPlayerTwoReady = false;
let isPlayerOneRetry = false;
let isPlayerTwoRetry = false;

app.use(express.static(publicPath));

const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function sendToMongo(postData) {
  try {
    await client.connect();
    const database = client.db(DB_NAME);
    const col = database.collection(DB_COLLECTION);
    const result = await col.insertOne(postData);
    return result;
  } finally {
    await client.close();
  }
}

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
    console.log(`[${player}] data`);
    io.emit(player, data);
    if (['quit', 'join'].includes(data)){
      io.emit(data, data);
      const postData = {
        player,
        event: data,
        insertedAt: new Date(),
      };
      //sendToMongo(postData).catch(console.error);
    }
  });
}



io.on('connection', (socket) => {
  console.log('client connected');

  socket.on('join', ({ playerId }) => {
    if (playerId === 'playerOne') isPlayerOneJoined = true;
    if (playerId === 'playerTwo') isPlayerTwoJoined = true;

    if (isPlayerOneJoined && isPlayerTwoJoined) {
      io.emit('gameStart', 'gameStart');
    }
  });

  socket.on('quit', (_) => {
    isPlayerOneJoined = false;
    isPlayerTwoJoined = false;
    io.emit('quit', 'quit');
    isPlayerOneRetry = false;
    isPlayerTwoRetry = false;    
  });

  socket.on('gameOver', (_) => {
    io.emit('gameOver', 'gameOver');
    isPlayerOneRetry = false;
    isPlayerTwoRetry = false;    
  });

  socket.on('retry', ({ playerId }) => {
    if (playerId === 'playerOne') isPlayerOneRetry = true;
    if (playerId === 'playerTwo') isPlayerTwoRetry = true;

    if (isPlayerOneRetry && isPlayerTwoRetry) {
      io.emit('retry', 'retry');
    }
  });

  socket.on('submit', ({ playerId, data }) => {
    if (playerId === 'playerOne') {
      isPlayerOneReady = true;
      playerOneCode = data;
      io.emit('playerOneReady', { code: data });
    }
    if (playerId === 'playerTwo') {
      isPlayerTwoReady = true;
      playerTwoCode = data;
      io.emit('playerTwoReady', { code: data });
    }

    if (isPlayerOneReady && isPlayerTwoReady) {
      io.emit('battleStart', 'battleStart');
      isPlayerOneReady = false;
      isPlayerTwoReady = false;
    }
  });

  socket.on('coding', (_) => {
    isPlayerOneReady = false;
    isPlayerTwoReady = false;
    io.emit('coding', 'coding');
  });

});

server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
