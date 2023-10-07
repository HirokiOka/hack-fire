class Character {
    constructor(x, y, w, h, life) {
        this.position = createVector(x, y);
        this.vector = createVector(0.0, -1.0);
        this.width = w;
        this.height = h;
        this.life = life;
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

    draw() {
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
    constructor(x, y, w, h) {
        super(x, y, w, h, 0);
        this._x = this.position.x;
        this._y = this.position.y;
        this._power = 40;
        this.shotCheckCounter = 0;
        this.shotInterval = 10;
        this.shotArray = null;
        this._life = 100;
        this.code = null;
        this.isMoved = false;
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
        if (isStart) throw Error("Parameters cannot be changed");
        this._x = value;
    }

    set y(value) {
        if (isStart) throw Error("Parameters cannot be changed");
        this._y = value;
    }

    set life(value) {
        if (isStart) throw Error("Parameters cannot be changed");
        this._life = value;
    }

    set power(value) {
        if (isStart) throw Error("Parameters cannot be changed");
        this._power = value;
    }

    //Methods
    reduceLife() {
        this._life -= this.power;
        if (this._life < 0) this._life = 0;
    }

    setTarget(target) {
        this.target = target;
    }

    setShotArray(shotArray) {
        this.shotArray = shotArray;
    }

    setCode(code) {
        this.code = code;
    }

    moveUp () {
        if (this.isMoved) return;
        this._y -= 100;
        this.isMoved = true;
    }

    moveDown () {
        if (this.isMoved) return;
        this._y += 100;
        this.isMoved = true;
    }

    shot() {
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
    }

    explode() {
        push();
        fill('red');
        translate(this._x, this._y);
        for (let i = 0; i < TWO_PI; i+= radians(30)) {
            square(r * cos(i), r * sin(i), 20);
        }
        r+=2;
        pop();
    }

    draw() {
      /*
      let offsetX = this.width / 2;
      let offsetY = this.height / 2;
      push();
      translate(this._x, this._y);
      rotate(this.angle);
      text('O', - offsetX, - offsetY);
      pop();   
      */
      textSize(this.size);
      textAlign(CENTER, CENTER)
      text('O', this._x, this._y);
      textAlign(LEFT, BOTTOM);
    }

    update() {
        if (this.life <= 0) { return; }
        let tx = constrain(this._x, 0, width);
        let ty = constrain(this._y, topEdge, bottomEdge);
        // this.position.set(tx, ty);
        this._x = tx;
        this._y = ty;
        this.draw();
        this.shotCheckCounter++;
    }
}

class Shot extends Character {
    constructor(x, y, w, h) {
        super(x, y, w, h, 0);
        this.speed = 7;
        this.power = 20;
        this.target = null;
        this.sound = null;
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

    setSound(sound) {
        this.sound = sound;
    }

    update() {
        if (this.life <= 0) { return; }
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

            if (this.sound !== null && this.target.sound !== null) {
                if (this.target._life === 0) {
                    this.target.sound.play();
                } else {
                    //点滅
                    // this.target.
                    this.sound.play();
                }
            } 
            
        }
        this.draw();
    }

    isCaptured() {
        if (this.position.y === this.target._y) return true;
    }
}

/*
class BackgroundStar {
    constructor(size, speed, color="#ffffff") {
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.position = null;
    }

    set(x, y) {
        this.position = createVector(x, y);
    }

    update() {
        fill(this.color);
        this.position.x += this.speed;
        square(this.position.x - this.size / 2, this.position.y - this.size / 2, this.size);

        if (this.position.x + this.size > width) {
            this.position.x = -this.size;
        }
        
    }
}
*/
