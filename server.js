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
const CODE_DB_COLLECTION = process.env.CODE_DB_COLLECTION;
const SURVEY_DB_COLLECTION = process.env.SURVEY_DB_COLLECTION;
const publicPath = path.join(__dirname, 'public');
const viewPath = path.join(publicPath, 'views');

let isPlayerOneJoined = false;
let isPlayerTwoJoined = false;
let isPlayerOneReady = false;
let isPlayerTwoReady = false;
let isPlayerOneRetry = false;
let isPlayerTwoRetry = false;
let gameId = null;
let playerOneCode = [];
let playerTwoCode = [];

app.use(express.static(publicPath));
app.use(express.json());

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

async function sendEventDataToMongo(eventName, codeStack=null) {
  try {
    const database = client.db(DB_NAME);
    const col = database.collection(CODE_DB_COLLECTION);
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

async function sendSurveyDataToMongo(data) {
  try {
    const database = client.db(DB_NAME);
    const col = database.collection(SURVEY_DB_COLLECTION);
    if (gameId === null) gameId = Date.now().toString();
    const postData = {
      insertedAt: new Date(),
      gameId: gameId,
      timing: data.timing,
      playerId: data.playerId,
      surveyValue: data.surveyValue,
    };
    const result = await col.insertOne(postData);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  }
}
//Routing

app.post('/survey', (req, res) => {
  const surveyData = {
    timing: req.body.timing,
    playerId: req.body.playerId,
    surveyValue: req.body.surveyValue,
  };
  sendSurveyDataToMongo(surveyData)
    .then((res) => res.status(200).send('Survey data sent to MongoDB'))
    .catch((err) => res.status(400).json('Error: ' + err));
});

const pages = ['/', '/game', '/description', '/mode_select', '/p1_title', '/p1_desc', '/player1', '/p2_title', '/p2_desc', '/player2', '/p1Survey', '/p2Survey', '/p1PostSurvey', '/p2PostSurvey'];
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
      sendEventDataToMongo('gameStart').catch(console.error);
    }
  });

  socket.on('transition', (_) => {
    console.log('transition');
  });

  socket.on('quit', (_) => {
    isPlayerOneJoined = false;
    isPlayerTwoJoined = false;
    io.emit('quit', 'quit');
    sendEventDataToMongo('quit').catch(console.error);
    isPlayerOneRetry = false;
    isPlayerTwoRetry = false;    
    gameId = null;
  });

  socket.on('gameOver', ({ result }) => {
    io.emit('gameOver', 'gameOver');
    sendEventDataToMongo(result).catch(console.error);
    isPlayerOneRetry = false;
    isPlayerTwoRetry = false;    
  });

  socket.on('retry', ({ playerId }) => {
    if (playerId === 'playerOne') isPlayerOneRetry = true;
    if (playerId === 'playerTwo') isPlayerTwoRetry = true;

    //if (isPlayerOneRetry && isPlayerTwoRetry) {
      io.emit('retry', 'retry');
      gameId = Date.now().toString();
      sendEventDataToMongo('retry').catch(console.error);
    //}
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
      sendEventDataToMongo('battleStart', codeStack).catch(console.error);
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

//exit ctrl+c
process.on('SIGINT', () => {
  client.close().then(() => {
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
});

//exit process
process.on('exit', (code) => {
  client.close().then(() => {
    console.log(`MongoDB connection closed with exit code ${code}`);
  });
});

//catch uncaught exception
process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  client.close().then(() => {
    process.exit(1);
  });
});
