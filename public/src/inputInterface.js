import io from 'socket.io-client';
const socket = io();

const TIME_LIMIT = 60; 
const maxCodeStackLength = 15;
const textXOffset = 10;
const textYOffset = 3;
const programFontSize = 20;
let isSubmitted = false;
let isCodingMode = false;
let showProgram = false;
let insertMode = 'normal';
let codeStack = [];
let textMessage = '';
let buttons = [];
let kaiso;
let timerCount = 0; 
const textDict = {
  'こうげき': { 
    code: 'shot();', codeType: 'action',
    viewText: 'こうげき', position: [20, 60]
  },
  'ためる': { 
    code: 'charge();', codeType: 'action',
    viewText: 'ためる', position: [120, 60] 
  },
  'うえにうごく': {
    code: 'moveUp();', codeType: 'action',
    viewText: 'うえにうごく', position: [20, 120]
  },
  'したにうごく': {
    code: 'moveDown();', codeType: 'action',
    viewText: 'したにうごく', position: [160, 120]
  },
  'もし  -  なら': {
    code: 'if () {', codeType: 'if-start',
    viewText: 'もし  -  なら',  position: [20, 180]
  },
  'もし  -  おわり': {
    code: '}', codeType: 'if-end',
    viewText: 'もし  -  おわり', position: [20, 240]
  },
  'おなじたかさ': {
    code: 'playerOne.y === playerTwo.y', codeType: 'condition',
    viewText: 'おなじたかさ', position: [20, 300] 
  },
  'ちがうたかさ': {
    code: 'playerOne.y !== playerTwo.y', codeType: 'condition',
    viewText: 'ちがうたかさ', position: [160, 300]
  }
};

const sketch = (p, playerNum) => {

  const initMetaData = (playerNum) => {
    if (playerNum === 1) {
      return {
        color: 'brown',
        returnUrl: '/p1_title',
        playerId: 'playerOne',
        retryEventName: 'p1_retry',
      };
    } else {
      return {
        color: '#3b4279',
        returnUrl: '/p2_title',
        playerId: 'playerTwo',
        retryEventName: 'p2_retry',
      };
    }
  };
  const metaData = initMetaData(playerNum);

  function sendMessage(message) {
    socket.emit(metaData.playerId, message);
  }

  p.preload = () => {
    kaiso = p.loadFont('../font/kaiso_up/Kaisotai-Next-UP-B.otf');
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textAlign(p.LEFT, p.TOP);
    // Initialize buttons
    initButtons(p);

    const editButtons = {
      'かんせい': { 
        value: 'none', color: 'green', viewText: 'かんせい', 
        position: [p.width * 3/4 - 20, p.height - 80], handler: submitCode,
      },
      '1つけす': { 
        value: 'none', color: 'tomato', viewText: '1つけす', 
        position: [p.width / 2 - 100, p.height - 160] ,handler: deleteLine,
      },
      'ぜんぶけす': {
        value: 'none', color: 'red', viewText: 'ぜんぶけす', 
        position: [p.width / 2 - 120, p.height - 80], handler: deleteAll,
      },
      'ゲームをやめる': { 
        value: 'none', color: 'black', viewText: 'ゲームをやめる', 
        position: [20, p.height - 80], handler: returnToTitle,
      }
    };
    for (const { value, color, viewText, position, handler } of Object.values(editButtons)) {
      buttons.push(createStyledButton(p, viewText, value, color, ...position, handler));
    }

    p.textFont(kaiso);
  };

  p.draw = () => {
    p.background(metaData.color);
    drawUI(p);
    drawProgram(p);
    //drawMessage();
    if (textMessage !== '') {
      p.strokeWeight(2);
      p.stroke('white');
      p.textSize(40);
      p.textFont('Verdana');
      p.fill('navy');
      const rectWidth = 530;
      const rectHeight = 110;
      const x = p.width/2 - rectWidth/2;
      const y = p.height/2 - rectHeight/2 - 60;
      p.rect(x, y, rectWidth, rectHeight);
      p.fill('white');
      p.text(textMessage, p.width/2 - rectWidth/2, p.height/2-rectHeight/2-50);
      p.textAlign(p.LEFT);
    }
    p.textFont(kaiso);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  socket.on('gameStart', (_) => {
    textMessage = 'プログラムじっこうちゅう！\nまんなかのがめんをみてね！';
  });

  socket.on('coding', (msg) => {
    console.log(msg);
    textMessage = '';
    isCodingMode = true;
    isSubmitted = false;
    timerCount = 0;
  });

  socket.on('connection', () => {
    console.log('connected to server: player1');
    sendMessage(metaData.playerId,'join');
  });

  socket.on('gameOver', (_) => {
    if (window.confirm('リトライしますか？')) {
      sendMessage(metaData.retryEventName);
      window.location.reload();
    } else {
      sendMessage('cancel');
      window.location.href = metaData.returnUrl;
    }
  });

  socket.on('cancel', (_) => {
      window.location.href = metaData.returnUrl;
  });

  function submitCode() {
    if (timerCount >= TIME_LIMIT) {
      isSubmitted = true;
      isCodingMode = false;
      sendMessage('submit');
      sendMessage([]);
      return;
    } else if (codeStack.length === 0) {
      alert('プログラムがありません');
      return;
    } else if (calcIndentNum(codeStack) > 0) {
      alert('[もし - おわり] がたりません');
      return;
    } else if (codeStack.map(v => v.codeType).findIndex(e => e === 'action') === -1) {
      alert('キャラクターのうごきが入力されていません');
      return;
    }
    isSubmitted = true;
    isCodingMode = false;
    sendMessage('submit');
    sendMessage(codeStack);
    textMessage = 'じゅんびOK！\nあいてをまっています.';
  }

  function returnToTitle(href) {
    if (window.confirm('ゲームをやめてタイトルにもどります．\nよろしいですか？')) {
      sendMessage('cancel');
      window.location.href = href;
    }
  }
}


function drawMessage() {
  if (textMessage !== '') {
    strokeWeight(2);
    stroke('white');
    textSize(40);
    textFont('Verdana');
    fill('navy');
    const rectWidth = 530;
    const rectHeight = 110;
    const x = p.width/2 - rectWidth/2;
    const y = p.height/2 - rectHeight/2 - 60;
    rect(x, y, rectWidth, rectHeight);
    fill('white');
    text(textMessage, p.width/2 - rectWidth/2, p.height/2-rectHeight/2-50);
    textAlign(p.LEFT);
  }
}


function initButtons(p) {
  for (const { code, codeType, viewText, position } of Object.values(textDict)) {
    const bgColor = getTypeColor(codeType);
    const handler = getButtonHandler(codeType);
    buttons.push(createStyledButton(p, viewText, codeType, bgColor, ...position, handler));
  }
}

function createStyledButton(p, label, value, bgColor, x, y, mousePressedHandler) {
  const btn = p.createButton(label);
  btn.value(value)
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
    case 'action': return '#6f9efd';
    case 'if-start':return '#7122fa';
    case 'if-end': return '#7122fa';
    case 'condition': return '#ffacfc';
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

function drawUI(p) {
  p.stroke(0);
  //Center line
  p.textSize(24);
  p.noFill();
  p.strokeWeight(3);
  p.stroke('#d05af0');
  p.rect(10, 40, p.width/2-20, p.height-60);
  p.fill('white');
  p.stroke('#d05af0');
  p.text("コードブロック", p.width/4 - 70, 10);

  p.noStroke();
  p.fill(0);
  p.rect(p.width/2 - 30, 0, 60, 34);
  p.fill('white');
  if (timerCount > 50) p.fill('red');
  p.textAlign(p.CENTER);
  p.textSize(32);
  p.text(TIME_LIMIT - timerCount, p.width/2, 0);
  p.textAlign(p.LEFT);

  p.noFill();
  p.stroke('tomato');
  p.rect(p.width/2+10, 40, p.width/2-20, p.height-60);

  p.fill('white');
  p.text("プログラム", p.width*3/4 - 50, 10);
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
      p.fill(0);
    } else {
      p.fill(getTypeColor(codeType));
      p.rect(x, y, rectWidth, 24, 16);
      p.fill(255);
    }

    const codeIndex = idx + 1;
    p.text(codeIndex + '. ' + viewCode, x + textXOffset, y + textYOffset);

    if (codeType === 'if-start') {
      const splittedCode = viewCode.split('  ');
      const condOffsetX = 60;
      if (1 < splittedCode[1].length) {
        p.fill(getTypeColor('condition'));
        p.rect(x + condOffsetX, y + 2, p.textWidth(splittedCode[1]) + 12, 20, 16);
        p.fill(255);
        p.text(splittedCode[1], x + textXOffset + condOffsetX, y + textYOffset);
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
    const replacedText = codeStack[codeStack.length-1].codeText.replace('-', this.html());
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
