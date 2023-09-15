const textXOffset = 10;
const textYOffset = 5;
const programFontSize = 16;
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
  'したにうごく': 'player.moveDown()',
  'もし-なら': 'if () {',
  'もし-おわり': '}',
  'あいてとおなじたかさ': 'player.position === enemy.position',
  'あいてがこうげきしていたら': 'enemy.isShooting === true',
  'あいてがためていたら': 'enemy.isCharging === true'
};
let codeStringArray = [];
let actionButtons = [];
let conditionButtons = [];
let exeButton;
let delButton;
let showProgram = false;
let insertMode = 'normal';
let indentNum = 0;
let buttons = [];


function calcTargetIndices(targetString, ary) {
  let ifIndices = [];
  let ifIndex = ary.indexOf(targetString);
  while (ifIndex !== -1) {
    ifIndices.push(ifIndex);
    ifIndex = ary.indexOf(targetString, ifIndex + 1);
  }
  return ifIndices;
}

function calcIndent(codeAry) {
  const ifStartNum = calcTargetIndices('もし-なら', codeAry).length;
  const ifEndNum = calcTargetIndices('もし-おわり', codeAry).length;
  return ifStartNum - ifEndNum;
}

function drawProgram() {
  if (codeStringArray.length === 0) return;
  textSize(programFontSize);

  codeStringArray.forEach((cs, idx) => {
    const viewCode = showProgram ? textMap[cs] : cs;
    const codeElm = textDict[cs];
    const currentArySlice = codeStringArray.slice(0, idx);
    const indentNum = calcIndent(currentArySlice)
    
    const x = width/2 + 10 + 20 * indentNum;
    const y = idx*25 + 30;
    const rectWidth = textWidth(viewCode) * 4/3;
    if (showProgram) {
      fill(0);
    } else {
      if (codeElm['type'] === 'action') {
        fill('blue');
      } else if (codeElm['type'] === 'if-start' || codeElm['type'] === 'if-end') {
        fill('purple');
      } else if (codeElm['type'] === 'condition') {
        fill('orange');
      }
      rect(x, y, rectWidth, 20, 20);
      fill(255);
    }
    text(viewCode, x + textXOffset, y + textYOffset);
  });
}

function setup() {
  createCanvas(820, 740);
  textAlign(LEFT, TOP);
    
  //init code buttons
  Object.keys(textDict).forEach((t, i) => {
    const codeType = textDict[t].type;
    let button = createButton(t);
    button.style('color', 'white');
    if (codeType === 'action') {
      button.style('background-color', 'blue');
      button.position(10, i * 25 + 30);
    } else if (codeType === 'if-start' || codeType === 'if-end') {
      button.style('background-color', 'purple');
      button.position(10, i * 25 + 30);
    } else if (codeType === 'condition') {
      button.style('background-color', 'orange');
      button.position(10, i * 25 + 30);
    }
    button.mousePressed(insertCode);
    buttons.push(button);
  });
  
  exeButton = createButton('じっこう');
  exeButton.position(width/2 + 10, height - 30);
  exeButton.mousePressed(toggleProgramView);
  
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

function insertCode() {
  if (insertMode === 'normal') 
  codeStringArray.push(this.html());
}

function toggleProgramView() {
  showProgram = !showProgram;
}

function deleteLine() {
  codeStringArray.pop();
}
