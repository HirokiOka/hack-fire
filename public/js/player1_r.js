const textDict = {
  'こうげき': { 'code': 'player.shot();', 'type': 'action' },
  'ためる': { 'code': 'player.charge();', 'type': 'action' },
  'うえにうごく': { 'code': 'player.moveUp();', 'type': 'action' },
  'したにうごく': { 'code': 'player.moveDown();', 'type': 'action' },
  'もし-なら': { 'code': 'if () {', 'type': 'if-start' },
  'もし-おわり': { 'code': '}', 'type': 'if-end' },
  'あいてとおなじたかさ': { 'code': 'player.position === enemy.position', 'type': 'condition' },
  'あいてがこうげきしていたら': { 'code': 'enemy.isShooting === true', 'type': 'condition' },
  'あいてがためていたら': { 'code': 'enemy.isCharging === true', 'type': 'condition' }
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

  exeButton = createStyledButton('うごかす', 'green', width / 2 + 10, height * 2 / 3 - 30, toggleProgramView);
  delButton = createStyledButton('1つけす', 'red', width / 2 - 80, 10, deleteLine);
}

function draw() {
  background(230);
  drawUI();
  drawProgram();
}

function initButtons() {
  Object.keys(textDict).forEach((text, i) => {
    const { type, code } = textDict[text];
    const bgColor = getTypeColor(type);
    const position = [10, i * 25 + 30];
    const handler = getButtonHandler(type);

    buttons.push(createStyledButton(text, bgColor, ...position, handler));
  });
}

function createStyledButton(label, bgColor, x, y, mousePressedHandler) {
  const btn = createButton(label);
  btn.style('color', 'white')
     .style('background-color', bgColor)
     .position(x, y)
     .mousePressed(mousePressedHandler);
  return btn;
}

function getTypeColor(type) {
  switch (type) {
    case 'action': return 'blue';
    case 'if-start':return 'purple';
    case 'if-end': return 'purple';
    case 'condition': return 'orange';
  }
}

function getButtonHandler(type) {
  switch (type) {
    case 'action': return insertCode;
    case 'if-start': return handleIfStart;
    case 'if-end': return handleIfEnd;
    case 'condition': return insertCondition;
  }
}

function drawUI() {
  textSize(18);
  stroke(0);
  line(width / 2, 0, width / 2, height);
  fill(0);
  noStroke();
  text("うごき:", 10, 10);
  text("プログラム:", width / 2 + 10, 10);
}

function drawProgram() {
  if (!codeStack.length) return;
  textSize(programFontSize);

  codeStack.forEach((element, idx) => {
    const { type, text } = element;
    const viewCode = showProgram ? textDict[text].code : text;
    const x = width / 2 + 10 + 20 * calcIndentNum(codeStack.slice(0, idx));
    const y = idx * 25 + 30;
    const rectWidth = textWidth(viewCode) * 4 / 3;

    if (showProgram) {
      fill(0);
    } else {
      console.log(type);
      fill(getTypeColor(type));
      rect(x, y, rectWidth, 20, 20);
      fill(255);
    }

    text(viewCode, x + textXOffset, y + textYOffset);
  });
}

function calcIndentNum(codeStackSlice) {
  const ifStartNum = codeStackSlice.filter(v => v.type === 'if-start').length;
  const ifEndNum = codeStackSlice.filter(v => v.type === 'if-end').length;
  return Math.max(ifStartNum - ifEndNum, 0);
}

function insertCode() {
  if (insertMode === 'normal') {
    codeStack.push({ "type": this.value(), "text": this.html() });
  }
}

function handleIfStart() {
  if (insertMode === 'normal') {
    codeStack.push({ "type": this.value(), "text": this.html() });
    insertMode = 'condition';
  }
}

function insertCondition() {
  if (insertMode === 'condition') {
    codeStack.push({ "type": this.value(), "text": this.html() });
    insertMode = 'normal';
  }
}

function handleIfEnd() {
  if (insertMode === 'normal' && calcIndentNum(codeStack) > 0) {
    codeStack.push({ "type": this.value(), "text": this.html() });
  }
}

function toggleProgramView() {
  showProgram = !showProgram;
}

function deleteLine() {
  codeStack.pop();
}
