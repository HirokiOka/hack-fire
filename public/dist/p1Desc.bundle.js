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

eval("const descEle = document.getElementById(\"desc\");\nconst nextButton = document.getElementById(\"nextBtn\");\nconst prevButton = document.getElementById(\"prevBtn\");\nconst blocks = document.getElementById(\"blocks\");\nconst blockImg = document.getElementById(\"blockImg\");\nconst codeImg = document.getElementById(\"codeImg\");\nconst codeText = document.getElementById(\"codeText\");\nconst gameImg = document.getElementById(\"gameImg\");\nconst gameText = document.getElementById(\"gameText\");\n\nconst playerImagePath = \"/image/p1_basic_action.gif\";\n\nconst p1Html = 'このゲームはプログラミングでたたかうシューティングゲームです。<br/>キャラクターのうごきをプログラミングして、あいてをたおしましょう。<br/>水色のアクションブロックをタッチするとプログラムをつくれます。<ul class=\"m-2\"><li><span class=\"bg-blue-300 rounded-lg font-bold p-1 my-2\">こうげき</span>：あいてをこうげき</li><li><span class=\"bg-blue-300 rounded-lg font-bold p-1 my-2\">ためる</span>: こうげき力をあげる</li><li><span class=\"bg-blue-300 rounded-lg font-bold p-1 my-2\">うえ/したにうごく</span>：うえやしたにうごく</li>';\n\nconst p2Html = '<span class=\"bg-purple-700 rounded-lg font-bold p-1\">もし◇なら</span>と<span class=\"bg-yellow-500 rounded-lg font-bold p-1\">◇ブロック</span>をあわせると、とくべつなうごきができます。</br>たとえば、<span class=\"bg-purple-700 rounded-lg font-bold p-1\">もし◇なら</span>のつぎに<span class=\"bg-yellow-500 rounded-lg font-bold p-1\">おなじたかさ</span> をタッチすると、あいてとおなじたかさのときだけこうげきできます。</br>とくべつなうごきのおわりには、<span class=\"bg-purple-700 rounded-lg font-bold p-1\">もしおわり</span>をタッチしましょう。</br>プログラムができたら<span class=\"bg-green-700 rounded-lg font-bold p-1\">かんせい</span>をタッチ！</br>2人のプログラムがそろうとバトルかいし！';\n\nprevButton.addEventListener(\"click\", (e) => {\n  e.preventDefault();\n  descEle.innerHTML = p1Html;\n  gameImg.src = playerImagePath;\n  gameImg.width = 420;\n  blocks.innerText = \"1. ブロックをタッチ！\";\n  codeText.innerText = \"2. ブロックが\\nプログラム\\nなるよ!\";\n  gameText.innerText = \"3. プログラムでキャラがうごく!\";\n  blockImg.src = \"/image/action_block.png\";\n  blockImg.width = 160;\n  codeImg.src = \"/image/basic_code.png\";\n  codeImg.width = 180;\n  prevButton.classList.add('hidden');\n  nextButton.textContent = 'つぎへ';\n});\n\nnextButton.addEventListener(\"click\", (e) => {\n  e.preventDefault();\n  if (nextButton.textContent === 'はじめる！') {\n    window.location.href = '/p1Survey';\n  }\n  descEle.innerHTML = p2Html;\n  blocks.innerText = \"1. 「もし◇なら」と\\n「おなじたかさ」を\\nくみあわせて...\";\n  codeText.innerText = \"2. 「もしおわり」でとじる\";\n  gameText.innerText = \"3. あいてとおなじたかさのときだけ\\nこうげきできる！\";\n  blockImg.src = \"/image/condition_block.png\";\n  blockImg.width = 120;\n  codeImg.src = \"/image/condition_code.png\";\n  codeImg.width = 200;\n  gameImg.src = \"/image/condition_movie.gif\";\n  gameImg.width = 280;\n  prevButton.classList.remove('hidden');\n  nextButton.textContent = 'はじめる！';\n});\n\n\n//# sourceURL=webpack://slash-shot/./public/src/p1Desc.js?");

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