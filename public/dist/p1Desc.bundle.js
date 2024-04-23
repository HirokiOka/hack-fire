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

eval("const descEle = document.getElementById(\"desc\");\nconst nextButton = document.getElementById(\"nextBtn\");\nconst prevButton = document.getElementById(\"prevBtn\");\nconst blocks = document.getElementById(\"blocks\");\nconst blockImg = document.getElementById(\"blockImg\");\nconst codeExample = document.getElementById(\"codeExample\");\nconst codeImg = document.getElementById(\"codeImg\");\nconst codeText = document.getElementById(\"codeText\");\nconst game = document.getElementById(\"game\");\nconst gameImg = document.getElementById(\"gameImg\");\nconst gameText = document.getElementById(\"gameText\");\nconst triSvg = document.getElementById(\"triangle\");\n\nconst playerImagePath = \"/image/p1_basic_action.gif\";\nconst editorUrl = \"/player1\";\n\nconst p1Html = '<span class=\"text-2xl font-bold\">ゲームのきほん</span></br>このゲームはプログラミングでたたかうシューティングゲームです。<br/>キャラクターのうごきをプログラミングして、あいてをたおしましょう。<br/>水色のアクションブロックをタッチするとプログラムをつくれます。<ul class=\"m-2\"><li><span class=\"bg-blue-300 rounded-lg font-bold p-1 my-2\">こうげき</span>：あいてをこうげき</li><li><span class=\"bg-blue-300 rounded-lg font-bold p-1 my-2\">ためる</span>: こうげき力をあげる</li><li><span class=\"bg-blue-300 rounded-lg font-bold p-1 my-2\">うえ/したにうごく</span>：うえやしたにうごく</li>';\n\nconst p2Html = '<span class=\"font-bold text-2xl\">「もしも」と「こんなとき」</span><br/><span class=\"bg-purple-700 rounded-lg font-bold p-1\">もし◇なら</span>と「こんなとき」の<span class=\"bg-yellow-500 rounded-lg font-bold p-1\">◇ブロック</span>をあわせると、とくべつなうごきができます。</br>たとえば、<span class=\"bg-purple-700 rounded-lg font-bold p-1\">もし◇なら</span> + <span class=\"bg-yellow-500 rounded-lg font-bold p-1\">おなじたかさ</span> をタッチすると、あいてとじぶんのキャラクターのたかさがおなじときだけうごけます。</br>とくべつなうごきのおわりには、<span class=\"bg-purple-700 rounded-lg font-bold p-1\">もしおわり</span>をタッチしましょう.</br>プログラムができたら<span class=\"bg-green-700 rounded-lg font-bold p-1\">かんせい</span>をタッチします.</br>2人ともプログラムができたらバトルはじめ！';\n\nprevButton.addEventListener(\"click\", (e) => {\n  e.preventDefault();\n  descEle.innerHTML = p1Html;\n  gameImg.src = playerImagePath;\n  blocks.innerText = \"1. ブロックをタッチ！\";\n  codeText.innerText = \"2. ブロックが\\nプログラム\\nなるよ!\";\n  gameText.innerText = \"3. プログラムでキャラがうごく!\";\n  blockImg.src = \"/image/action_block.png\";\n  blockImg.width = 160;\n  codeImg.width = 180;\n  codeImg.src = \"/image/basic_code.png\";\n  gameImg.width = 480;\n  prevButton.classList.add('hidden');\n  nextButton.textContent = 'つぎへ';\n});\n\nnextButton.addEventListener(\"click\", (e) => {\n  e.preventDefault();\n  if (nextButton.textContent === 'はじめる！') {\n    openSurvey();\n  }\n  descEle.innerHTML = p2Html;\n  blocks.innerText = \"1. 「もし◇なら」と\\n「おなじたかさ」を\\nくみあわせて...\";\n  codeText.innerText = \"2. 「もしおわり」でとじる\";\n  gameText.innerText = \"3. あいてとおなじたかさのときだけ\\nこうげきできる！\";\n  blockImg.src = \"/image/condition_block.png\";\n  blockImg.width = 120;\n  codeImg.src = \"/image/condition_code.png\";\n  codeImg.width = 200;\n  gameImg.src = \"/image/condition_movie.gif\";\n  gameImg.width = 320;\n  prevButton.classList.remove('hidden');\n  nextButton.textContent = 'はじめる！';\n});\n\nfunction openSurvey() {\n  const surveyWindow = window.open('', 'survey', 'width=400,height=300');\n  surveyWindow.document.write(`\n      <h1>しつもんです</h1>\n      <form>\n          <p>プログラミングをしてみたい？</p>\n          <input type=\"radio\" id=\"very-high\" name=\"programming\" value=\"very-high\">\n          <label for=\"very-high\">とてもしてみたい！</label><br>\n          <input type=\"radio\" id=\"high\" name=\"programming\" value=\"high\">\n          <label for=\"high\">してみたい</label><br>\n          <input type=\"radio\" id=\"normal\" name=\"programming\" value=\"normal\">\n          <label for=\"low\">ふつう</label><br>\n          <input type=\"radio\" id=\"low\" name=\"programming\" value=\"low\">\n          <label for=\"low\">してみたくない</label><br>\n          <input type=\"radio\" id=\"very-low\" name=\"programming\" value=\"very-low\">\n          <label for=\"very-low\">ぜんぜんしてみたくない</label><br>\n          <button type=\"button\" onclick=\"submitSurvey()\">けってい！</button>\n      </form>\n  `);\n\n  surveyWindow.document.close();\n  surveyWindow.focus();\n\n  function submitSurvey() {\n    const selected = surveyWindow.document.querySelector('input[name=\"programming\"]:checked').value;\n    alert(`You selected ${selected}.`);\n    surveyWindow.close();\n    window.location.href = '/player1';\n  }\n  surveyWindow.submitSurvey = submitSurvey;\n}\n\n\n//# sourceURL=webpack://slash-shot/./public/src/p1Desc.js?");

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