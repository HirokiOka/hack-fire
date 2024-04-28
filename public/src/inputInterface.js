import io from 'socket.io-client';

const socket = io({
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});
const TIME_LIMIT = 60; 
const maxCodeStackLength = 15;
const textXOffset = 10;
const textYOffset = 3;
const programFontSize = 20;
const fontPath = '../font/kaiso_up/Kaisotai-Next-UP-B.otf';
const textDict = {
  'こうげき': { 
    code: 'shot();', codeType: 'action',
    viewText: 'こうげき', position: [20, 100]
  },
  'ためる': { 
    code: 'charge();', codeType: 'action',
    viewText: 'ためる', position: [120, 100] 
  },
  'うえにうごく': {
    code: 'moveUp();', codeType: 'action',
    viewText: 'うえにうごく', position: [20, 160]
  },
  'したにうごく': {
    code: 'moveDown();', codeType: 'action',
    viewText: 'したにうごく', position: [160, 160]
  },
  'もし  -  なら': {
    code: 'if () {', codeType: 'if-start',
    viewText: 'もし  ◆  なら',  position: [20, 280]
  },
  'もし  -  おわり': {
    code: '}', codeType: 'if-end',
    viewText: 'もしおわり', position: [20, 340]
  },
  'おなじたかさ': {
    code: 'playerOne.y === playerTwo.y', codeType: 'condition',
    viewText: 'おなじたかさ', position: [40, 480] 
  },
  'ちがうたかさ': {
    code: 'playerOne.y !== playerTwo.y', codeType: 'condition',
    viewText: 'ちがうたかさ', position: [180, 480]
  }
};
let isSubmitted = false;
let isCodingMode = false;
let showProgram = false;
let insertMode = 'normal';
let codeStack = [];
let textMessage = '';
let buttons = [];
let kaiso;
let timerCount = 0; 

const sketch = (p, playerNum) => {
  const initMetaData = (playerNum) => {
    if (playerNum === 1) {
      return {
        color: 'brown',
        returnUrl: '/p1_title',
        postUrl: '/p1PostSurvey',
        playerId: 'playerOne',
      };
    } else {
      return {
        color: '#3b4279',
        returnUrl: '/p2_title',
        postUrl: '/p2PostSurvey',
        playerId: 'playerTwo',
      };
    }
  };
  const metaData = initMetaData(playerNum);

  function emitEvent(event, data = null) {
    socket.emit(event, { playerId: metaData.playerId, data: data }, (res) => {
      if (res.error) {
        console.error(`Message sending failed: ${res.error}`);
        return;
      }
    });
  }

  emitEvent('join');
  socket.on('connection', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`connected to server: ${metaData.playerId}`);
  });

  p.preload = () => {
    kaiso = p.loadFont(fontPath);
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textAlign(p.LEFT, p.TOP);
    initButtons(p);

    const editButtons = {
      'かんせい': { 
        value: 'none', color: 'green', viewText: 'かんせい', 
        position: [p.width * 3/4 - 20, p.height - 80], handler: submitCode,
      },
      '1つけす': { 
        value: 'none', color: 'tomato', viewText: '1つけす', 
        position: [p.width/2 - 100, 100] ,handler: deleteLine,
      },
      'ぜんぶけす': {
        value: 'none', color: 'red', viewText: 'ぜんぶけす', 
        position: [p.width/2 - 120, 160], handler: deleteAll,
      },
      'ゲームをやめる': { 
        value: 'none', color: 'black', viewText: 'ゲームをやめる', 
        position: [p.width - 140, 4], handler: returnToTitle,
      }
    };
    for (const { value, color, viewText, position, handler } of Object.values(editButtons)) {
      buttons.push(createStyledButton(p, viewText, value, color, ...position, handler));
    }

    p.textFont(kaiso);
  };

  p.draw = () => {
    p.background("#35374B");
    drawUI(p);
    drawProgram(p);
    drawMessage(p);
    p.textFont(kaiso);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  //handle socket events
  socket.on('battleStart', (_) => {
    textMessage = 'プログラムじっこうちゅう！\nまんなかのがめんをみてね！';
  });

  socket.on('coding', (_) => {
    textMessage = '';
    isCodingMode = true;
    isSubmitted = false;
    timerCount = 0;
  });

  socket.on('gameOver', (_) => {
    if (window.confirm('リトライしますか？')) {
      emitEvent('retry');
      window.location.reload();
    } else {
      emitEvent('quit');
      window.location.href = metaData.postUrl;
    }
  });

  socket.on('retry', (_) => {
    window.location.reload();
  });

  socket.on('quit', (_) => {
    window.location.href = metaData.postUrl;
  });

  function submitCode() {
    if (isSubmitted) return;
    if (codeStack.length === 0) {
      alert('プログラムがありません');
      return;
    } else if (calcIndentNum(codeStack) > 0) {
      alert('[もしおわり] がたりません');
      return;
    } else if (codeStack.map(v => v.codeType).findIndex(e => e === 'action') === -1) {
      alert('キャラクターのうごきが入力されていません');
      return;
    }
    isSubmitted = true;
    isCodingMode = false;
    textMessage = 'じゅんびOK！\nあいてをまっています.';
    if (!isSubmitted && (timerCount >= TIME_LIMIT)) {
      emitEvent('submit', []);
    } else {
      emitEvent('submit', codeStack);
    }
  }

  function returnToTitle() {
    if (window.confirm('ゲームをやめてタイトルにもどります．\nよろしいですか？')) {
      emitEvent('quit');
      window.location.href = metaData.returnUrl;
    }
  }
}


function initButtons(p) {
  for (const { code, codeType, viewText, position } of Object.values(textDict)) {
    const bgColor = getTypeColor(codeType);
    const handler = getButtonHandler(codeType);
    if (codeType === 'condition') {
      buttons.push(createConditiondButton(p, viewText, codeType, bgColor, ...position, handler));
    } else {
      buttons.push(createStyledButton(p, viewText, codeType, bgColor, ...position, handler));
    }
  }
}

function createConditiondButton(p, label, value, bgColor, x, y, mousePressedHandler) {
  const btn = p.createButton(label);
  btn.value(value)
    .style('color', 'white')
    .style('border-radius', '2px')
    .style('background-color', bgColor)
    .style('padding', '20px')
    .style('font-family', kaiso)
    .style('font-weight', 'bold')
    .style('font-size', '14px')
    .style('text-align', 'center')
    .style('transform', 'rotate(45deg)')
    .style('width', '82px')
    .style('height', '82px')
    
    .position(x, y)
    .mousePressed(mousePressedHandler);
  btn.html(`<span style="transform: rotate(-45deg); display: block;">${label}</span>`);
  return btn;
}

function createStyledButton(p, label, value, bgColor, x, y, mousePressedHandler) {
  const btn = p.createButton(label);
  btn.value(value)
    .style('color', 'white')
    .style('border-radius', '8px')
    .style('background-color', bgColor)
    .style('padding', '10px')
    .style('font-family', kaiso)
    .style('font-weight', 'bold')
    
    .position(x, y)
    .mousePressed(mousePressedHandler);
  return btn;
}

function getTypeColor(codeType) {
  switch (codeType) {
    case 'start': return 'skyblue';
    case 'end': return 'skyblue';
    case 'action': return '#6f9efd';
    case 'if-start':return '#7122fa';
    case 'if-end': return '#7122fa';
    case 'condition': return '#C5C02C';
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

//Functions in p.draw
function drawUI(p) {
  p.stroke('black');
  //Center line
  p.textSize(32);
  p.noFill();
  p.strokeWeight(3);
  p.stroke('#d05af0');

  //Code blocks
  p.rect(10, 50, p.width/2-20, p.height-60);
  p.fill('white');
  p.stroke('#d05af0');
  p.text("コードブロック", p.width/4 - 70, 10);
  p.stroke('#6f9efd');
  p.text("アクション", 20, 60);
  p.stroke('#7122fa');
  p.text("もしも", 20, 240);
  p.stroke('#C5C02C');
  p.text("こんなとき", 20, 420);
  p.stroke('red');
  p.text("ブロックをけす", p.width/2 - 200, 60);

  //Timer
  p.noStroke();
  p.fill('black');
  p.rect(p.width/2 - 30, 0, 60, 34);
  p.fill('white');
  if (timerCount > 50) p.fill('red');
  p.textAlign(p.CENTER);
  p.textSize(32);
  p.text(TIME_LIMIT - timerCount, p.width/2, 0);
  p.textAlign(p.LEFT);

  p.noFill();
  p.stroke('tomato');
  p.rect(p.width/2+10, 50, p.width/2-20, p.height-60);

  p.fill('white');
  p.text("あなたのプログラム", p.width*3/4 - 80, 10);
  p.textSize(18);
  p.noStroke();
  p.strokeWeight(1);
}

function drawProgram(p) {
  if (!codeStack.length) return;
  p.textSize(programFontSize);

  const indentWidth = 30;
  codeStack.forEach((element, idx) => {
    const { codeType, codeText } = element;
    const viewCode = showProgram ? textDict[codeText].code : codeText;
    let indentNum = calcIndentNum(codeStack.slice(0, idx));
    if (codeType === 'if-end') indentNum--;
    const x = p.width / 2 + 20 + indentWidth * indentNum;
    const y = idx * 30 + 60;
    const rectWidth = p.textWidth(viewCode) * 5 / 3;

    if (showProgram) {
      p.fill('black');
    } else {
      p.fill(getTypeColor(codeType));
      p.rect(x, y, rectWidth, 24, 16);
      p.fill('white');
    }

    const codeIndex = idx + 1;
    p.text(codeIndex + '. ' + viewCode, x + textXOffset, y + textYOffset);

    if (codeType === 'if-start') {
      const splittedCode = viewCode.split('  ');
      const condOffsetX = 60;
      if (1 < splittedCode[1].length) {
        p.fill(getTypeColor('condition'));
        p.rect(x + condOffsetX, y + 2, p.textWidth(splittedCode[1]) + 12, 20, 16);
        p.fill('white');
        p.text(splittedCode[1], x + textXOffset + condOffsetX, y + textYOffset);
      }
    }
  });
}

function drawMessage(p) {
  if (textMessage !== '') {
    const rectWidth = 530;
    const rectHeight = 110;
    const x = p.width/2 - rectWidth/2;
    const y = p.height/2 - rectHeight/2 - 40;
    p.strokeWeight(2);
    p.stroke('white');
    p.textSize(40);
    p.textFont('Verdana');
    p.fill('navy');
    p.rect(x, y, rectWidth, rectHeight);
    p.fill('white');
    p.text(textMessage, p.width/2 - rectWidth/2, p.height/2-rectHeight/2-30);
    p.textAlign(p.LEFT);
  }
}

function calcIndentNum(codeStackSlice) {
  const ifStartNum = codeStackSlice.filter(v => v.codeType === 'if-start').length;
  const ifEndNum = codeStackSlice.filter(v => v.codeType === 'if-end').length;
  return Math.max(ifStartNum - ifEndNum, 0);
}

function insertCode() {
  if (maxCodeStackLength <= codeStack.length) return;
  if (insertMode === 'normal') {
    codeStack.push({ "codeType": this.value(), "codeText": this.html() });
  }
}

//button handler
function handleIfStart() {
  if (maxCodeStackLength <= codeStack.length) return;
  if (insertMode === 'normal') {
    codeStack.push({ "codeType": this.value(), "codeText": this.html() });
    insertMode = 'condition';
  }
}

function insertCondition() {
  if (maxCodeStackLength <= codeStack.length) return;
  if (insertMode === 'condition') {
    const conditionText = this.elt.textContent;
    const replacedText = codeStack[codeStack.length-1].codeText.replace('◆', conditionText);
    codeStack[codeStack.length-1].codeText = replacedText;
    insertMode = 'normal';
  }
}

function handleIfEnd() {
  if (maxCodeStackLength <= codeStack.length) return;
  if (insertMode === 'normal' && calcIndentNum(codeStack) > 0) {
    codeStack.push({ "codeType": this.value(), "codeText": this.html() });
  }
}

function deleteLine() {
  codeStack.pop();
  insertMode = 'normal';
}

function deleteAll() {
  codeStack.splice(0);
  insertMode = 'normal';
}


export { sketch, isCodingMode, isSubmitted, codeStack, timerCount };
