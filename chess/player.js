class Actor {
    constructor(startX, startY){
        this.x = startX;
        this.y = startY;
    }

    move(dx, dy){
        this.x += dx;
        this.y += dy;
    }

    distanceTo(otherActor){
        let dx = otherActor.x - this.x;
        let dy = otherActor.y - this.y;
        return Math.hypot(dx, dy)
    }
}

class Player extends Actor {
    constructor(startX, startY){
        super(startX, startY){
            super(startX, startY);
            this.hp = 100;
        }
    }
}
