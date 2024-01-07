import { scratchSound, explodeSound } from './Sound.js';
import { Player, Shot } from './Character.js';
import { BackgroundStar } from './BackgroundStar.js';
import p5 from 'p5';
import io from 'socket.io-client';
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
let centerY = 0;

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

const sketch = (p) => {
  p.preload = () => {
    kaiso = p.loadFont('../font/kaiso_up/Kaisotai-Next-UP-B.otf');
    hackgen = p.loadFont('../font/HackNerdFont-Regular.ttf');
  }

  p.setup = () => {
    let canvas = p.createCanvas(1920, 1080);
    barOffset = p.width/24;
    barWidth = p.width/24;
    let topEdge = p.height / 3 - barOffset;
    let bottomEdge = p.height * 2 / 3 + barOffset;
    let gameHeight = bottomEdge - topEdge;
    centerY = gameHeight/2 + topEdge;
    Player.setEdge(topEdge, bottomEdge);
    canvas.parent('canvas');
    p.background('#3b4279');

    initPlayers(p);

    //Init Background Star
    for (let i = 0; i < BACKGROUND_STAR_MAX_COUNT; i++) {
        let size = p.random(1, BACKGROUND_STAR_MAX_SIZE);
        let speed = p.random(1, BACKGROUND_STAR_MAX_SPEED);
        backgroundStarArray[i] = new BackgroundStar(size, speed, p);
        let x = p.random(p.width);
        let y = p.random(p.height);
        backgroundStarArray[i].set(x, y);
    }
  };

  p.draw = () => {
    p.background('#3b4279');

    //Update Characters
    p.textFont('Georgia');
    playerOne.update();
    playerTwo.update();
    playerOneShotArray.map(v => v.update());
    playerTwoShotArray.map(v => v.update());

    p.textFont(kaiso);
    p.textAlign(p.CENTER);
    //Judge game over
    if (playerOne.life === 0 || playerTwo.life === 0) {
      if (!isGameover) {
        socket.emit('gameOver', 'gameOver');
        explodeSound.play();
        isGameover = true;
        isGameRunning = false;
        p.textSize(72);
      }

      if (playerOne.life === 0 && playerTwo.life === 0) {
        p.fill(255);
        p.text('Draw!', p.width / 2, p.height / 2);
        playerOne.explode();
        playerTwo.explode();
      } else if (playerOne.life === 0) {
        p.fill(playerTwo.col);
        p.text('Player2 Win!', p.width / 2, p.height / 2);
        playerOne.explode();
      } else {
        p.fill(playerOne.col);
        p.text('Player1 Win!', p.width / 2, p.height /2);
        playerTwo.explode();
      }
      p.fill(255);
      p.text(reloadTimerCount, p.width / 2, p.height /2 + 78);
    }
    
    if (3 < roundCount && !isGameover) {
        socket.emit('gameOver', 'gameOver');
        explodeSound.play();
        isGameover = true;
        isGameRunning = false;
        p.textSize(72);
    }

    if (isGameover) {
      if (playerOne.life === playerTwo.life || playerOne.life === 0 && playerTwo.life === 0) {
          p.fill(255);
          p.text('Draw!', p.width / 2, height / 2);
          playerOne.explode();
          playerTwo.explode();
      } else if (playerOne.life === 0 || playerOne.life < playerTwo.life) {
          p.fill(playerTwo.col);
          p.text('Player2 Win!', p.width / 2, p.height / 2);
          playerOne.explode();
      } else if (playerTwo.life === 0 || playerOne.life > playerTwo.life) {
          p.fill(playerOne.col);
          p.text('Player1 Win!', p.width / 2, p.height /2);
          playerTwo.explode();
      }
    }

    p.textAlign(p.LEFT);

    //Draw Stars
    backgroundStarArray.map((v) => v.update());

    //Draw Parameters
    //Player1 HP
    p.textSize(64);
    p.stroke('white');
    p.fill('dimgray')
    p.rect(barOffset, barOffset, 100 * (p.width / 260), barWidth);
    p.fill(playerOne.col);
    p.rect(barOffset, barOffset, playerOne.life * (p.width / 260), barWidth);
    p.textAlign(p.CENTER);
    p.text(playerOne.life, barOffset, barOffset, 100 * (p.width / 260));

    //Player2 HP
    p.stroke('white');
    p.fill('dimgray')
    p.rect(p.width - barOffset, barOffset, -100 * (p.width / 260), barWidth);
    p.fill(playerTwo.col);
    p.rect(p.width - barOffset, barOffset, -playerTwo.life * (p.width / 260), barWidth);
    p.text(playerTwo.life, p.width - barOffset, barOffset, -100 * (p.width / 260));

    //Round
    p.stroke('mediumpurple');
    p.strokeWeight(3);
    p.fill('black')
    p.textSize(48);
    p.textAlign(p.CENTER);
    p.text(`Round ${roundCount}`, p.width/2, barOffset*3/4);

    p.strokeWeight(1);
    p.stroke('white');
    p.fill('black');
    const offX = barOffset;
    const offY = barOffset*2;
    p.quad(p.width/2 - offX, offY/2, p.width/2 - offX/2, offY, p.width/2 + offX/2, offY, p.width/2 + offX, offY/2);

    p.fill('white');
    p.textSize(42);
    p.text(exeCount, p.width/2, barOffset + offY/3);


    //Draw Area
    p.noFill();
    const areaS = 180;
    p.stroke(playerOne.col);
    p.strokeWeight(4);
    p.rect(barOffset*3 - areaS/2, Player.TOP_EDGE - areaS/2, areaS, areaS);
    p.rect(barOffset*3 - areaS/2, centerY - areaS/2, areaS, areaS);
    p.rect(barOffset*3 - areaS/2, Player.BOTTOM_EDGE - areaS/2, areaS, areaS);

    p.stroke(playerTwo.col);
    p.rect(p.width-barOffset*3 - areaS/2, Player.TOP_EDGE - areaS/2, areaS, areaS);
    p.rect(p.width-barOffset*3 - areaS/2, centerY - areaS/2, areaS, areaS);
    p.rect(p.width-barOffset*3 - areaS/2, Player.BOTTOM_EDGE - areaS/2, areaS, areaS);
    p.fill(255);
    p.strokeWeight(1);

    //Draw Characters
    p.textFont('Georgia');
    p.textAlign(p.LEFT);
    playerOne.display();
    playerTwo.display();

    if (!isGameRunning && !isGameover) {
      p.textFont(kaiso);
      p.textSize(64);
      p.textAlign(p.CENTER);
      p.stroke('white')
      if (isPlayerOneReady) {
        p.fill(playerOne.col);
        p.text('Player1 Ready', p.width/4 -40, p.height/2);
      }
      if (isPlayerTwoReady) {
        p.fill(playerTwo.col);
        p.text('Player2 Ready', p.width*3/4 - 40, p.height/2);
      }
      p.textAlign(p.LEFT);
    }

    //Draw Code
    p.fill(255, 70);
    p.stroke(255);
    const codeTextSize = 32;
    if (isGameRunning) {
      p.textFont(hackgen);
      p.textSize(codeTextSize);
      if (playerOneCode.length !== 0) {
        playerOneCode.forEach(({ codeText }, i) => {
          ((i+1) % playerOneCode.length) == playerOneExeIndex ? p.fill(playerOne.col) : p.fill(255, 70);
          const codeLineText = `${i+1} ${codeText}`;
          p.text(codeLineText, barOffset, Player.TOP_EDGE + i * codeTextSize);
        });
      }

      if (playerTwoCode.length !== 0) {
        playerTwoCode.forEach(({ codeText }, i) => {
          ((i+1) % playerTwoCode.length) == playerTwoExeIndex ? p.fill(playerTwo.col) : p.fill(255, 70);
          const codeLineText = `${i+1} ${codeText}`;
          p.text(codeLineText, p.width/2 + barOffset * 2, Player.TOP_EDGE + i * codeTextSize);
        });
      }
    }
    p.fill(255, 255);
  };

  p.keyPressed = (e) => {
    e.preventDefault();
    if (p.keyCode === 87) {
      playerOne.moveUp();
    } else if (p.keyCode === 83) {
      playerOne.moveDown();
      playerOne.charge();
    } else if (p.keyCode === 32) {
      playerOne.shot();
    } 

    if (p.keyCode === p.UP_ARROW) {
      playerTwo.moveUp();
    } else if (p.keyCode === p.DOWN_ARROW) {
      playerTwo.moveDown();
      playerTwo.charge();
    } else if (p.keyCode === p.RETURN) {
      //playerTwo.shot();
      testCode();
    }
  };
}

new p5(sketch);


function initPlayers(p) {
  playerOne = new Player("🚀", barOffset*3, centerY, 40, 40, 'red', p);
  playerOne.setVectorFromAngle(p.HALF_PI);
  playerOne.setTarget(playerTwo);

  playerTwo = new Player("👾", p.width-barOffset*3, centerY, 40, 40, 'blue', p);
  playerTwo.setVectorFromAngle(-p.HALF_PI);
  playerTwo.setTarget(playerOne);

  for (let i = 0; i < SHOT_MAX_COUNT; i++) {
    playerOneShotArray[i] = new Shot(-100, -100, 32, 32, p);
    playerOneShotArray[i].setTarget(playerTwo);
    playerOneShotArray[i].setOwner(playerOne);
    playerOneShotArray[i].setVectorFromAngle(p.HALF_PI);
    playerOneShotArray[i].setPower(playerOne.power);

    playerTwoShotArray[i] = new Shot(0, 0, 32, 32, p);
    playerTwoShotArray[i].setTarget(playerOne);
    playerOneShotArray[i].setOwner(playerTwo);
    playerTwoShotArray[i].setVectorFromAngle(-p.HALF_PI);
    playerTwoShotArray[i].setPower(playerTwo.power);
  }
  playerOne.setShotArray(playerOneShotArray);
  playerTwo.setShotArray(playerTwoShotArray);
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

  let p1ExeCode = {};
  let p2ExeCode = {};
  if (playerOneCode.length !== 0) {
    try {
      p1ExeCode = calcExeCode(playerOneCode, playerOneExeIndex);
      playerOneExeIndex = (p1ExeCode.codeIndex + p1ExeCode.inc) % playerOneCode.length;
    } catch (err) {
      console.log(err);
    }
  }

  if (playerTwoCode.length !== 0) {
    try {
      p2ExeCode = calcExeCode(playerTwoCode, playerTwoExeIndex);
      playerTwoExeIndex = (p2ExeCode.codeIndex + p2ExeCode.inc) % playerTwoCode.length;
    } catch (err) {
      console.log(err);
    }
  }

  try {
    eval(p1ExeCode.targetCodeText);
  } catch (err) {
    console.log(err);
  }

  try {
    eval(p2ExeCode.targetCodeText);
  } catch (err) {
    console.log(err);
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
