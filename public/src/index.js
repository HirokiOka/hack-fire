import io from 'socket.io-client';

const socket = io();
let playerOneJoin = false;
let playerTwoJoin = false;

socket.on('connection', () => {
  console.log('connected to server: title');
});

socket.on('playerOne', (msg) => {
  playerOneJoin = true;
  console.log('[p1]', msg);
  if (playerOneJoin && playerTwoJoin) window.location.href = '/game';
});

socket.on('playerTwo', (msg) => {
  playerTwoJoin = true;
  console.log('[p2]', msg);
  if (playerOneJoin && playerTwoJoin) window.location.href = '/game';
});
