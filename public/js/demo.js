const barOffset = 40;
const barWidth = 40;
const barLength = 300;
let playerOne;
let playerTwo;

function setup() {
  let canvas = createCanvas(820, 640, P2D);
  canvas.parent('canvas');
  background('darkslateblue');
  playerOne = new Player('🐮👉', barOffset, height/2);
  playerTwo = new Player('🤞🐮', width-barOffset*4-64, height/2);
}

function draw() {
  background('darkslateblue');

  //Draw Parameters
  stroke('white');
  fill('red');
  rect(barOffset, barOffset, barLength, barWidth);

  stroke('white');
  fill('blue');
  rect(width/2 + barOffset*3/2, barOffset, barLength, barWidth);

  stroke('mediumpurple');
  strokeWeight(3);
  fill('black')
  textSize(24);
  textAlign(CENTER);
  text('Round 1', width/2, barOffset*3/4);

  strokeWeight(1);
  stroke('white');
  fill('black');
  const offX = 40;
  const offY = 80;
  quad(width/2 - offX, offY/2, width/2 - offX/2, offY, width/2 + offX/2, offY, width/2 + offX, offY/2);

  fill('white');
  textSize(24);
  text('10', width/2, barOffset + offY/4);

  //Draw Characters
  textAlign(LEFT);
  playerOne.display();
  playerTwo.display();
}

class Player{
  constructor(c, x, y) {
    this.c = c;
    this.x = x;
    this.y = y;
  }

  display() {
    textSize(108);
    text(this.c, this.x, this.y);
  }

  moveUp() {
    this.y -= height/4;
    if (this.y < height/3) this.y += height/4;
  }

  moveDown() {
    this.y += height/4;
    if (height < this.y) this.y -= height/4;
  }

  shot() {
  }

}


class ShotBall {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 4;
    this.size = 40;
  }

  display() {
    ellipse(this.x, this.y, this.size);
  }

  update() {
    this.x += this.speed;
  }

  destroy() {
  }

}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    playerTwo.moveUp();
  } else if (keyCode === DOWN_ARROW) {
    playerTwo.moveDown();
  }

  if (keyCode === 87) {
    playerOne.moveUp();
  } else if (keyCode === 83) {
    playerOne.moveDown();
  }
}
