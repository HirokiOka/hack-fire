let gameState;

const gameInterval = 10000;

let aceEditor1 = ace.edit("player1-editor");
let aceEditor2 = ace.edit("player2-editor");
let editor1 = document.getElementById("editor1");
let editor2 = document.getElementById("editor2");


let enemyCode = `//Player2
player2.randomMove();
player2.shot();`;
let isCommandPressed =false;
let isReturnPressed = false;


aceEditor1.setValue(`//Player1

function player1Loop() {

}`);
aceEditor1.setOptions({
    fontSize: 18,
    theme: "ace/theme/chaos",
    mode: "ace/mode/javascript",
    wrap: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
});
aceEditor1.$blockScrolling = Infinity;

aceEditor2.setOptions({
    fontSize: 18,
    theme: "ace/theme/chaos",
    mode: "ace/mode/javascript",
    wrap: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
});
aceEditor2.setValue(`//Player2

function player2Loop() {

}`);
aceEditor2.$blockScrolling = Infinity;
