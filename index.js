const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = 3000;

app.use(express.static('public'));

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
