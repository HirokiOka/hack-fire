import io from 'socket.io-client';

const socket = io({
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

socket.on('gameStart', (msg) => {
  socket.disconnect();
  window.location.href = '/game';
});
