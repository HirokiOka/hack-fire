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
  'ちがうたかさ': { 'code': 'playerOne.y !== playerTwo.y', 'codeType': 'condition' },
  'あいてがこうげき': { 'code': 'enemy.isShooting === true', 'codeType': 'condition' },
  'あいてがためる': { 'code': 'enemy.isCharging === true', 'codeType': 'condition' }
};

const ptn1 = [
  'こうげき',
  'こうげき',
  'こうげき',
  'こうげき'
];
const ptn2 = [
  'もし  おなじたかさ  なら',
  'うえにうごく',
  'もし  -  おわり',
  'こうげき'
];
const ptn3 = [
  'もし  おなじたかさ  なら',
  'うえにうごく',
  'もし  -  おわり',
];
//x
const ptn4 = [
  'もし  ちがうたかさ  なら',
  'うえにうごく',
  'もし  -  おわり',
];
const ptn5 = [
  'もし  ちがうたかさ  なら',
  'うえにうごく',
  'もし  -  おわり',
  'うえにうごく',
];
const ptn6 = [
  'もし  ちがうたかさ  なら',
  'うえにうごく',
  'もし  -  おわり',
  'もし  おなじたかさ  なら',
  'したにうごく',
  'もし  -  おわり',
];

const ptn7 = [
  'もし  ちがうたかさ  なら',
  'うえにうごく',
  'もし  -  おわり',
  'こうげき',
  'もし  ちがうたかさ  なら',
  'したにうごく',
  'もし  -  おわり',
];

setInterval(() => {
  console.log(exeIndex, getExecSnippet(ptn7, 1));
}, 1000);

const playerOne = {
  y: 0
};
const playerTwo = {
  y: 0
};
let exeIndex = 0;
function getExecSnippet(codeStack, playerId) {
  let snippet = '';
  const playerObj = (playerId === 1) ? 'playerOne.': 'playerTwo.';
  const targetString = codeStack[exeIndex];
  console.log('target', targetString);

  if (!targetString.includes('もし')) {
    exeIndex = (exeIndex + 1) % codeStack.length;
    snippet = playerObj + textDict[targetString].code;
    return snippet;
  }

  if (targetString.includes('おわり')) {
    exeIndex = (exeIndex + 1) % codeStack.length;
    return getExecSnippet(codeStack, playerId);
  }else if (targetString.includes('もし')) {
    const condString = targetString.split('  ')[1];
    const cond = conditionDict[condString].code;
    if (eval(cond)) {
      exeIndex = (exeIndex + 1) % codeStack.length;
      return getExecSnippet(codeStack, playerId);
    } else {
      exeIndex = (codeStack.findIndex(v => v.includes('おわり')) + 1) % codeStack.length;
      return getExecSnippet(codeStack, playerId);
    }
  }
}
