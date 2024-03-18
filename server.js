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

  handlePlayerEvent(socket, 'playerOne');
  handlePlayerEvent(socket, 'playerTwo');

  const events = ['battleStart', 'gameOver', 'coding'];
  events.forEach((event) => {
    socket.on(event, (data) => {
      console.log(event, data);
      io.emit(event, data);
    });
  });
});

server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
