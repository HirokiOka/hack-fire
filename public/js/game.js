const socket = io();

const SHOT_MAX_COUNT = 10;
const GAME_INTERVAL = 20;
const BACKGROUND_STAR_MAX_COUNT = 100;
const BACKGROUND_STAR_MAX_SIZE = 3;
const BACKGROUND_STAR_MAX_SPEED = 4;
let playerOne;
let playerTwo;
let playerOneShotArray = [];
let playerTwoShotArray = [];
let backgroundStarArray = [];
let kaiso, hackgen;
let roundCount = 1;
let playerOneExeIndex = 0;
let playerTwoExeIndex = 0;
let isGameover = false;
let isPlayerOneReady = false;
let isPlayerTwoReady = false;
let isGameRunning = false;
let exeCount = GAME_INTERVAL;

let barOffset;
let barWidth;
let topEdge = 0;
let bottomEdge = 0;
let gameHeight = 0;
let TOP = 0;
let BOTTOM = 0;

let playerOneCodeStack = [];
let playerTwoCodeStack = [];
let playerOneCode = [];
let playerTwoCode = [];
const textDict = {
  'こうげき': { 'code': 'shot();', 'codeType': 'action' },
  'ためる': { 'code': 'charge();', 'codeType': 'action' },
  'カウンター': { 'code': 'counterAttack();', 'codeType': 'action' },
  'うえにうごく': { 'code': 'moveUp();', 'codeType': 'action' },
  'したにうごく': { 'code': 'moveDown();', 'codeType': 'action' },
  'もし  -  なら': { 'code': 'if () {', 'codeType': 'if-start' },
  'もし  -  おわり': { 'code': '}', 'codeType': 'if-end' },
};
const conditionDict = {
  'おなじたかさ': { 'code': 'playerOne.y === playerTwo.y', 'codeType': 'condition' },
  'ちがうたかさ': { 'code': 'playerOne.y !== playerTwo.y', 'codeType': 'condition' },
  'おなじたかさ': { 'code': 'playerOne.y === playerTwo.y', 'codeType': 'condition' },
  'ちがうたかさ': { 'code': 'playerOne.y !== playerTwo.y', 'codeType': 'condition' }
};

//Process related to Socket.io 
socket.on('connection', () => {
  console.log('connected to server: main');
});

//Get and exec Codes
socket.on('playerOne', (msg) => {
  console.log('received: player1');
  const receivedData = JSON.parse(JSON.stringify(msg, ''));
  playerOneCodeStack = receivedData;
  isPlayerOneReady = true;
  playerOneCode = getJSCodeString(playerOneCodeStack, 1);
  if (isPlayerOneReady && isPlayerTwoReady && !isGameRunning) {
    isGameRunning = true;
  }
});

socket.on('playerTwo', (msg) => {
  console.log('received: player2');
  const receivedData = JSON.parse(JSON.stringify(msg, ''));
  playerTwoCodeStack = receivedData;
  playerTwoCode = getJSCodeString(playerTwoCodeStack, 2);
  isPlayerTwoReady = true;
  if (isPlayerOneReady && isPlayerTwoReady && !isGameRunning) {
    isGameRunning = true;
  }
});

//Init Sounds
let explodeSound = new Sound();
explodeSound.load('../sound/explode.mp3', (error) => {
    if (error != null) {
        alert('ファイルの読み込みエラーです．');
        return;
    }
});

let shotSound = new Sound();
shotSound.load('../sound/shot.mp3', (error) => {
    if (error != null) {
        alert('ファイルの読み込みエラーです．');
        return;
    }
});

let hitSound = new Sound();
hitSound.load('../sound/hit.mp3', (error) => {
    if (error != null) {
        alert('ファイルの読み込みエラーです．');
        return;
    }
});

//p5.js Process
function preload() {
  kaiso = loadFont('../font/kaiso_up/Kaisotai-Next-UP-B.otf');
  hackgen = loadFont('../font/HackNerdFont-Regular.ttf');
}

function setup() {
  let canvas = createCanvas(1920, 1080, P2D);
  barOffset = width/24;
  barWidth = width/24;
  topEdge = height / 3 - barOffset;
  bottomEdge = height * 2 / 3 + barOffset;
  gameHeight = bottomEdge - topEdge;
  canvas.parent('canvas');
  background('#3b4279');

  //Init Players
  playerOne = new Player("🚀", barOffset*3, gameHeight/2 + topEdge, 40, 40);
  playerOne.setVectorFromAngle(HALF_PI);
  playerOne.setTarget(playerTwo);

  playerTwo = new Player("👾", width-barOffset*3, gameHeight/2 + topEdge, 40, 40);
  playerTwo.setVectorFromAngle(-HALF_PI);
  playerTwo.setTarget(playerOne);

  for (let i = 0; i < SHOT_MAX_COUNT; i++) {
    playerOneShotArray[i] = new Shot(-100, -100, 32, 32);
    playerOneShotArray[i].setTarget(playerTwo);
    playerOneShotArray[i].setOwner(playerOne);
    playerOneShotArray[i].setVectorFromAngle(HALF_PI);
    playerOneShotArray[i].setPower(playerOne.power);
    //playerOneShotArray[i].setSound(shotSound);

    playerTwoShotArray[i] = new Shot(0, 0, 32, 32);
    playerTwoShotArray[i].setTarget(playerOne);
    playerOneShotArray[i].setOwner(playerTwo);
    playerTwoShotArray[i].setVectorFromAngle(-HALF_PI);
    playerTwoShotArray[i].setPower(playerTwo.power);
    //playerTwoShotArray[i].setSound(shotSound);
  }
  playerOne.setShotArray(playerOneShotArray);
  playerTwo.setShotArray(playerTwoShotArray);

  //Init Background Star
  for (let i = 0; i < BACKGROUND_STAR_MAX_COUNT; i++) {
      let size = random(1, BACKGROUND_STAR_MAX_SIZE);
      let speed = random(1, BACKGROUND_STAR_MAX_SPEED);
      backgroundStarArray[i] = new BackgroundStar(size, speed);
      let x = random(width);
      let y = random(height);
      backgroundStarArray[i].set(x, y);
  }
}

function draw() {
  background('#3b4279');

  //Update Characters
  textFont('Georgia');
  playerOne.update();
  playerTwo.update();
  playerOneShotArray.map(v => v.update());
  playerTwoShotArray.map(v => v.update());

  textFont(kaiso);
  textAlign(CENTER);
  if (playerOne.life === 0 || playerTwo.life === 0) {
    if (!isGameover) {
      explodeSound.play();
      isGameover = true;
      isGameRunning = false;
      textSize(72);
    }

    if (playerOne.life === 0 && playerTwo.life === 0) {
      fill(255);
      text('Draw!', width / 2, height / 2);
      playerOne.explode();
      playerTwo.explode();
    } else if (playerOne.life === 0) {
      fill('blue');
      text('Player2 Win!', width / 2, height / 2);
      playerOne.explode();
    } else {
      fill('red');
      text('Player1 Win!', width / 2, height /2);
      playerTwo.explode();
    }
  }
  textAlign(LEFT);

  //Draw Stars
  backgroundStarArray.map((v) => v.update());

  //Draw Parameters
  //Player1 HP
  stroke('white');
  fill('dimgray')
  rect(barOffset, barOffset, 100 * (width / 260), barWidth);
  fill('red');
  rect(barOffset, barOffset, playerOne.life * (width / 260), barWidth);

  //Player2 HP
  stroke('white');
  fill('dimgray')
  rect(width - barOffset, barOffset, -100 * (width / 260), barWidth);
  fill('blue');
  rect(width - barOffset, barOffset, -playerTwo.life * (width / 260), barWidth);

  //Round
  stroke('mediumpurple');
  strokeWeight(3);
  fill('black')
  textSize(48);
  textAlign(CENTER);
  text(`Round ${roundCount}`, width/2, barOffset*3/4);

  strokeWeight(1);
  stroke('white');
  fill('black');
  const offX = barOffset;
  const offY = barOffset*2;
  quad(width/2 - offX, offY/2, width/2 - offX/2, offY, width/2 + offX/2, offY, width/2 + offX, offY/2);

  fill('white');
  textSize(42);
  text(exeCount, width/2, barOffset + offY/3);

  //Draw Characters
  textFont('Georgia');
  textAlign(LEFT);
  playerOne.display();
  playerTwo.display();

  if (!isGameRunning && !isGameover) {
    textFont(kaiso);
    textSize(64);
    textAlign(CENTER);
    stroke('white')
    if (isPlayerOneReady) {
      fill('red');
      text('Player1 Ready', width/4 -40, height/2);
    }
    if (isPlayerTwoReady) {
      fill('blue');
      text('Player2 Ready', width*3/4-40, height/2);
    }
    textAlign(LEFT);
  }

  //Draw Code
  fill(255, 70);
  const codeTextSize = 32;
  if (isGameRunning && playerOneCodeStack.length !== 0 && playerTwoCodeStack.length !== 0) {
    textFont(hackgen);
    textSize(codeTextSize);
    playerOneCode.forEach((codeLine, i) => {
      (i+1) == playerOneExeIndex ? fill('red') : fill(255, 70);
      const codeLineText = `${i+1} ${codeLine}`;
      text(codeLineText, barOffset, topEdge + i * codeTextSize);
    });
    playerTwoCode.forEach((codeLine, i) => {
      (i+1) == playerTwoExeIndex ? fill('blue') : fill(255, 70);
      const codeLineText = `${i+1} ${codeLine}`;
      text(codeLineText, width/2 + barOffset * 2, topEdge + i * codeTextSize);
    });
  }
  fill(255, 255);
}

function convertIf(ifStatement) {
  if (ifStatement.includes('おわり')) return '}';
  const splitted = ifStatement.split('  ');
  const condition = splitted[1];
  const convertedCondition = conditionDict[condition].code;
  const result = `if (${convertedCondition}) {`;
  return result;
}

//Get JS Code String from codeStack
function getJSCodeString(codeStack, playerId) {
  if(codeStack.length === 0) return;
  let result = [];
  const playerObj = (playerId === 1) ? 'playerOne.': 'playerTwo.';
  codeStack.forEach(({ codeType, codeText }, _) => {
    let codeLine = '';
    if (codeType === 'if-start') {
      codeLine = convertIf(codeText);
    } else if (codeType === 'if-end') {
      codeLine = '}';
    } else {
      codeLine = playerObj + textDict[codeText].code;
    }
    result.push(codeLine);
  });
  console.log(result);
  return result;
}

function updateExeIndex(playerId, updatedValue) {
  if (playerId === 1) {
    playerOneExeIndex = updatedValue;
  } else if (playerId === 2){
    playerTwoExeIndex = updatedValue;
  }
}

function getExecSnippet(codeStack, playerId) {
  let snippet = '';
  const playerObj = (playerId === 1) ? 'playerOne.': 'playerTwo.';
  const exeIndex = (playerId === 1) ? playerOneExeIndex : playerTwoExeIndex;
  const targetText = codeStack[exeIndex].codeText;
  const targetType = codeStack[exeIndex].codeType;

  //actionの処理
  if (targetType === 'action') {
    const updatedIndex = (exeIndex + 1) % codeStack.length;
    updateExeIndex(playerId, updatedIndex)
    snippet = playerObj + textDict[targetText].code;
    return snippet;
  }

  //if-endの処理
  if (targetType === 'if-end') {
    //ifブロックのみのとき，無限再帰になる
    const updatedIndex = (exeIndex + 1) % codeStack.length;
    updateExeIndex(playerId, updatedIndex)
    return getExecSnippet(codeStack, playerId);
  }

  //ifの時の処理
  const condString = targetText.split('  ')[1];
  const cond = conditionDict[condString].code;
  if (eval(cond)) {
    //conditionがtrueのとき
    const updatedIndex = (exeIndex + 1) % codeStack.length;
    updateExeIndex(playerId, updatedIndex)
    return getExecSnippet(codeStack, playerId);
  } else {
    //conditionがfalseのとき
    //if-endの次までindexを飛ばす
    const updatedIndex = (codeStack.findIndex(v => v.codeType === 'if-end') + 1) % codeStack.length;
    updateExeIndex(playerId, updatedIndex)
    return getExecSnippet(codeStack, playerId);
  }
}

//exec JSCode from Array
function execPlayerCode(playerCode) {
  let snippet = '';
  const playerObj = (playerId === 1) ? 'playerOne.': 'playerTwo.';
  const exeIndex = (playerId === 1) ? playerOneExeIndex : playerTwoExeIndex;
  const targetText = codeStack[exeIndex].codeText;
  const targetType = codeStack[exeIndex].codeType;

  //actionの処理
  if (targetType === 'action') {
    const updatedIndex = (exeIndex + 1) % codeStack.length;
    updateExeIndex(playerId, updatedIndex)
    snippet = playerObj + textDict[targetText].code;
    return snippet;
  }

  //if-endの処理
  if (targetType === 'if-end') {
    //ifブロックのみのとき，無限再帰になる
    const updatedIndex = (exeIndex + 1) % codeStack.length;
    updateExeIndex(playerId, updatedIndex)
    return getExecSnippet(codeStack, playerId);
  }

  //ifの時の処理
  const condString = targetText.split('  ')[1];
  const cond = conditionDict[condString].code;
  if (eval(cond)) {
    //conditionがtrueのとき
    const updatedIndex = (exeIndex + 1) % codeStack.length;
    updateExeIndex(playerId, updatedIndex)
    return getExecSnippet(codeStack, playerId);
  } else {
    //conditionがfalseのとき
    //if-endの次までindexを飛ばす
    const updatedIndex = (codeStack.findIndex(v => v.codeType === 'if-end') + 1) % codeStack.length;
    updateExeIndex(playerId, updatedIndex)
    return getExecSnippet(codeStack, playerId);
  }
}

setInterval(() => {
  if (!isGameRunning) return;
  //ifの時は際に両者の条件を比較してから実行する
  /*
  const p1EvalTarget = playerOneCodeStack[playerOneExeIndex];
  const p2EvalTarget = playerTwoCodeStack[playerTwoExeIndex];
  if ((!p1EvalTarget.includes('おわり') && p1EvalTarget.includes('もし'))
    || (!p2EvalTarget.includes('おわり') && p2EvalTarget.includes('もし'))) {
    //conditionの評価をしてactionを決める
    const p1CondString = p1EvalTarget.split('  ')[1];
    const p2CondString = p2EvalTarget.split('  ')[1];
    const p1Cond = conditionDict[p1CondString].code;
    const p2Cond = conditionDict[p2CondString].code;
  }
  */


  let p1ExecCodeLine = '';
  try {
    p1ExecCodeLine = getExecSnippet(playerOneCodeStack, 1);
    console.log('[p1]', playerOneExeIndex, p1ExecCodeLine);
    eval(p1ExecCodeLine);
  } catch (e) {
    console.log(e, p1ExecCodeLine);
  }

  let p2ExecCodeLine = '';
  try {
    p2ExecCodeLine = getExecSnippet(playerTwoCodeStack, 2);
    eval(p2ExecCodeLine);
  } catch (e) {
    console.log(e, p2ExecCodeLine);
  }

  exeCount--;
  if (exeCount < 0) {
    isGameRunning = false;
    isPlayerOneReady = false;
    isPlayerTwoReady = false;
    exeCount = GAME_INTERVAL;
    roundCount++;
  }
}, 1000);

//For Debugging
function keyPressed() {
  if (keyCode === 87) {
    playerOne.moveUp();
  } else if (keyCode === 83) {
    playerOne.moveDown();
  } else if (keyCode === 32) {
    playerOne.shot();
  } 

  if (keyCode === UP_ARROW) {
    playerTwo.moveUp();
  } else if (keyCode === DOWN_ARROW) {
    playerTwo.moveDown();
  } else if (keyCode === RETURN) {
    playerTwo.shot();
  }
}
