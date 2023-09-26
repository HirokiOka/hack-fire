const socket = io();
const textDict = {
  'こうげき': {
    'code': 'player.shot();',
    'type': 'action'
  },
  'ためる': {
    'code': 'player.charge();',
    'type': 'action'
  },
  'うえにうごく': {
    'code': 'player.moveUp();',
    'type': 'action'
  },
  'したにうごく': {
    'code': 'player.moveDown();',
    'type': 'action'
  },
  'もし-なら': {
    'code': 'if () {',
    'type': 'if-start'
  },
  'もし-おわり': {
    'code': '}',
    'type': 'if-end'
  },
  'あいてとおなじたかさ': {
    'code': 'player.position === enemy.position',
    'type': 'condition'
  },
  'あいてがこうげきしていたら': {
    'code': 'enemy.isShooting === true',
    'type': 'condition'
  },
  'あいてがためていたら': {
    'code': 'enemy.isCharging === true',
    'type': 'condition'
  }
};

const textMap = {
  'こうげき': 'player.shot();',
  'ためる': 'player.charge();',
  'うえにうごく': 'player.moveUp();',
  'したにうごく': 'player.moveDown();',
  'もし-なら': 'if () {',
  'もし-おわり': '}',
  'あいてとおなじたかさ': 'player.position === enemy.position',
  'あいてがこうげきしていたら': 'enemy.isShooting === true',
  'あいてがためていたら': 'enemy.isCharging === true'
};

socket.on('connect', () => {
  console.log('connected to server: player1');
});

const textXOffset = 10;
const textYOffset = 3;
const programFontSize = 16;
let codeStack = [];
let exeButton;
let delButton;
let showProgram = false;
//normal, condition, nested
let insertMode = 'normal';
let indentNum = 0;
let buttons = [];

function setup() {
  createCanvas(820, 740);
  textAlign(LEFT, TOP);
    
  //Init code buttons
  Object.keys(textDict).forEach((t, i) => {
    const codeType = textDict[t].type;
    let button = createButton(t);
    button.style('color', 'white');
    button.value(codeType);
    if (codeType === 'action') {
      button.style('background-color', 'blue');
      button.position(10, i * 25 + 30);
      button.mousePressed(insertCode);
    } else if (codeType === 'if-start') {
      button.style('background-color', 'purple');
      button.position(10, i * 25 + 30);
      button.mousePressed(handleIfStart);
    } else if (codeType === 'if-end') {
      button.style('background-color', 'purple');
      button.position(10, i * 25 + 30);
      button.mousePressed(handleIfEnd);
    } else if (codeType === 'condition') {
      button.style('background-color', 'orange');
      button.position(10, i * 25 + 30);
      button.mousePressed(insertCondition);
    }
    buttons.push(button);
  });
  
  exeButton = createButton('うごかす');
  exeButton.position(width/2 + 10, height*2/3 - 30);
  exeButton.style('color', 'white');
  exeButton.style('background-color', 'green');
  exeButton.mousePressed(handleExeButton);
  
  delButton = createButton('1つけす');
  delButton.position(width/2 - 80, 10);
  delButton.style('color', 'white');
  delButton.style('background-color', 'red');
  delButton.mousePressed(deleteLine);
}


function draw() {
  background(230);
  textSize(18);
  stroke(0);
  line(width/2, 0, width/2, height);
  fill(255);
  rect(width/2, 0, width/2, height);

  fill(0);
  noStroke();
  text("うごき:", 10, 10);
  text("プログラム:", width/2 +10, 10);

  drawProgram();

}

function drawProgram() {
  if (codeStack.length === 0) return;
  textSize(programFontSize);

  codeStack.forEach((e, idx) => {
    const elmType = e['type'];
    const elmTxt = e['text'];
    const viewCode = showProgram ? textMap[elmTxt] : elmTxt;
    const currentArySlice = codeStack.slice(0, idx);
    const indentNum = calcIndentNum(currentArySlice)
    
    const x = width/2 + 10 + 20 * indentNum;
    const y = idx * 25 + 30;
    const rectWidth = textWidth(viewCode) * 4/3;

    if (showProgram) {
      fill(0);
    } else {
      if (elmType === 'action') {
        fill('blue');
      } else if (elmType === 'if-start' || elmType === 'if-end') {
        fill('purple');
      } else if (elmType === 'condition') {
        fill('orange');
      }
      rect(x, y, rectWidth, 20, 20);
      fill(255);
    }
    text(viewCode, x + textXOffset, y + textYOffset);
  });
}

function calcIndentNum(codeStackSlice) {
  let indentNum = 0;
  const ifStartNum = codeStackSlice.filter(v => v['type'] === 'if-start').length;
  const ifEndNum = codeStackSlice.filter(v => v['type'] === 'if-end').length;
  indentNum = ifStartNum - ifEndNum;
  if (indentNum < 0) return 0;
  return indentNum;
}

//Button handler
function insertCode() {
  if (insertMode === 'normal') {
    const insertData = {
      "type": this.value(),
      "text": this.html()
    }
    codeStack.push(insertData);
  }
}

function handleIfStart() {
  if (insertMode === 'normal') {
    const insertData = {
      "type": this.value(),
      "text": this.html()
    }
    codeStack.push(insertData);
  }
  insertMode = 'condition';
  indentNum = calcIndentNum(codeStack);
}

function insertCondition() {
  if (insertMode === 'condition') {
    const insertData = {
      "type": this.value(),
      "text": this.html()
    }
    codeStack.push(insertData);
  }
  insertMode = 'normal';
  indentNum = calcIndentNum(codeStack);
}

function handleIfEnd() {
  if (insertMode === 'normal' && 0 < indentNum ) {
    const insertData = {
      "type": this.value(),
      "text": this.html()
    }
    codeStack.push(insertData);
  }
  indentNum = calcIndentNum(codeStack);
}

function handleExeButton() {
  sendMessage(codeStack);
  showProgram = !showProgram;
}

function deleteLine() {
  codeStack.pop();
  indentNum = calcIndentNum(codeStack);
}

//Socket.io
function sendMessage(message) {
  socket.emit('message', message);
}
