import io from 'socket.io-client';
const socket = io();

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
const editorUrl = "/player2";

const p1Html = 'このゲームはプログラミングでたたかうシューティングゲームです。<br/>キャラクターのうごきをプログラミングして、あいてをたおしましょう。<br/>水色のアクションブロックをタッチするとプログラムをつくれます。<ul class="m-2"><li><span class="bg-blue-300 rounded-lg font-bold p-1 my-2">こうげき</span>：あいてをこうげき</li><li><span class="bg-blue-300 rounded-lg font-bold p-1 my-2">ためる</span>: こうげき力をあげる</li><li><span class="bg-blue-300 rounded-lg font-bold p-1 my-2">うえ/したにうごく</span>：うえやしたにうごく</li>';

const p2Html = '<span class="bg-purple-700 rounded-lg font-bold p-1">もし◇なら</span>と<span class="bg-yellow-500 rounded-lg font-bold p-1">◇ブロック</span>をあわせると、とくべつなうごきができます。</br>たとえば、<span class="bg-purple-700 rounded-lg font-bold p-1">もし◇なら</span>のつぎに<span class="bg-yellow-500 rounded-lg font-bold p-1">おなじたかさ</span> をタッチすると、あいてとおなじたかさのときだけこうげきできます。</br>とくべつなうごきのおわりには、<span class="bg-purple-700 rounded-lg font-bold p-1">もしおわり</span>をタッチしましょう。</br>プログラムができたら<span class="bg-green-700 rounded-lg font-bold p-1">かんせい</span>をタッチ！</br>2人のプログラムがそろうとバトルかいし！';


prevButton.addEventListener("click", (e) => {
  e.preventDefault();
  descEle.innerHTML = p1Html;
  gameImg.src = playerImagePath;
  gameImg.width = 420;
  blocks.innerText = "1. ブロックをタッチ！";
  codeText.innerText = "2. ブロックが\nプログラム\nなるよ!";
  gameText.innerText = "3. プログラムでキャラがうごく!";
  blockImg.src = "/image/action_block.png";
  blockImg.width = 160;
  codeImg.src = "/image/basic_code.png";
  codeImg.width = 180;
  prevButton.classList.add('hidden');
  nextButton.textContent = 'つぎへ';
});

nextButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (nextButton.textContent === 'はじめる！') {
    window.location.href = '/p2Survey';
  }
  descEle.innerHTML = p2Html;
  blocks.innerText = "1. 「もし◇なら」と\n「おなじたかさ」を\nくみあわせて...";
  codeText.innerText = "2. 「もしおわり」でとじる";
  gameText.innerText = "3. あいてとおなじたかさのときだけ\nこうげきできる！";
  blockImg.src = "/image/condition_block.png";
  blockImg.width = 120;
  codeImg.src = "/image/condition_code.png";
  codeImg.width = 200;
  gameImg.src = "/image/condition_movie.gif";
  gameImg.width = 280;
  prevButton.classList.remove('hidden');
  nextButton.textContent = 'はじめる！';
});
