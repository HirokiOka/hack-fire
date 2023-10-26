class BackgroundStar {
    constructor(size, speed) {
        this.size = size;
        this.speed = speed;
        this.color = "#ffffff";
        this.position = null;
    }

    set(x, y) {
        this.position = createVector(x, y);
    }

    update() {
        fill(this.color);
        this.position.x += this.speed;
        square(this.position.x - this.size / 2, this.position.y - this.size / 2, this.size);
        if (this.position.x + this.size > width) this.position.x = -this.size;
    }
}
