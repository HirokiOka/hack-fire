const descEle = document.getElementById("desc");
const nextButton = document.getElementById("nextBtn");
const prevButton = document.getElementById("prevBtn");
const leftImage = document.getElementById("inputImg");
const rightImage = document.getElementById("gameImg");
const triSvg = document.getElementById("triangle");

const p1Html = 'あなたはプログラマーです。キャラのうごきをプログラムしてバトルにかちましょう。<br/>うえ、まんなか、したの移動と、 "こうげき" 、 "ためる"といったブロックをタッチして<br/>キャラのうごきをプログラムできます。';

const p2Html = 'まずはコードブロックをタッチしてブロックをならべてプログラムをつくりましょう。<br/> <span class="bg-purple-700 rounded-lg">もし-なら</span>のブロックでは、 <span class="bg-pink-300 rounded-lg">ばあい</span>のときだけキャラが<span class="bg-blue-300 rounded-lg">アクション</span>を行います。<br/>さいごは<span class="bg-purple-700 rounded-lg">もし-おわり</span>でとじましょう。プログラムができたら<span class="bg-green-600 rounded-lg">かんせい</span>をタッチしましょう。 ';

prevButton.addEventListener("click", (e) => {
  e.preventDefault();
  descEle.innerHTML = p1Html;
  rightImage.src = "/image/p1_play.png";
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
    window.location.href = '/player2';
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
