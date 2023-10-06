const socket = io();

let playerOneCodeStack = [];
let playerTwoCodeStack = [];

socket.on('connection', () => {
  console.log('connected to server: main');
});

socket.on('playerOne', (msg) => {
  console.log('received: player1');
  const receivedData = JSON.parse(JSON.stringify(msg, '')).map(v => v['codeText']);
  playerOneCodeStack = receivedData;
});

socket.on('playerTwo', (msg) => {
  console.log('received: player2');
  const receivedData = JSON.parse(JSON.stringify(msg, '')).map(v => v['codeText']);
  playerTwoCodeStack = receivedData;
});

function setup() {
  createCanvas(900, 600); 
  background(200);
  textSize(24);
}

function draw() {
  background(200);
  fill('skyblue');
  rect(0, 0, width/2, height);
  fill('black');
  textSize(24);
  text("Player1", 0, 20);
  textSize(18);

  playerOneCodeStack.forEach((line, i) => {
    text(line, 0, i * 24 + 40);
  });


  fill('pink');
  rect(width/2, 0, width/2, height);
  fill('black');
  textSize(24);
  text("Player2", width/2, 20);
  textSize(18);
  playerTwoCodeStack.forEach((line, i) => {
    text(line, width/2, i * 24 + 40);
  });
}
