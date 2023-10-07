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


const textDict = {
  'こうげき': { 'code': 'shot();', 'codeType': 'action' },
  'ためる': { 'code': 'charge();', 'codeType': 'action' },
  'うえにうごく': { 'code': 'moveUp();', 'codeType': 'action' },
  'したにうごく': { 'code': 'moveDown();', 'codeType': 'action' },
  '止まる': { 'code': 'stop();', 'codeType': 'action' },
  'もし  -  なら': { 'code': 'if () {', 'codeType': 'if-start' },
  'もし  -  おわり': { 'code': '}', 'codeType': 'if-end' },
};

const conditionDict = {
  'おなじたかさ': { 'code': 'player.position === enemy.position', 'codeType': 'condition' },
  'あいてがこうげき': { 'code': 'enemy.isShooting === true', 'codeType': 'condition' },
  'あいてがためる': { 'code': 'enemy.isCharging === true', 'codeType': 'condition' }
};

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

  if (playerOneCodeStack.length !== 0) {
    playerOneCodeStack.forEach((codeText, i) => {
      let viewCode = '';
      if (codeText.includes('もし')) {
        viewCode = convertIf(codeText);
      } else {
        viewCode = 'playerOne.' + textDict[codeText].code;
      }
      text(viewCode, 0, i * 24 + 40);
    });
  }


  fill('pink');
  rect(width/2, 0, width/2, height);
  fill('black');
  textSize(24);
  text("Player2", width/2, 20);
  textSize(18);
  if (playerTwoCodeStack.length !== 0) {
    playerTwoCodeStack.forEach((codeText, i) => {
      let viewCode = '';
      if (codeText.includes('もし')) {
        viewCode = convertIf(codeText);
      } else {
        viewCode = 'playerTwo.' + textDict[codeText].code;
      }
      text(viewCode, width/2, i * 24 + 40);
    });
  }
  console.log(genExecCodeString(playerTwoCodeStack));

}

function convertIf(ifStatement) {
  if (ifStatement.includes('おわり')) return '}';
  const splitted = ifStatement.split('  ');
  const condition = splitted[1];
  const convertedCondition = conditionDict[condition].code;
  const result = `if (${convertedCondition}) {`;
  return result;
}

function genExecCodeString(codeStack, playerId) {
  const playerObj = playerId === 1 ? 'playerOne.': 'playerTwo.';
  let result = '';
  if(codeStack.length === 0) return;
  codeStack.forEach((codeText, i) => {
    let codeLine = '';
    if (codeText.includes('もし')) {
      codeLine = convertIf(codeText);
    } else {
      codeLine = playerObj + textDict[codeText].code;
    }
    result += '\n' + codeLine;
  });
  return result;
}
