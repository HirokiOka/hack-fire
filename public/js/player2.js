const socket = io();
socket.on('connection', () => {
  console.log('connected to server: player2');
});

const textDict = {
  'こうげき': { 'code': 'shot();', 'codeType': 'action' },
  'ためる': { 'code': 'charge();', 'codeType': 'action' },
  'うえにうごく': { 'code': 'moveUp();', 'codeType': 'action' },
  'したにうごく': { 'code': 'moveDown();', 'codeType': 'action' },
  '止まる': { 'code': 'stop();', 'codeType': 'action' },
  'もし  -  なら': { 'code': 'if () {', 'codeType': 'if-start' },
  'もし  -  おわり': { 'code': '}', 'codeType': 'if-end' },
  'おなじたかさ': { 'code': 'player.position === enemy.position', 'codeType': 'condition' },
  'あいてがこうげき': { 'code': 'enemy.isShooting === true', 'codeType': 'condition' },
  'あいてがためる': { 'code': 'enemy.isCharging === true', 'codeType': 'condition' }
};

const textXOffset = 10;
const textYOffset = 3;
const programFontSize = 20;
let codeStack = [];
let exeButton, delButton;
let showProgram = false;
let insertMode = 'normal';
let buttons = [];
let kaiso;

function preload() {
  kaiso = loadFont('../font/kaiso_up/Kaisotai-Next-UP-B.otf');
}

function setup() {
  createCanvas(820, 740);
  textAlign(LEFT, TOP);
  // Initialize buttons
  initButtons();

  exeButton = createStyledButton('OK', 'none', 'green', width * 3/4 - 20, height - 80, toggleProgramView);
  delButton = createStyledButton('1つけす','none', 'red', width / 2 - 100, 50, deleteLine);
  textFont(kaiso);
}


function draw() {
  background('navy');
  drawUI();
  drawProgram();
}

function initButtons() {
  const buttonPositions = [
    [20, 60], [120, 60],
    [20, 120], [160, 120], [300, 120],
    [20, 180],
    [20, 240],
    [20, 300], [160, 300],
    [20, 360],
  ];
  Object.keys(textDict).forEach((codeText, i) => {
    const { codeType, code } = textDict[codeText];
    const bgColor = getTypeColor(codeType);
    const position = buttonPositions[i];
    const handler = getButtonHandler(codeType);

    buttons.push(createStyledButton(codeText, codeType, bgColor, ...position, handler));
  });
}

function createStyledButton(label, codeType, bgColor, x, y, mousePressedHandler) {
  const btn = createButton(label);
  btn.value(codeType)
     .style('color', 'white')
     .style('border-radius', '8px')
     .style('background-color', bgColor)
     .style('padding', '10px')
     .style('font-family', kaiso)
     .position(x, y)
     .mousePressed(mousePressedHandler);
  return btn;
}

function getTypeColor(codeType) {
  switch (codeType) {
    case 'start': return 'skyblue';
    case 'end': return 'skyblue';
    case 'action': return 'cornflowerblue';
    case 'if-start':return 'purple';
    case 'if-end': return 'purple';
    case 'condition': return 'violet';
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
  stroke(0);
  //Center line
  //line(width/2, 0, width/2, height);
  textSize(24);
  noFill();
  strokeWeight(3);
  stroke('gold');
  rect(10, 40, width/2-20, height-60);
  fill('white');
  stroke('gold');
  text("コードブロック", width/4 - 70, 10);

  noFill();
  stroke('tomato');
  rect(width/2+10, 40, width/2-20, height-60);

  fill('white');
  text("プログラム", width*3/4 - 50, 10);
  textSize(18);
  noStroke();
  strokeWeight(1);
}

function drawProgram() {
  if (!codeStack.length) return;
  textSize(programFontSize);

  const indentWidth = 30;
  codeStack.forEach((element, idx) => {
    const { codeType, codeText } = element;
    const viewCode = showProgram ? textDict[codeText].code : codeText;
    let indentNum = calcIndentNum(codeStack.slice(0, idx));
    if (codeType === 'if-end') indentNum--;
    const x = width / 2 + 20 + indentWidth * indentNum;
    const y = idx * 30 + 60;
    const rectWidth = textWidth(viewCode) * 5 / 3;

    if (showProgram) {
      fill(0);
    } else {
      fill(getTypeColor(codeType));
      rect(x, y, rectWidth, 24, 16);
      fill(255);
    }

    const codeIndex = idx + 1;
    text(codeIndex + '. ' + viewCode, x + textXOffset, y + textYOffset);

    if (codeType === 'if-start') {
      const splittedCode = viewCode.split('  ');
      const condOffsetX = 60;
      if (1 < splittedCode[1].length) {
        fill(getTypeColor('condition'));
        rect(x + condOffsetX, y + 2, textWidth(splittedCode[1]) + 12, 20, 16);
        fill(255);
        text(splittedCode[1], x + textXOffset + condOffsetX, y + textYOffset);
      }
    }
  });
}

function calcIndentNum(codeStackSlice) {
  const ifStartNum = codeStackSlice.filter(v => v.codeType === 'if-start').length;
  const ifEndNum = codeStackSlice.filter(v => v.codeType === 'if-end').length;
  return Math.max(ifStartNum - ifEndNum, 0);
}

function insertCode() {
  if (20 <= codeStack.length) return;
  if (insertMode === 'normal') {
    codeStack.push({ "codeType": this.value(), "codeText": this.html() });
  }
}

function handleIfStart() {
  if (20 <= codeStack.length) return;
  if (insertMode === 'normal') {
    codeStack.push({ "codeType": this.value(), "codeText": this.html() });
    insertMode = 'condition';
  }
}

function insertCondition() {
  if (20 <= codeStack.length) return;
  if (insertMode === 'condition') {
    const replacedText = codeStack[codeStack.length-1].codeText.replace('-', this.html());
    codeStack[codeStack.length-1].codeText = replacedText;
    //codeStack.push({ "codeType": this.value(), "codeText": this.html() });
    insertMode = 'normal';
  }
}

function handleIfEnd() {
  if (20 <= codeStack.length) return;
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
