const socket = io();
socket.on('connection', () => {
  console.log('connected to server: player2');
});
const textDict = {
  'こうげき': { 'code': 'player.shot();', 'codeType': 'action' },
  'ためる': { 'code': 'player.charge();', 'codeType': 'action' },
  'うえにうごく': { 'code': 'player.moveUp();', 'codeType': 'action' },
  'したにうごく': { 'code': 'player.moveDown();', 'codeType': 'action' },
  'もし  -  なら': { 'code': 'if () {', 'codeType': 'if-start' },
  'もし  -  おわり': { 'code': '}', 'codeType': 'if-end' },
  'あいてとおなじたかさ': { 'code': 'player.position === enemy.position', 'codeType': 'condition' },
  'あいてがこうげきしていたら': { 'code': 'enemy.isShooting === true', 'codeType': 'condition' },
  'あいてがためていたら': { 'code': 'enemy.isCharging === true', 'codeType': 'condition' }
};

const textXOffset = 10;
const textYOffset = 3;
const programFontSize = 16;
let codeStack = [];
let exeButton, delButton;
let showProgram = false;
let insertMode = 'normal';
let buttons = [];

function setup() {
  createCanvas(820, 740);
  textAlign(LEFT, TOP);

  // Initialize buttons
  initButtons();

  exeButton = createStyledButton('OK', 'none', 'orange', width * 3/4 + 10, height - 80, toggleProgramView);
  delButton = createStyledButton('1つけす','none', 'red', width / 2 - 80, 10, deleteLine);
}

function draw() {
  background('white');
  drawUI();
  drawProgram();
}

function initButtons() {
  Object.keys(textDict).forEach((codeText, i) => {
    const { codeType, code } = textDict[codeText];
    const bgColor = getTypeColor(codeType);
    const position = [i * 10 % 3, (i * 100 / 3) + 30];
    const handler = getButtonHandler(codeType);

    buttons.push(createStyledButton(codeText, codeType, bgColor, ...position, handler));
  });
}

function createStyledButton(label, codeType, bgColor, x, y, mousePressedHandler) {
  const btn = createButton(label);
  btn.value(codeType)
     .style('color', 'white')
     .style('background-color', bgColor)
     .position(x, y)
     .mousePressed(mousePressedHandler);
  return btn;
}

function getTypeColor(codeType) {
  switch (codeType) {
    case 'start': return 'skyblue';
    case 'end': return 'skyblue';
    case 'action': return 'cornflowerblue';
    case 'if-start':return 'steelblue';
    case 'if-end': return 'steelblue';
    case 'condition': return 'lightsteelblue';
  }
}

function getButtonHandler(codeType) {
  switch (codeType) {
    case 'action': return insertCode;
    case 'if-start': return handleIfStart;
    case 'if-end': return handleIfEnd;
    case 'condition': return insertCondition;
  }
}

function drawUI() {
  textSize(24);
  stroke(0);
  line(width / 2, 0, width / 2, height);
  noStroke();
  fill('blue');
  text("コードブロック", width/4 - 70, 10);
  fill('cornsilk');
  rect(width/2, 0, width, height);
  fill('lightyellow');
  rect(width/2 + 50, 50, 300, 550);
  fill('red');
  text("プログラム", width*3/4 - 50, 10);
  textSize(18);
}

function drawProgram() {
  if (!codeStack.length) return;
  textSize(programFontSize);

  codeStack.forEach((element, idx) => {
    const { codeType, codeText } = element;
    const viewCode = showProgram ? textDict[codeText].code : codeText;
    const x = width / 2 + 10 + 20 * calcIndentNum(codeStack.slice(0, idx));
    const y = idx * 25 + 30;
    const rectWidth = textWidth(viewCode) * 4 / 3;

    if (showProgram) {
      fill(0);
    } else {
      fill(getTypeColor(codeType));
      rect(x, y, rectWidth, 20, 20);
      fill(255);
    }


    text(viewCode, x + textXOffset, y + textYOffset);
  });
}

function calcIndentNum(codeStackSlice) {
  const ifStartNum = codeStackSlice.filter(v => v.codeType === 'if-start').length;
  const ifEndNum = codeStackSlice.filter(v => v.codeType === 'if-end').length;
  return Math.max(ifStartNum - ifEndNum, 0);
}

function insertCode() {
  if (insertMode === 'normal') {
    codeStack.push({ "codeType": this.value(), "codeText": this.html() });
  }
}

function handleIfStart() {
  if (insertMode === 'normal') {
    codeStack.push({ "codeType": this.value(), "codeText": this.html() });
    insertMode = 'condition';
  }
}

function insertCondition() {
  if (insertMode === 'condition') {
    const replacedText = codeStack[codeStack.length-1].codeText.replace('-', this.html());
    codeStack[codeStack.length-1].codeText = replacedText;
    //codeStack.push({ "codeType": this.value(), "codeText": this.html() });
    insertMode = 'normal';
  }
}

function handleIfEnd() {
  if (insertMode === 'normal' && calcIndentNum(codeStack) > 0) {
    codeStack.push({ "codeType": this.value(), "codeText": this.html() });
  }
}

function toggleProgramView() {
  sendMessage(codeStack);
  //showProgram = !showProgram;
}

function deleteLine() {
  codeStack.pop();
}

function sendMessage(message) {
  socket.emit('playerTwo', message);
}
