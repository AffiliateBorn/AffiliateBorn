class FroggerGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.frog = { x: 0, y: 0, width: 40, height: 40 };
        this.cars = [];
        this.powerUps = [];
        this.lanes = 5;
        this.laneHeight = 0;
        this.images = {};

        this.initializeGame();
    }

    initializeGame() {
        this.resizeCanvas(tgApp.viewportHeight, tgApp.viewportHeight);
        this.loadImages();
        this.resetFrog();
        this.generateCars();
        this.generatePowerUps();
        this.setupEventListeners();
        this.gameLoop();
    }

    resizeCanvas(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.laneHeight = this.canvas.height / (this.lanes + 1);
        this.resetFrog();
    }

    loadImages() {
        const imageNames = ['frog', 'car', 'background', 'power_up'];
        imageNames.forEach(name => {
            const img = new Image();
            img.src = `assets/${name}.png`;
            this.images[name] = img;
        });
    }

    resetFrog() {
        this.frog.x = this.canvas.width / 2 - this.frog.width / 2;
        this.frog.y = this.canvas.height - this.frog.height;
    }

    generateCars() {
        this.cars = [];
        for (let i = 1; i <= this.lanes; i++) {
            const car = {
                x: Math.random() * this.canvas.width,
                y: i * this.laneHeight,
                width: 60,
                height: 30,
                speed: (Math.random() + 1) * 2 * (Math.random() < 0.5 ? 1 : -1)
            };
            this.cars.push(car);
        }
    }

    generatePowerUps() {
        this.powerUps = [];
        for (let i = 0; i < 3; i++) {
            const powerUp = {
                x: Math.random() * (this.canvas.width - 20),
                y: Math.random() * (this.canvas.height - this.laneHeight - 20) + this.laneHeight,
                width: 20,
                height: 20
            };
            this.powerUps.push(powerUp);
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
    }

    handleKeyPress(event) {
        const key = event.key;
        const moveDistance = 10;

        switch (key) {
            case 'ArrowUp':
                this.frog.y = Math.max(this.frog.y - moveDistance, 0);
                break;
            case 'ArrowDown':
                this.frog.y = Math.min(this.frog.y + moveDistance, this.canvas.height - this.frog.height);
                break;
            case 'ArrowLeft':
                this.frog.x = Math.max(this.frog.x - moveDistance, 0);
                break;
            case 'ArrowRight':
                this.frog.x = Math.min(this.frog.x + moveDistance, this.canvas.width - this.frog.width);
                break;
        }
    }

    handleTouch(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const moveDistance = 10;

        if (touch.clientY < this.canvas.height / 2) {
            this.frog.y = Math.max(this.frog.y - moveDistance, 0);
        } else {
            this.frog.y = Math.min(this.frog.y + moveDistance, this.canvas.height - this.frog.height);
        }

        if (touch.clientX < this.canvas.width / 2) {
            this.frog.x = Math.max(this.frog.x - moveDistance, 0);
        } else {
            this.frog.x = Math.min(this.frog.x + moveDistance, this.canvas.width - this.frog.width);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update() {
        this.moveCars();
        this.checkCollisions();
        this.checkPowerUpCollection();
        this.updateScore();
    }

    moveCars() {
        this.cars.forEach(car => {
            car.x += car.speed;
            if (car.x > this.canvas.width) {
                car.x = -car.width;
            } else if (car.x < -car.width) {
                car.x = this.canvas.width;
            }
        });
    }

    checkCollisions() {
        this.cars.forEach(car => {
            if (this.isColliding(this.frog, car)) {
                this.lives--;
                this.resetFrog();
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
    }

    checkPowerUpCollection() {
        this.powerUps = this.powerUps.filter(powerUp => {
            if (this.isColliding(this.frog, powerUp)) {
                this.score += 10;
                return false;
            }
            return true;
        });

        if (this.powerUps.length === 0) {
            this.generatePowerUps();
        }
    }

    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    updateScore() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('lives').textContent = `Lives: ${this.lives}`;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.drawImage(this.images.background, 0, 0, this.canvas.width, this.canvas.height);

        // Draw cars
        this.cars.forEach(car => {
            this.ctx.drawImage(this.images.car, car.x, car.y, car.width, car.height);
        });

        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            this.ctx.drawImage(this.images.power_up, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        });

        // Draw frog
        this.ctx.drawImage(this.images.frog, this.frog.x, this.frog.y, this.frog.width, this.frog.height);
    }

    gameOver() {
        alert(`Game Over! Your score: ${this.score}`);
        this.score = 0;
        this.lives = 3;
        this.resetFrog();
        this.generateCars();
        this.generatePowerUps();
    }
}

// Initialize the game when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new FroggerGame();
});