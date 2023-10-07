const socket = io();
const barOffset = 40;
const barWidth = 40;
const barLength = 300;
const topEdge = 100;
const bottomEdge = 600;
const SHOT_MAX_COUNT = 10;
const GAME_INTERVAL = 20;
let playerOne;
let playerTwo;
let playerOneShotArray = [];
let playerTwoShotArray = [];
let kaiso;
let roundCount = 1;

let playerOneCodeStack = [];
let playerTwoCodeStack = [];
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
  'おなじたかさ': { 'code': 'playerOne.y === playerTwo.y', 'codeType': 'condition' },
  'あいてがこうげき': { 'code': 'enemy.isShooting === true', 'codeType': 'condition' },
  'あいてがためる': { 'code': 'enemy.isCharging === true', 'codeType': 'condition' }
};

let isPlayerOneReady = false;
let isPlayerTwoReady = false;
let isGameRunning = false;

function convertIf(ifStatement) {
  if (ifStatement.includes('おわり')) return '}';
  const splitted = ifStatement.split('  ');
  const condition = splitted[1];
  const convertedCondition = conditionDict[condition].code;
  const result = `if (${convertedCondition}) {`;
  return result;
}

function genExecCodeString(codeStack, playerId) {
  if(codeStack.length === 0) return;
  let result = '';
  const playerObj = playerId === 1 ? 'playerOne.': 'playerTwo.';
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

function genExecCodeLine(codeLineString, playerId) {
  let codeLine = '';
  const playerObj = (playerId === 1) ? 'playerOne.': 'playerTwo.';
  if (codeLineString.includes('もし')) {
    codeLine = convertIf(codeText);
  } else {
    codeLine = playerObj + textDict[codeLineString].code;
  }
  return codeLine;
}

//Process related to Socket.io 
socket.on('connection', () => {
  console.log('connected to server: main');
});

let exeCount = GAME_INTERVAL;
setInterval(() => {
  if (!isGameRunning) return;
  const playerOneExeIndex = (GAME_INTERVAL - exeCount) % playerOneCodeStack.length;
  const p1CodeLineString = playerOneCodeStack[playerOneExeIndex];
  const p1ExecCodeLine = genExecCodeLine(p1CodeLineString, 1);
  const playerTwoExeIndex = (GAME_INTERVAL - exeCount) % playerOneCodeStack.length;
  const p2CodeLineString = playerTwoCodeStack[playerTwoExeIndex];
  const p2ExecCodeLine = genExecCodeLine(p2CodeLineString, 2);
  eval(p1ExecCodeLine);
  eval(p2ExecCodeLine);
  exeCount--;
  if (exeCount < 0) {
    isGameRunning = false;
    isPlayerOneReady = false;
    isPlayerTwoReady = false;
    exeCount = GAME_INTERVAL;
    roundCount++;
  }
}, 1000);


function runGame(p1CodeStack, p2CodeStack) {
  const playerOneCode = genExecCodeString(p1CodeStack, 1);
  const playerTwoCode = genExecCodeString(p2CodeStack, 2);
  eval(playerOneCode);
  eval(playerTwoCode);
  isPlayerOneReady = false;
  isPlayerTwoReady = false;
}

socket.on('playerOne', (msg) => {
  console.log('received: player1');
  const receivedData = JSON.parse(JSON.stringify(msg, '')).map(v => v['codeText']);
  playerOneCodeStack = receivedData;
  isPlayerOneReady = true;
  if (isPlayerOneReady && isPlayerTwoReady && !isGameRunning) {
    //runGame(playerOneCodeStack, playerTwoCodeStack);
    isGameRunning = true;
  }
});

socket.on('playerTwo', (msg) => {
  console.log('received: player2');
  const receivedData = JSON.parse(JSON.stringify(msg, '')).map(v => v['codeText']);
  playerTwoCodeStack = receivedData;
  isPlayerTwoReady = true;
  if (isPlayerOneReady && isPlayerTwoReady && !isGameRunning) {
    //runGame(playerOneCodeStack, playerTwoCodeStack);
    isGameRunning = true;
  }
});


function preload() {
  kaiso = loadFont('../font/kaiso_up/Kaisotai-Next-UP-B.otf');
}

function setup() {
  let canvas = createCanvas(820, 640, P2D);
  canvas.parent('canvas');
  background('darkslateblue');

  //Init Players
  playerOne = new Player("🐮👉", barOffset*3, height/2, 40, 40);
  playerOne.setVectorFromAngle(HALF_PI);
  playerOne.setTarget(playerTwo);

  playerTwo = new Player("🤞🐮", width-barOffset*3, height/2, 40, 40);
  playerTwo.setVectorFromAngle(-HALF_PI);
  playerTwo.setTarget(playerOne);

  for (let i = 0; i < SHOT_MAX_COUNT; i++) {
    playerOneShotArray[i] = new Shot(0, 0, 32, 32);
    playerOneShotArray[i].setTarget(playerTwo);
    playerOneShotArray[i].setVectorFromAngle(HALF_PI);
    playerOneShotArray[i].setPower(playerOne.power);
    //playerOneShotArray[i].setSound(shotSound);

    playerTwoShotArray[i] = new Shot(0, 0, 32, 32);
    playerTwoShotArray[i].setTarget(playerOne);
    playerTwoShotArray[i].setVectorFromAngle(-HALF_PI);
    playerTwoShotArray[i].setPower(playerTwo.power);
    //playerTwoShotArray[i].setSound(shotSound);
  }
  playerOne.setShotArray(playerOneShotArray);
  playerTwo.setShotArray(playerTwoShotArray);
}

function draw() {
  background('darkslateblue');

  //Update Characters
  textFont('Georgia');
  playerOne.update();
  playerTwo.update();
  playerOneShotArray.map(v => v.update());
  playerTwoShotArray.map(v => v.update());
  textFont(kaiso);

  //Draw Parameters
  stroke('white');
  fill('red');
  rect(barOffset, barOffset, playerOne.life*3, barWidth);

  stroke('white');
  fill('blue');
  rect(width/2 + barOffset*3/2 + 300 - playerTwo.life*3, barOffset, playerTwo.life*3, barWidth);

  stroke('mediumpurple');
  strokeWeight(3);
  fill('black')
  textSize(24);
  textAlign(CENTER);
  text(`Round ${roundCount}`, width/2, barOffset*3/4);

  strokeWeight(1);
  stroke('white');
  fill('black');
  const offX = 40;
  const offY = 80;
  quad(width/2 - offX, offY/2, width/2 - offX/2, offY, width/2 + offX/2, offY, width/2 + offX, offY/2);

  fill('white');
  textSize(28);
  text(exeCount, width/2, barOffset + offY/3);

  //Draw Characters
  textFont('Georgia');
  textAlign(LEFT);
  playerOne.display();
  playerTwo.display();

  if (!isGameRunning) {
    textSize(24);
    fill('black');
    if (isPlayerOneReady) text('PlayerOne Ready', width/4 -40, height/2);
    if (isPlayerTwoReady) text('PlyaerTwo Ready', width*3/4-40, height/2);

  }

  //Draw Code
  const playerOneCode = genExecCodeString(playerOneCodeStack, 1);
  const playerTwoCode = genExecCodeString(playerTwoCodeStack, 2);
  if (playerOneCodeStack.length !== 0 && playerTwoCodeStack.length !== 0) {
    textSize(18);
    text(playerOneCode, 40, 220);
    text(playerTwoCode, width/2 + 40, 220);
  }
}

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

class Character {
    constructor(x, y, w, h) {
        this.position = createVector(x, y);
        this.vector = createVector(0.0, -1.0);
        this.width = w;
        this.height = h;
        this.ready = false;
    }

    setVector(x, y) {
        this.vector.set(x, y);
    }

    setVectorFromAngle(angle) {
        this.angle = angle;
        let s = sin(angle - HALF_PI);
        let c = cos(angle- HALF_PI);
        this.vector.set(c, s);
    }

    display() {
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;
        push();
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        text('O', - offsetX, - offsetY);
        pop();   
    }
}

class Player extends Character {
  constructor(appearance, x, y, w, h) {
    super(x, y, w, h);
    this._x = this.position.x;
    this._y = this.position.y;
    this._power = 40;
    this.shotCheckCounter = 0;
    this.shotInterval = 10;
    this.shotArray = null;
    this._life = 100;
    this.code = null;
    this.size = 108;
    this.appearance = appearance;
  }

  //Getter
  get x() {
      return this._x;
  }

  get y() {
      return this._y;
  }

  get life() {
      return this._life;
  }

  get power() {
      return this._power;
  }

  //Setter
  set x(value) {
      this._x = value;
  }

  set y(value) {
      this._y = value;
  }

  set life(value) {
      this._life = value;
  }

  set power(value) {
      this._power = value;
  }

  //Methods
  reduceLife() {
      this._life -= this.power;
      if (this._life < 0) this._life = 0;
  }

  setTarget(target) {
      this.target = target;
  }

  setShotArray(shotArray) {
      this.shotArray = shotArray;
  }

  setCode(code) {
      this.code = code;
  }

  moveUp () {
      this._y -= width/4;
  }

  moveDown () {
      this._y += width/4;
  }

  shot() {
    if (this.shotCheckCounter >= 0) {
      for (let i = 0; i < this.shotArray.length; i++) {
        if (this.shotArray[i].life <= 0) {
          this.shotArray[i].set(this._x, this._y);
          this.shotArray[i].setVectorFromAngle(this.angle);
          this.shotCheckCounter = -this.shotInterval;
          break;
        }
      }
    }
  }

  explode() {
      push();
      fill('red');
      translate(this._x, this._y);
      for (let i = 0; i < TWO_PI; i+= radians(30)) {
          square(r * cos(i), r * sin(i), 20);
      }
      r+=2;
      pop();
  }

  display() {
    textSize(this.size);
    textAlign(CENTER, CENTER)
    text(this.appearance, this._x, this._y);
    textAlign(LEFT, BOTTOM);
  }

  update() {
      if (this.life <= 0) { return; }
      let tx = constrain(this._x, 0, width);
      let ty = constrain(this._y, topEdge, bottomEdge);
      // this.position.set(tx, ty);
      this._x = tx;
      this._y = ty;
      this.display();
      this.shotCheckCounter++;
  }
}

class Shot extends Character {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.size = 48;
    this.speed = 7;
    this.power = 20;
    this.target = null;
    this.sound = null;
    this.appearance = "⚽️";
  }
    set(x, y) {
      this.position.set(x, y);
      this.life = 1;
    }

    setPower(power) {
      this.power = power;
    }

    setTarget(target) {
      if (target != null) {
          this.target = target;
      }
    }

    setSound(sound) {
      this.sound = sound;
    }

    update() {
      if (this.life <= 0) return;
      if (this.position.x + this.width < 0 || this.position.x + this.width > width) {
          this.life = 0;
      }
      this.position.x += this.vector.x * this.speed;
      this.position.y += this.vector.y * this.speed;

      let dist = this.position.dist(createVector(this.target._x, this.target._y));
      
      if (this.target._life > 0 && dist <= (this.width + this.target.width) / 3) {
          this.target.reduceLife(this.power);
          
          if (this.target._life < 0) {
              this.target._life = 0;
          }
          this.life = 0;

          if (this.sound !== null && this.target.sound !== null) {
            if (this.target._life === 0) {
              this.target.sound.play();
            } else {
              this.sound.play();
            }
          } 
      }
    textSize(this.size);
    textAlign(CENTER, CENTER)
    text(this.appearance, this.position.x, this.position.y);
    textAlign(LEFT, BOTTOM);

    }

    isCaptured() {
        if (this.position.y === this.target._y) return true;
    }
}
