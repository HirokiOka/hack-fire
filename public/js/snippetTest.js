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

const p1CodeStack = [
  'こうげき',
  'こうげき',
  'こうげき',
  'こうげき'
];
const ifCodeStack = [
  'こうげき',
  'もし  おなじたかさ  なら',
  'こうげき',
  'もし  おなじたかさ  なら',
  'うえにうごく',
  'もし  -  おわり',
  'もし  -  おわり',
  'こうげき'
];
//index インクリメンtto
//++exeIndex % codeStack.length

const playerOne = {
  y: 0
};
const playerTwo = {
  y: 0
};
let exeIndex = 0;
function getExecSnippet(codeStack, exeIndex, playerId) {
  let snippet = '';
  const playerObj = (playerId === 1) ? 'playerOne.': 'playerTwo.';
  const targetString = codeStack[exeIndex];

  if (targetString.includes('おわり')) {
    exeIndex = (exeIndex + 1) % codeStack.length;
    return getExecSnippet(codeStack, exeIndex, playerId);
  }else if (targetString.includes('もし')) {
    const condString = targetString.split('  ')[1];
    const cond = conditionDict[condString].code;
    if (eval(cond)) {
      exeIndex = (exeIndex + 1) % codeStack.length;
      return getExecSnippet(codeStack, exeIndex, playerId);
    } else {
      exeIndex = (codeStack.findIndex(v => v.includes('おわり')) + 1) % codeStack.length;
      return getExecSnippet(codeStack, exeIndex, playerId);
    }
  } else {
    exeIndex = (exeIndex + 1) % codeStack.length;
    snippet = playerObj + textDict[targetString].code;
  }
  return snippet;
}
setInterval(() => {
  console.log(exeIndex, getExecSnippet(ifCodeStack, exeIndex, 1));
}, 1000);
