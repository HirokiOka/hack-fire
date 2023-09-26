const socket = io();

let codeStack = [];

socket.on('connect', () => {
  console.log('connected to server: main');
  socket.on('message', (msg) => {
    const receivedData = JSON.parse(JSON.stringify(msg, '')).map(v => v['text']);
    codeStack = receivedData;
    console.log(codeStack);
  });
});


function setup() {
  createCanvas(720, 480); 
  background(200);
  textSize(24);
}

function draw() {
  background(200);
  fill('skyblue');
  rect(0, 0, width/2, height);
  fill('black');
  text("Player1", 0, 20);

  codeStack.forEach((line, i) => {
    text(line, 0, i * 24 + 40);
  });

  fill('pink');
  rect(width/2, 0, width/2, height);
  fill('black');
  text("Player2", width/2, 20);
}
