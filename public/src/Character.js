import { Sound, hitSound, shotSound, chargeSound } from './Sound.js';

class Character {
    constructor(x, y, w, h, p) {
      this.p = p;
      this.position = p.createVector(x, y);
      this.vector = p.createVector(0.0, -1.0);
      this.width = w;
      this.height = h;
      this.ready = false;
    }

    setVector(x, y) {
      this.vector.set(x, y);
    }

    setVectorFromAngle(angle) {
      const { p } = this;
      this.angle = angle;
      let s = p.sin(angle - p.HALF_PI);
      let c = p.cos(angle- p.HALF_PI);
      this.vector.set(c, s);
    }

    display() {
      const { p } = this;
      let offsetX = this.width / 2;
      let offsetY = this.height / 2;
      p.push();
      p.translate(this.position.x, this.position.y);
      p.rotate(this.angle);
      p.p4text('O', - offsetX, - offsetY);
      p.pop();   
    }
}

class Player extends Character {
  static TOP_EDGE = 0;
  static BOTTOM_EDGE = 0;

  constructor(appearance, x, y, w, h, col, p) {
    super(x, y, w, h, p);
    this.p = p;
    this._x = this.position.x;
    this._y = this.position.y;
    this._power = 20;
    this._col = col;
    this.shotCheckCounter = 0;
    this.shotInterval = 10;
    this.shotArray = null;
    this._life = 100;
    this.code = null;
    this.size = 108;
    this.isCharging = false;
    this.target = null;
    this.r = 0;
    this._appearance = appearance;
  }

  static setEdge(topEdge, bottomEdge) {
    Player.TOP_EDGE = topEdge;
    Player.BOTTOM_EDGE = bottomEdge;
  }

  //Getter
  get x() {
      return this._x;
  }

  get y() {
      return this._y;
  }

  get life() {
      return this._life;
  }

  get power() {
      return this._power;
  }
  
  get col() {
    return this._col;
  }

  //Setter
  set x(value) {
      this._x = value;
  }

  set y(value) {
      this._y = value;
  }

  set life(value) {
      this._life = value;
  }

  set power(value) {
      this._power = value;
  }


  set appearance(value) {
    this._appearance = value;
  }

  //Methods
  reduceLife(value) {
    hitSound.play();
    this._life -= value;
    if (this._life < 0) this._life = 0;
  }

  setTarget(target) {
    if (target != null) {
        this.target = target;
    }
  }

  setShotArray(shotArray) {
      this.shotArray = shotArray;
  }

  setCode(code) {
      this.code = code;
  }

  moveUp () {
    this.isCharging = false;
    this._y -= (Player.BOTTOM_EDGE - Player.TOP_EDGE) / 2;
  }

  moveDown () {
    this.isCharging = false;
    this._y += (Player.BOTTOM_EDGE - Player.TOP_EDGE) / 2;
  }

  shot() {
    this.isCharging = false;
    shotSound.play();
    if (this.shotCheckCounter >= 0) {
      for (let i = 0; i < this.shotArray.length; i++) {
        if (this.shotArray[i].life <= 0) {
          this.shotArray[i].set(this._x, this._y);
          this.shotArray[i].setVectorFromAngle(this.angle);
          this.shotCheckCounter = -this.shotInterval;
          break;
        }
      }
    }
    this.discharge();
  }


  charge() {
    this.isCharging = true;
    this.power += 10;
    if (this.power >= 60) this.power = 60;
    chargeSound.play();
    for (let i = 0; i < this.shotArray.length; i++) {
      this.shotArray[i].setPower(this.power);
    }
  }

  discharge() {
    if (this.power <= 5) return;
    this.power -= 5;
    for (let i = 0; i < this.shotArray.length; i++) {
      this.shotArray[i].setPower(this.power);
    }
  }

  explode() {
    const { p } = this;
    this.isCharging = false;
    p.push();
    p.fill(this._col);
    p.translate(this._x, this._y);
    for (let i = 0; i < p.TWO_PI; i+= p.radians(30)) {
      p.square(this.r * p.cos(i), this.r * p.sin(i), 20);
    }
    this.r+=2;
    this.appearance = '';
    p.pop();
  }

  display() {
    const { p } = this;
    p.textSize(this.size);
    p.textAlign(p.CENTER, p.CENTER)
    p.text(this._appearance, this._x, this._y);
    p.textAlign(p.LEFT, p.BOTTOM);
    if (this.isCharging) {
      p.push();
      p.translate(this.x, this.y);
      p.stroke('orange');
      p.strokeWeight(8);
      p.rotate(p.frameCount * 0.04);
      for (let i = 0; i <= 360; i+=12) {
        p.point(p.cos(i) * this.size*3/4, p.sin(i) * this.size*3/4);
      }
      p.pop();
    }
  }

  update() {
    const { p } = this;
    if (this.life <= 0) { return; }
      let tx = p.constrain(this._x, 0, p.width);
      let ty = p.constrain(this._y, Player.TOP_EDGE, Player.BOTTOM_EDGE);
      this._x = tx;
      this._y = ty;
      this.display();
      this.shotCheckCounter++;
  }
}

class Shot extends Character {
  constructor(x, y, w, h, p) {
    super(x, y, w, h, p);
    this.p = p;
    this.size = 52;
    this.speed = 64;
    this.power = 20;
    this.sound = null;
    this.owner = null;
    this.appearance = "🌟";
  }
    set(x, y) {
      this.position.set(x, y);
      this.life = 1;
    }

    setPower(power) {
      this.power = power;
    }

    setTarget(target) {
      if (target != null) {
          this.target = target;
      }
    }

  setOwner(owner) {
    if (owner != null) {
      this.owner = owner;
    }
  }

    setSound(sound) {
      this.sound = sound;
    }

    update() {
      const { p } = this;
      if (this.life <= 0) return;
      if (this.position.x + this.width < 0 || this.position.x + this.width > p.width) {
        this.life = 0;
      }
      this.position.x += this.vector.x * this.speed;
      this.position.y += this.vector.y * this.speed;

      let dist = this.position.dist(p.createVector(this.target._x, this.target._y));
      
      if (this.target._life > 0 && dist <= (this.width + this.target.width) / 3) {
        this.target.reduceLife(this.power);
        if (this.target._life < 0) {
          this.target._life = 0;
        }
        this.life = 0;
      }
      p.textSize(this.size);
      p.textAlign(p.CENTER, p.CENTER)
      p.text(this.appearance, this.position.x, this.position.y);
      p.textAlign(p.LEFT, p.BOTTOM);
    }

    isCaptured() {
      if (this.position.y === this.target._y) return true;
    }
}

export { Player, Shot };
