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
let gameId;
let playerOneCode = [];
let playerTwoCode = [];

app.use(express.static(publicPath));

const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

client.connect().then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

async function sendToMongo(eventName, codeStack=null) {
  try {
    const database = client.db(DB_NAME);
    const col = database.collection(DB_COLLECTION);
    const postData = {
      insertedAt: new Date(),
      gameId: gameId,
      event: eventName,
      codeStack: codeStack,
    };
    const result = await col.insertOne(postData);
    return result;
  } catch (err) {
    console.log(err);
  }
}

//Routing
const pages = ['/', '/game', '/description', '/mode_select', '/p1_title', '/p1_desc', '/player1', '/p2_title', '/p2_desc', '/player2', '/p1Survey', '/p2Survey'];

pages.forEach((page) => {
  app.get(page, (_, res) => {
    res.sendFile(path.join(viewPath, page.endsWith('/') ? '/index.html' : page + '.html'));
  });
});

//socket

io.on('connection', (socket) => {
  console.log('client connected');

  socket.on('join', ({ playerId }) => {
    if (playerId === 'playerOne') isPlayerOneJoined = true;
    if (playerId === 'playerTwo') isPlayerTwoJoined = true;

    if (isPlayerOneJoined && isPlayerTwoJoined) {
      io.emit('gameStart', 'gameStart');
      gameId = Date.now().toString();
      sendToMongo('gameStart').catch(console.error);
    }
  });

  socket.on('quit', (_) => {
    isPlayerOneJoined = false;
    isPlayerTwoJoined = false;
    io.emit('quit', 'quit');
    sendToMongo('quit').catch(console.error);
    isPlayerOneRetry = false;
    isPlayerTwoRetry = false;    
  });

  socket.on('gameOver', ({ result }) => {
    io.emit('gameOver', 'gameOver');
    sendToMongo(result).catch(console.error);
    isPlayerOneRetry = false;
    isPlayerTwoRetry = false;    
  });

  socket.on('retry', ({ playerId }) => {
    if (playerId === 'playerOne') isPlayerOneRetry = true;
    if (playerId === 'playerTwo') isPlayerTwoRetry = true;

    if (isPlayerOneRetry && isPlayerTwoRetry) {
      io.emit('retry', 'retry');
      gameId = Date.now().toString();
      sendToMongo('retry').catch(console.error);
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
      const codeStack = { p1: playerOneCode, p2: playerTwoCode };
      sendToMongo('battleStart', codeStack).catch(console.error);
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

// SIGINTシグナルを捕捉（例：Ctrl+Cによる終了）
process.on('SIGINT', () => {
  client.close().then(() => {
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
});

// プロセスのexitイベントを捕捉
process.on('exit', (code) => {
  client.close().then(() => {
    console.log(`MongoDB connection closed with exit code ${code}`);
  });
});

// 未処理の例外を捕捉
process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  client.close().then(() => {
    process.exit(1); // 0以外の終了コードでプロセスを終了
  });
});
