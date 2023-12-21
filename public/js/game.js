const socket = io();

const backTitleMilliSec = 30000;
let reloadTimerCount = 30;
let playerOneRetry = false;
let playerTwoRetry = false;

const SHOT_MAX_COUNT = 10;
const GAME_INTERVAL = 20;
const BACKGROUND_STAR_MAX_COUNT = 100;
const BACKGROUND_STAR_MAX_SIZE = 8;
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
let isPlayerOneJoin = false;
let isPlayerTwoJoin = false;

let barOffset;
let barWidth;
let topEdge = 0;
let centerY = 0;
let bottomEdge = 0;
let gameHeight = 0;
//let TOP = 0;
//let BOTTOM = 0;

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
};

//Process related to Socket.io 
socket.on('connection', () => {
  console.log('connected to server: main');
});

//Get and exec Codes
////playerOne
socket.on('playerOne', (msg) => {
  console.log('[p1]:', msg);
  if (msg === 'join') {
    isPlayerOneJoin = true;
    if (isPlayerOneJoin && isPlayerTwoJoin) socket.emit('coding', 'coding');
    return;
  }
  if (msg === 'cancel') {
    window.location.href = '/game';
  }
  if (msg === 'p1_retry') {
    playerOneRetry = true;
    if (playerOneRetry && playerTwoRetry) window.location.reload();
  }

  if (isGameRunning || isGameover) return;
  const receivedData = JSON.parse(JSON.stringify(msg, ''));
  playerOneCodeStack = receivedData;
  isPlayerOneReady = true;
  playerOneCode = getJSCodeString(playerOneCodeStack, 1);
  if (isPlayerOneReady && isPlayerTwoReady && !isGameRunning) {
    isGameRunning = true;
    socket.emit('gameStart', 'gameStart');
  }
});

////playerTwo
socket.on('playerTwo', (msg) => {
  console.log('[p2]:', msg);
  if (msg === 'join') {
    isPlayerTwoJoin = true;
    if (isPlayerOneJoin && isPlayerTwoJoin) socket.emit('coding', 'coding');
    return;
  }
  if (msg === 'cancel') {
    window.location.href = '/game';
  }
  if (msg === 'p2_retry') {
    playerTwoRetry = true;
    if (playerOneRetry && playerTwoRetry) window.location.reload();
  }

  if (isGameRunning || isGameover) return;
  const receivedData = JSON.parse(JSON.stringify(msg, ''));
  playerTwoCodeStack = receivedData;
  playerTwoCode = getJSCodeString(playerTwoCodeStack, 2);
  isPlayerTwoReady = true;
  if (isPlayerOneReady && isPlayerTwoReady && !isGameRunning) {
    isGameRunning = true;
    socket.emit('gameStart', 'gameStart');
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

let chargeSound = new Sound();
chargeSound.load('../sound/charge.mp3', (error) => {
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

let scratchSound = new Sound();
scratchSound.load('../sound/scratch_se.mp3', (error) => {
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
  //let canvas = createCanvas(1920, 1080, P2D);
  //let canvas = createCanvas(1440, 900, P2D);
  let canvas = createCanvas(1920, 1200, P2D);
  barOffset = width/24;
  barWidth = width/24;
  topEdge = height / 3 - barOffset;
  bottomEdge = height * 2 / 3 + barOffset;
  gameHeight = bottomEdge - topEdge;
  centerY = gameHeight/2 + topEdge;
  canvas.parent('canvas');
  background('#3b4279');

  //Init Players
  playerOne = new Player("🚀", barOffset*3, centerY, 40, 40, 'red');
  playerOne.setVectorFromAngle(HALF_PI);
  playerOne.setTarget(playerTwo);

  playerTwo = new Player("👾", width-barOffset*3, centerY, 40, 40, 'blue');
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
  //Judge game over
  if (playerOne.life === 0 || playerTwo.life === 0) {
    if (!isGameover) {
      socket.emit('gameOver', 'gameOver');
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
      fill(playerTwo.col);
      text('Player2 Win!', width / 2, height / 2);
      playerOne.explode();
    } else {
      fill(playerOne.col);
      text('Player1 Win!', width / 2, height /2);
      playerTwo.explode();
    }
    fill(255);
    text(reloadTimerCount, width / 2, height /2 + 78);
  }
  
  if (3 < roundCount && !isGameover) {
      socket.emit('gameOver', 'gameOver');
      explodeSound.play();
      isGameover = true;
      isGameRunning = false;
      textSize(72);
  }

  if (isGameover) {
    if (playerOne.life === playerTwo.life || playerOne.life === 0 && playerTwo.life === 0) {
        fill(255);
        text('Draw!', width / 2, height / 2);
        playerOne.explode();
        playerTwo.explode();
    } else if (playerOne.life === 0 || playerOne.life < playerTwo.life) {
        fill(playerTwo.col);
        text('Player2 Win!', width / 2, height / 2);
        playerOne.explode();
    } else if (playerTwo.life === 0 || playerOne.life > playerTwo.life) {
        fill(playerOne.col);
        text('Player1 Win!', width / 2, height /2);
        playerTwo.explode();
    }
  }

  textAlign(LEFT);


  //Draw Stars
  backgroundStarArray.map((v) => v.update());

  //Draw Parameters
  //Player1 HP
  textSize(64);
  stroke('white');
  fill('dimgray')
  rect(barOffset, barOffset, 100 * (width / 260), barWidth);
  fill(playerOne.col);
  rect(barOffset, barOffset, playerOne.life * (width / 260), barWidth);
  textAlign(CENTER);
  text(playerOne.life, barOffset, barOffset, 100 * (width / 260));

  //Player2 HP
  stroke('white');
  fill('dimgray')
  rect(width - barOffset, barOffset, -100 * (width / 260), barWidth);
  fill(playerTwo.col);
  rect(width - barOffset, barOffset, -playerTwo.life * (width / 260), barWidth);
  text(playerTwo.life, width - barOffset, barOffset, -100 * (width / 260));

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


  //Draw Area
  noFill();
  const areaS = 180;
  stroke(playerOne.col);
  strokeWeight(4);
  rect(barOffset*3 - areaS/2, topEdge - areaS/2, areaS, areaS);
  rect(barOffset*3 - areaS/2, centerY - areaS/2, areaS, areaS);
  rect(barOffset*3 - areaS/2, bottomEdge - areaS/2, areaS, areaS);

  stroke(playerTwo.col);
  rect(width-barOffset*3 - areaS/2, topEdge - areaS/2, areaS, areaS);
  rect(width-barOffset*3 - areaS/2, centerY - areaS/2, areaS, areaS);
  rect(width-barOffset*3 - areaS/2, bottomEdge - areaS/2, areaS, areaS);
  fill(255);
  strokeWeight(1);

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
      fill(playerOne.col);
      text('Player1 Ready', width/4 -40, height/2);
    }
    if (isPlayerTwoReady) {
      fill(playerTwo.col);
      text('Player2 Ready', width*3/4 - 40, height/2);
    }
    textAlign(LEFT);
  }

  //Draw Code
  fill(255, 70);
  stroke(255);
  const codeTextSize = 32;
  if (isGameRunning) {
    textFont(hackgen);
    textSize(codeTextSize);
    if (playerOneCode.length !== 0) {
      playerOneCode.forEach(({ codeText }, i) => {
        ((i+1) % playerOneCode.length) == playerOneExeIndex ? fill(playerOne.col) : fill(255, 70);
        const codeLineText = `${i+1} ${codeText}`;
        text(codeLineText, barOffset, topEdge + i * codeTextSize);
      });
    }

    if (playerTwoCode.length !== 0) {
      playerTwoCode.forEach(({ codeText }, i) => {
        ((i+1) % playerTwoCode.length) == playerTwoExeIndex ? fill(playerTwo.col) : fill(255, 70);
        const codeLineText = `${i+1} ${codeText}`;
        text(codeLineText, width/2 + barOffset * 2, topEdge + i * codeTextSize);
      });
    }
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
  if(codeStack.length === 0) return [];
  console.log('stack', codeStack);
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
    result.push({ 'codeType': codeType, 'codeText': codeLine });
  });

  return result;
}

function updateExeIndex(playerId, updatedValue) {
  if (playerId === 1) {
    playerOneExeIndex = updatedValue;
  } else if (playerId === 2){
    playerTwoExeIndex = updatedValue;
  }
}

//calc execCode and return [Index, jsCode, increment]
function calcExeCode(playerCode, codeIndex) {
  const targetCodeText = playerCode[codeIndex].codeText;
  const targetCodeType = playerCode[codeIndex].codeType;
  let inc = 1;

  if (targetCodeType === 'action') {
    const res = { codeIndex, targetCodeText , inc};
    return res;

  } else if (targetCodeType === 'if-end') {
    const nextExeIndex = (codeIndex + 1) % playerCode.length;
    return calcExeCode(playerCode, nextExeIndex);

  } else if (targetCodeType === 'if-start') {
    const condition = targetCodeText.split('(')[1].split(')')[0];
    let nextCodeIndex = 0;
    if (eval(condition)) {
      nextCodeIndex = (codeIndex + 1) % playerCode.length;
    } else {
      for (let i = codeIndex; i < playerCode.length; i++) {
        if (playerCode[i].codeType === 'if-end') {
          nextCodeIndex = (i + 1) % playerCode.length;
          break;
        }
      }
      return calcExeCode(playerCode, nextCodeIndex);
    }
    return calcExeCode(playerCode, nextCodeIndex);
  }
}




setInterval(() => {
  if (isGameover) {
    reloadTimerCount--;
    if (reloadTimerCount < 1) window.location.href = '/game';
  }
  if (!isGameRunning) return;

  /*
  if (playerOneCode.length !== 0) {
    try {
    //eval Player1 Code
      const p1ExeCode = calcExeCode(playerOneCode, playerOneExeIndex);
      eval(p1ExeCode.targetCodeText);
      playerOneExeIndex = (p1ExeCode.codeIndex + p1ExeCode.inc) % playerOneCode.length;
    } catch (e) {
      console.log(e);
    }
  }

  if (playerTwoCode.length !== 0) {
    try {
    //eval Player2 Code
      const p2ExeCode = calcExeCode(playerTwoCode, playerTwoExeIndex);
      eval(p2ExeCode.targetCodeText);
      playerTwoExeIndex = (p2ExeCode.codeIndex + p2ExeCode.inc) % playerTwoCode.length;
    } catch (e) {
      console.log(e);
    }
  }
  */

  let p1ExeCode = {};
  let p2ExeCode = {};
  if (playerOneCode.length !== 0) {
    try {
      p1ExeCode = calcExeCode(playerOneCode, playerOneExeIndex);
      playerOneExeIndex = (p1ExeCode.codeIndex + p1ExeCode.inc) % playerOneCode.length;
    } catch (e) {
      console.log(e);
    }
  }

  if (playerTwoCode.length !== 0) {
    try {
      p2ExeCode = calcExeCode(playerTwoCode, playerTwoExeIndex);
      playerTwoExeIndex = (p2ExeCode.codeIndex + p2ExeCode.inc) % playerTwoCode.length;
    } catch (e) {
      console.log(e);
    }
  }

  try {
    eval(p1ExeCode.targetCodeText);
  } catch (e) {
    console.log(e);
  }

  try {
    eval(p2ExeCode.targetCodeText);
  } catch (e) {
    console.log(e);
  }

  exeCount--;
  if (exeCount < 0) {
    scratchSound.play();
    isGameRunning = false;
    isPlayerOneReady = false;
    isPlayerTwoReady = false;
    exeCount = GAME_INTERVAL;
    roundCount++;
    playerOneExeIndex = 0;
    playerTwoExeIndex = 0;
    playerOne.isCharging = false;
    playerTwo.isCharging = false;
    socket.emit('coding', 'coding');
  }
}, 1000);


//For Debugging
function keyPressed(e) {
  e.preventDefault();
  if (keyCode === 87) {
    playerOne.moveUp();
  } else if (keyCode === 83) {
    playerOne.moveDown();
    playerOne.charge();
  } else if (keyCode === 32) {
    playerOne.shot();
  } 

  if (keyCode === UP_ARROW) {
    playerTwo.moveUp();
  } else if (keyCode === DOWN_ARROW) {
    playerTwo.moveDown();
    playerTwo.charge();
  } else if (keyCode === RETURN) {
    //playerTwo.shot();
    testCode();
  }
}

function testCode() {
  /*
  playerOneCode = [
    { codeType: "if-start", codeText: "if (playerOne.y === playerTwo.y) {" },
    { codeType: "action", codeText: "playerOne.shot();" },
    { codeType: "if-start", codeText: "if (playerOne.y === playerTwo.y) {" },
    { codeType: "action", codeText: "playerOne.shot();" },
    { codeType: "if-end", codeText: "}" },
    { codeType: "if-start", codeText: "if (playerOne.y !== playerTwo.y) {" },
    { codeType: "action", codeText: "playerOne.charge();" },
    { codeType: "if-end", codeText: "}" },
    { codeType: "if-end", codeText: "}" },
    { codeType: "if-start", codeText: "if (playerOne.y !== playerTwo.y) {" },
    { codeType: "action", codeText: "playerOne.charge();" },
    { codeType: "if-end", codeText: "}" },
  ];
  */

  /*
  playerOneCode = [
    { codeType: "action", codeText: "playerOne.moveUp();" },
    { codeType: "action", codeText: "playerOne.moveDown();" },
    { codeType: "action", codeText: "playerOne.moveDown();" },
    { codeType: "action", codeText: "playerOne.moveUp();" },
  ];

  playerOneCode = [
    { codeType: "action", codeText: "playerOne.charge();" },
  ];
  playerOneCode = [
    { codeType: "if-start", codeText: "if (playerOne.y === playerTwo.y) {" },
    { codeType: "action", codeText: "playerOne.shot();" },
    { codeType: "if-end", codeText: "}" },
    { codeType: "if-start", codeText: "if (playerOne.y !== playerTwo.y) {" },
    { codeType: "action", codeText: "playerOne.charge();" },
    { codeType: "if-end", codeText: "}" },
    { codeType: "action", codeText: "playerOne.moveUp();" },
    { codeType: "action", codeText: "playerOne.moveDown();" },
  ];
*/

  playerOneCode = [
    { codeType: "action", codeText: "playerOne.moveUp();" },
    { codeType: "action", codeText: "playerOne.moveDown();" },
  ];

  playerTwoCode = [
    { codeType: "if-start", codeText: "if (playerOne.y !== playerTwo.y) {" },
    { codeType: "action", codeText: "playerTwo.charge();" },
    { codeType: "if-end", codeText: "}" },
    { codeType: "if-start", codeText: "if (playerOne.y === playerTwo.y) {" },
    { codeType: "action", codeText: "playerTwo.shot();" },
    { codeType: "if-end", codeText: "}" },
  ];

  playerOneCode = [
    { codeType: "if-start", codeText: "if (playerOne.y !== playerTwo.y) {" },
    { codeType: "action", codeText: "playerOne.charge();" },
    { codeType: "if-end", codeText: "}" },
    { codeType: "if-start", codeText: "if (playerOne.y === playerTwo.y) {" },
    { codeType: "action", codeText: "playerOne.shot();" },
    { codeType: "if-end", codeText: "}" },
  ];

  playerTwoCode = [
    { codeType: "action", codeText: "playerTwo.moveUp();" },
    { codeType: "action", codeText: "playerTwo.moveDown();" },
  ];


  playerTwoCode = [
    { codeType: "action", codeText: "playerTwo.charge();" },
    { codeType: "action", codeText: "playerTwo.charge();" },
    { codeType: "action", codeText: "playerTwo.charge();" },
  ];
  playerTwoCode = [
    { codeType: "action", codeText: "playerTwo.moveDown();" },
    { codeType: "action", codeText: "playerTwo.moveUp();" },
    { codeType: "action", codeText: "playerTwo.moveDown();" },
  ];
  /*

  playerTwoCode = [
    { codeType: "if-start", codeText: "if (playerOne.y === playerTwo.y) {" },
    { codeType: "action", codeText: "playerTwo.shot();" },
    { codeType: "if-start", codeText: "if (playerOne.y === playerTwo.y) {" },
    { codeType: "action", codeText: "playerTwo.shot();" },
    { codeType: "if-end", codeText: "}" },
    { codeType: "if-end", codeText: "}" },
    { codeType: "if-start", codeText: "if (playerOne.y !== playerTwo.y) {" },
    { codeType: "action", codeText: "playerTwo.charge();" },
    { codeType: "if-end", codeText: "}" },
  ];
  */
  isGameRunning = true;
}
