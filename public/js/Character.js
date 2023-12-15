class Character {
    constructor(x, y, w, h) {
        this.position = createVector(x, y);
        this.vector = createVector(0.0, -1.0);
        this.width = w;
        this.height = h;
        this.ready = false;
    }

    setVector(x, y) {
        this.vector.set(x, y);
    }

    setVectorFromAngle(angle) {
        this.angle = angle;
        let s = sin(angle - HALF_PI);
        let c = cos(angle- HALF_PI);
        this.vector.set(c, s);
    }

    display() {
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;
        push();
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        text('O', - offsetX, - offsetY);
        pop();   
    }
}

class Player extends Character {
  constructor(appearance, x, y, w, h) {
    super(x, y, w, h);
    this._x = this.position.x;
    this._y = this.position.y;
    this._power = 20;
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
    this._y -= (bottomEdge - topEdge) / 2;
  }

  moveDown () {
    this.isCharging = false;
    this._y += (bottomEdge - topEdge) / 2;
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
    if (this.power > 60) return;
    for (let i = 0; i < this.shotArray.length; i++) {
      this.shotArray[i].setPower(this.power);
    }
  }

  discharge() {
    this.power -= 5;
    if (this.power <= 0) return;
    for (let i = 0; i < this.shotArray.length; i++) {
      this.shotArray[i].setPower(this.power);
    }
  }

  explode() {
    this.isCharging = false;
    push();
    fill('red');
    translate(this._x, this._y);
    for (let i = 0; i < TWO_PI; i+= radians(30)) {
      square(this.r * cos(i), this.r * sin(i), 20);
    }
    this.r+=2;
    this.appearance = '';
    pop();
  }

  display() {
    textSize(this.size);
    textAlign(CENTER, CENTER)
    text(this._appearance, this._x, this._y);
    textAlign(LEFT, BOTTOM);
    if (this.isCharging) {
      push();
      translate(this.x, this.y);
      stroke('orange');
      strokeWeight(8);
      rotate(frameCount * 0.04);
      for (let i = 0; i <= 360; i+=12) {
        point(cos(i) * this.size*3/4, sin(i) * this.size*3/4);
      }
      pop();
    }
  }

  update() {
    if (this.life <= 0) { return; }
      let tx = constrain(this._x, 0, width);
      let ty = constrain(this._y, topEdge, bottomEdge);
      this._x = tx;
      this._y = ty;
      this.display();
      this.shotCheckCounter++;
  }
}

class Shot extends Character {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.size = 52;
    this.speed = 60;
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
      if (this.power > 20) {
        this.appearance = "🪐";
      }
      if (this.life <= 0) return;
      if (this.position.x + this.width < 0 || this.position.x + this.width > width) {
        this.life = 0;
      }
      this.position.x += this.vector.x * this.speed;
      this.position.y += this.vector.y * this.speed;

      let dist = this.position.dist(createVector(this.target._x, this.target._y));
      
      if (this.target._life > 0 && dist <= (this.width + this.target.width) / 3) {
        this.target.reduceLife(this.power);
          if (this.target._life < 0) {
            this.target._life = 0;
          }
          this.life = 0;
      }
    textSize(this.size);
    textAlign(CENTER, CENTER)
    text(this.appearance, this.position.x, this.position.y);
    textAlign(LEFT, BOTTOM);

    }

    isCaptured() {
      if (this.position.y === this.target._y) return true;
    }
}
