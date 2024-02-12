class Ball extends Entity {
    checkPaddleCollision(paddle, xSpeedAfterBounce) {
        let ballBox = this.boundingBox();
        let paddleBox = paddle.boundingBox();

        // Check if the ball and paddle overlap vertically and horizontally
        let collisionOccurred =
            ballBox.left < paddleBox.right &&
            ballBox.right > paddleBox.left &&
            ballBox.top < paddleBox.bottom &&
            ballBox.bottom > paddleBox.top;

        if (collisionOccurred) {
            let distanceFromTop = ballBox.top - paddleBox.top;
            let distanceFromBottom = paddleBox.bottom - ballBox.bottom;
            this.adjustAngle(distanceFromTop, distanceFromBottom);
            this.xSpeed = xSpeedAfterBounce;
        }
    }

    checkWallCollision(width, height, scores) {
        let ballBox = this.boundingBox();

        // Hit left wall
        if (ballBox.left < 0) {
            scores.rightScore++;
            this.init();
        }
        // Hit right wall
        if (ballBox.right > width) {
            scores.leftScore++;
            this.init();
        }
        // Hit top or bottom walls
        if (ballBox.top < 0 || ballBox.bottom > height) {
            this.ySpeed = -this.ySpeed;
        }
    }
}
