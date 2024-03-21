const descEle = document.getElementById("desc");
const nextButton = document.getElementById("nextBtn");
const prevButton = document.getElementById("prevBtn");
const leftImage = document.getElementById("inputImg");
const rightImage = document.getElementById("gameImg");
const triSvg = document.getElementById("triangle");

const playerImagePath = "/image/p1_play.png";
const editorUrl = "/player1";

//const p1Html = 'あなたはプログラマーです。キャラのうごきをプログラムしてバトルにかちましょう。<br/>うえ、まんなか、したの移動と、 "こうげき" 、 "ためる"といったブロックをタッチして<br/>キャラのうごきをプログラムできます。';
const p1Html = '/Shotはプログラミングでたたかうシューティングゲームです．<br/>キャラクターのうごきをプログラミングして，相手を倒しましょう．<br/>コードブロックの「アクション」にあるブロックをタッチするとプログラムをつくれます．<ul><li><span class="bg-blue-300 rounded-lg font-bold">こうげき</span>：相手をこうげき</li><li><span class="bg-blue-300 rounded-lg font-bold">ためる</span>: こうげき力をあげる</li><li><span class="bg-blue-300 rounded-lg font-bold">うえ/したにうごく</span>：うえやしたにうごく</li>';

//const p2Html = 'まずはコードブロックをタッチしてブロックをならべてプログラムをつくりましょう。<br/> <span class="bg-purple-700 rounded-lg">もし-なら</span>のブロックでは、 <span class="bg-pink-300 rounded-lg">ばあい</span>のときだけキャラが<span class="bg-blue-300 rounded-lg">アクション</span>を行います。<br/>さいごは<span class="bg-purple-700 rounded-lg">もし-おわり</span>でとじましょう。プログラムができたら<span class="bg-green-600 rounded-lg">かんせい</span>をタッチしましょう。 ';

const p2Html = '「もしも」と「こんなとき」<br/><span class="bg-purple-700 rounded-lg font-bold">もし◇なら</span>と「こんなとき」の◇ブロックをあわせると，とくべつなうごきができます．</br>とくべつなうごきのおわりには，<span class="bg-purple-700 rounded-lg font-bold">もしおわり</span>をタッチしましょう.</br>プログラムができたら<span class="bg-green-500 rounded-lg font-bold">かんせい</span>をタッチします.</br>2人ともプログラムができたらバトル開始！';

prevButton.addEventListener("click", (e) => {
  e.preventDefault();
  descEle.innerHTML = p1Html;
  rightImage.src = playerImagePath;
  leftImage.classList.remove('hidden');
  triSvg.classList.remove('hidden');
  prevButton.classList.add('hidden');
  rightImage.classList.remove('w-2/3');
  rightImage.classList.add('w-1/3');
  nextButton.textContent = 'つぎへ';
});

nextButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (nextButton.textContent === 'はじめる！') {
    window.location.href = editorUrl;
  }
  descEle.innerHTML = p2Html;
  leftImage.classList.add('hidden');
  triSvg.classList.add('hidden');
  rightImage.src = "/image/input_example2.png";
  rightImage.classList.remove('w-1/3');
  rightImage.classList.add('w-2/3');
  prevButton.classList.remove('hidden');
  nextButton.textContent = 'はじめる！';
});
