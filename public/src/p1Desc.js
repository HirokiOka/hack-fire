const descEle = document.getElementById("desc");
const nextButton = document.getElementById("nextBtn");
const prevButton = document.getElementById("prevBtn");
const blocks = document.getElementById("blocks");
const blockImg = document.getElementById("blockImg");
const codeExample = document.getElementById("codeExample");
const codeImg = document.getElementById("codeImg");
const codeText = document.getElementById("codeText");
const game = document.getElementById("game");
const gameImg = document.getElementById("gameImg");
const gameText = document.getElementById("gameText");
const triSvg = document.getElementById("triangle");

const playerImagePath = "/image/p1_basic_action.gif";
const editorUrl = "/player1";

const p1Html = '<span class="text-2xl font-bold">ゲームのきほん</span></br>このゲームはプログラミングでたたかうシューティングゲームです。<br/>キャラクターのうごきをプログラミングして、あいてをたおしましょう。<br/>水色のアクションブロックをタッチするとプログラムをつくれます。<ul class="m-2"><li><span class="bg-blue-300 rounded-lg font-bold p-1 my-2">こうげき</span>：あいてをこうげき</li><li><span class="bg-blue-300 rounded-lg font-bold p-1 my-2">ためる</span>: こうげき力をあげる</li><li><span class="bg-blue-300 rounded-lg font-bold p-1 my-2">うえ/したにうごく</span>：うえやしたにうごく</li>';

const p2Html = '<span class="font-bold text-2xl">「もしも」と「こんなとき」</span><br/><span class="bg-purple-700 rounded-lg font-bold p-1">もし◇なら</span>と「こんなとき」の<span class="bg-yellow-500 rounded-lg font-bold p-1">◇ブロック</span>をあわせると、とくべつなうごきができます。</br>たとえば、<span class="bg-purple-700 rounded-lg font-bold p-1">もし◇なら</span> + <span class="bg-yellow-500 rounded-lg font-bold p-1">おなじたかさ</span> をタッチすると、あいてとじぶんのキャラクターのたかさがおなじときだけうごけます。</br>とくべつなうごきのおわりには、<span class="bg-purple-700 rounded-lg font-bold p-1">もしおわり</span>をタッチしましょう.</br>プログラムができたら<span class="bg-green-700 rounded-lg font-bold p-1">かんせい</span>をタッチします.</br>2人ともプログラムができたらバトルはじめ！';

prevButton.addEventListener("click", (e) => {
  e.preventDefault();
  descEle.innerHTML = p1Html;
  gameImg.src = playerImagePath;
  blocks.innerText = "1. ブロックをタッチ！";
  codeText.innerText = "2. ブロックが\nプログラムになるよ!";
  gameText.innerText = "3. プログラムでキャラがうごく!";
  codeImg.width = 200;
  codeImg.src = "/image/basic_code.png";
  gameImg.width = 480;
  prevButton.classList.add('hidden');
  nextButton.textContent = 'つぎへ';
});

nextButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (nextButton.textContent === 'はじめる！') {
    window.location.href = '/player1';
  }
  descEle.innerHTML = p2Html;
  blocks.innerText = "1. 「もし◇なら」と\n「おなじたかさ」をくみあわせて...";
  codeText.innerText = "2. 「もしおわり」でとじる";
  gameText.innerText = "3. あいてとおなじたかさのときだけこうげきできる！";
  codeImg.src = "/image/condition_code.png";
  codeImg.width = 320;
  gameImg.src = "/image/condition_movie.gif";
  gameImg.width = 320;
  prevButton.classList.remove('hidden');
  nextButton.textContent = 'はじめる！';
});
