import io from 'socket.io-client';

const socket = io({
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

socket.on('connection', () => {
  console.log('connected to server: title');
});

socket.on('gameStart', (msg) => {
  console.log(msg);
  window.location.href = '/game';
});
