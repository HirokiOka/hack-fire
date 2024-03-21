/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/src/p1Desc.js":
/*!******************************!*\
  !*** ./public/src/p1Desc.js ***!
  \******************************/
/***/ (() => {

eval("const descEle = document.getElementById(\"desc\");\nconst nextButton = document.getElementById(\"nextBtn\");\nconst prevButton = document.getElementById(\"prevBtn\");\nconst leftImage = document.getElementById(\"inputImg\");\nconst rightImage = document.getElementById(\"gameImg\");\nconst triSvg = document.getElementById(\"triangle\");\n\nconst playerImagePath = \"/image/p1_play.png\";\nconst editorUrl = \"/player1\";\n\n//const p1Html = 'あなたはプログラマーです。キャラのうごきをプログラムしてバトルにかちましょう。<br/>うえ、まんなか、したの移動と、 \"こうげき\" 、 \"ためる\"といったブロックをタッチして<br/>キャラのうごきをプログラムできます。';\nconst p1Html = '/Shotはプログラミングでたたかうシューティングゲームです．<br/>キャラクターのうごきをプログラミングして，相手を倒しましょう．<br/>コードブロックの「アクション」にあるブロックをタッチするとプログラムをつくれます．<ul><li><span class=\"bg-blue-300 rounded-lg font-bold\">こうげき</span>：相手をこうげき</li><li><span class=\"bg-blue-300 rounded-lg font-bold\">ためる</span>: こうげき力をあげる</li><li><span class=\"bg-blue-300 rounded-lg font-bold\">うえ/したにうごく</span>：うえやしたにうごく</li>';\n\n//const p2Html = 'まずはコードブロックをタッチしてブロックをならべてプログラムをつくりましょう。<br/> <span class=\"bg-purple-700 rounded-lg\">もし-なら</span>のブロックでは、 <span class=\"bg-pink-300 rounded-lg\">ばあい</span>のときだけキャラが<span class=\"bg-blue-300 rounded-lg\">アクション</span>を行います。<br/>さいごは<span class=\"bg-purple-700 rounded-lg\">もし-おわり</span>でとじましょう。プログラムができたら<span class=\"bg-green-600 rounded-lg\">かんせい</span>をタッチしましょう。 ';\n\nconst p2Html = '「もしも」と「こんなとき」<br/><span class=\"bg-purple-700 rounded-lg font-bold\">もし◇なら</span>と「こんなとき」の◇ブロックをあわせると，とくべつなうごきができます．</br>とくべつなうごきのおわりには，<span class=\"bg-purple-700 rounded-lg font-bold\">もしおわり</span>をタッチしましょう.</br>プログラムができたら<span class=\"bg-green-500 rounded-lg font-bold\">かんせい</span>をタッチします.</br>2人ともプログラムができたらバトル開始！';\n\nprevButton.addEventListener(\"click\", (e) => {\n  e.preventDefault();\n  descEle.innerHTML = p1Html;\n  rightImage.src = playerImagePath;\n  leftImage.classList.remove('hidden');\n  triSvg.classList.remove('hidden');\n  prevButton.classList.add('hidden');\n  rightImage.classList.remove('w-2/3');\n  rightImage.classList.add('w-1/3');\n  nextButton.textContent = 'つぎへ';\n});\n\nnextButton.addEventListener(\"click\", (e) => {\n  e.preventDefault();\n  if (nextButton.textContent === 'はじめる！') {\n    window.location.href = editorUrl;\n  }\n  descEle.innerHTML = p2Html;\n  leftImage.classList.add('hidden');\n  triSvg.classList.add('hidden');\n  rightImage.src = \"/image/input_example2.png\";\n  rightImage.classList.remove('w-1/3');\n  rightImage.classList.add('w-2/3');\n  prevButton.classList.remove('hidden');\n  nextButton.textContent = 'はじめる！';\n});\n\n\n//# sourceURL=webpack://slash-shot/./public/src/p1Desc.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./public/src/p1Desc.js"]();
/******/ 	
/******/ })()
;