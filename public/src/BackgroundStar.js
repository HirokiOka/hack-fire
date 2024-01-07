export class BackgroundStar {
    constructor(size, speed, p) {
      this.p = p;
      this.size = size;
      this.speed = speed;
      this.color = "#ffffff";
      this.position = null;
    }

    set(x, y) {
      const { p } = this;
      this.position = p.createVector(x, y);
    }

    update() {
      const { p } = this;
      p.fill(this.color);
      this.position.x += this.speed;
      p.square(this.position.x - this.size / 2, this.position.y - this.size / 2, this.size);
      if (this.position.x + this.size > p.width) this.position.x = -this.size;
    }
}
