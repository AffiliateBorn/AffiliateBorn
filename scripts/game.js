class FroggerGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.currentLevel = 1;
        this.highScore = this.loadHighScore();
        this.longestGameTime = this.loadLongestGameTime();
        this.startTime = null;
        this.timerInterval = null;
        this.frog = { x: 0, y: 0, width: 40, height: 40 };
        this.cars = [];
        this.powerUps = [];
        this.lanes = 5;
        this.laneHeight = 0;
        this.images = {};
        this.levelSettings = {
            1: { carSpeed: 2, numCars: 3 },
            2: { carSpeed: 3, numCars: 4 },
            3: { carSpeed: 4, numCars: 5 },
            4: { carSpeed: 5, numCars: 6 },
        };

        this.initializeGame();
    }

    initializeGame() {
        this.resizeCanvas();
        this.loadImages();
        this.resetFrog();
        this.updateGameSettings();
        this.generateCars();
        this.generatePowerUps();
        this.setupEventListeners();
        this.updateScoreboard();
        this.startTimer();
        this.gameLoop();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.laneHeight = this.canvas.height / (this.lanes + 1);
        this.resetFrog();
    }

    loadImages() {
        const imageNames = ['frog', 'car', 'car2', 'background', 'power_up'];
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

    updateGameSettings() {
        const settings = this.levelSettings[this.currentLevel] || {
            carSpeed: 2 + this.currentLevel,
            numCars: 3 + this.currentLevel,
        };

        this.carSpeed = settings.carSpeed;
        this.numCars = settings.numCars;
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timer').textContent = this.formatTime(elapsedTime);
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        if (elapsedTime > this.longestGameTime) {
            this.longestGameTime = elapsedTime;
            this.saveLongestGameTime(this.longestGameTime);
        }
        document.getElementById('longest-game').textContent = this.formatTime(this.longestGameTime);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    generateCars() {
        this.cars = [];
        for (let i = 1; i <= this.numCars; i++) {
            const isCarOne = i % 2 === 1;
            const car = {
                x: isCarOne ? Math.random() * this.canvas.width : -60,
                y: i * this.laneHeight,
                width: 60,
                height: 30,
                speed: isCarOne ? -this.carSpeed : this.carSpeed,
                type: isCarOne ? 'car' : 'car2'
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

        this.checkLevelCompletion();
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

        this.checkLevelCompletion();
    }

    checkLevelCompletion() {
        if (this.frog.y <= 0) {
            const levelPoints = 10 * this.currentLevel;
            this.score += levelPoints;

            // Show level completion message
            this.showLevelCompleteMessage(levelPoints, this.currentLevel);

            this.currentLevel++;
            this.resetFrog();
            this.updateGameSettings();
            this.generateCars();
            this.generatePowerUps();
            this.updateScoreboard();
        }
    }

    showLevelCompleteMessage(points, level) {
        const message = document.getElementById('level-complete-message');
        message.textContent = `You Earned ${points} Points for Beating Level ${level}!`;
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000); // Hide after 3 seconds
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
        this.updateScoreboard();
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
                    this.stopTimer();
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

    updateScoreboard() {
        document.getElementById('score').textContent = `Points: ${this.score}`;
        document.getElementById('lives').textContent = `Lives: ${this.lives}`;
        document.getElementById('level').textContent = `Level: ${this.currentLevel}`;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore(this.highScore);
        }

        document.getElementById('high-score').textContent = `High Score: ${this.highScore}`;
    }

    saveHighScore(score) {
        localStorage.setItem('froggerHighScore', score);
    }

    loadHighScore() {
        return parseInt(localStorage.getItem('froggerHighScore')) || 0;
    }

    saveLongestGameTime(time) {
        localStorage.setItem('froggerLongestGameTime', time);
    }

    loadLongestGameTime() {
        return parseInt(localStorage.getItem('froggerLongestGameTime')) || 0;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.drawImage(this.images.background, 0, 0, this.canvas.width, this.canvas.height);

        // Draw cars
        this.cars.forEach(car => {
            const carImage = this.images[car.type];
            this.ctx.drawImage(carImage, car.x, car.y, car.width, car.height);
        });

        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            this.ctx.drawImage(this.images['power_up'], powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        });

        // Draw frog
        this.ctx.drawImage(this.images.frog, this.frog.x, this.frog.y, this.frog.width, this.frog.height);
    }

    gameOver() {
        alert(`Game Over! Your score: ${this.score}`);
        this.score = 0;
        this.lives = 3;
        this.currentLevel = 1;
        this.resetFrog();
        this.updateGameSettings();
        this.generateCars();
        this.generatePowerUps();
        this.updateScoreboard();
    }
}

// Initialize the game when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new FroggerGame();
});
class FroggerGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.currentLevel = 1;
        this.highScore = this.loadHighScore();
        this.longestGameTime = this.loadLongestGameTime();
        this.startTime = null;
        this.timerInterval = null;
        this.frog = { x: 0, y: 0, width: 40, height: 40 };
        this.cars = [];
        this.powerUps = [];
        this.lanes = 5;
        this.laneHeight = 0;
        this.images = {};
        this.levelSettings = {
            1: { carSpeed: 2, numCars: 3 },
            2: { carSpeed: 3, numCars: 4 },
            3: { carSpeed: 4, numCars: 5 },
            4: { carSpeed: 5, numCars: 6 },
        };

        this.initializeGame();
    }

    initializeGame() {
        this.resizeCanvas();
        this.loadImages();
        this.resetFrog();
        this.updateGameSettings();
        this.generateCars();
        this.generatePowerUps();
        this.setupEventListeners();
        this.updateScoreboard();
        this.startTimer();
        this.gameLoop();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.laneHeight = this.canvas.height / (this.lanes + 1);
        this.resetFrog();
    }

    loadImages() {
        const imageNames = ['frog', 'car', 'car2', 'background', 'power_up'];
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

    updateGameSettings() {
        const settings = this.levelSettings[this.currentLevel] || {
            carSpeed: 2 + this.currentLevel,
            numCars: 3 + this.currentLevel,
        };

        this.carSpeed = settings.carSpeed;
        this.numCars = settings.numCars;
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timer').textContent = this.formatTime(elapsedTime);
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        if (elapsedTime > this.longestGameTime) {
            this.longestGameTime = elapsedTime;
            this.saveLongestGameTime(this.longestGameTime);
        }
        document.getElementById('longest-game').textContent = this.formatTime(this.longestGameTime);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    generateCars() {
        this.cars = [];
        for (let i = 1; i <= this.numCars; i++) {
            const isCarOne = i % 2 === 1;
            const car = {
                x: isCarOne ? Math.random() * this.canvas.width : -60,
                y: i * this.laneHeight,
                width: 60,
                height: 30,
                speed: isCarOne ? -this.carSpeed : this.carSpeed,
                type: isCarOne ? 'car' : 'car2'
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

        this.checkLevelCompletion();
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

        this.checkLevelCompletion();
    }

    checkLevelCompletion() {
        if (this.frog.y <= 0) {
            const levelPoints = 10 * this.currentLevel;
            this.score += levelPoints;

            // Show level completion message
            this.showLevelCompleteMessage(levelPoints, this.currentLevel);

            this.currentLevel++;
            this.resetFrog();
            this.updateGameSettings();
            this.generateCars();
            this.generatePowerUps();
            this.updateScoreboard();
        }
    }

    showLevelCompleteMessage(points, level) {
        const message = document.getElementById('level-complete-message');
        message.textContent = `You Earned ${points} Points for Beating Level ${level}!`;
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000); // Hide after 3 seconds
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
        this.updateScoreboard();
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
                    this.stopTimer();
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
        const padding = 10; // Reduced bounding box for better visual collision accuracy
        return (
            obj1.x + padding < obj2.x + obj2.width - padding &&
            obj1.x + obj1.width - padding > obj2.x + padding &&
            obj1.y + padding < obj2.y + obj2.height - padding &&
            obj1.y + obj1.height - padding > obj2.y + padding
        );
    }

    updateScoreboard() {
        document.getElementById('score').textContent = `Points: ${this.score}`;
        document.getElementById('lives').textContent = `Lives: ${this.lives}`;
        document.getElementById('level').textContent = `Level: ${this.currentLevel}`;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore(this.highScore);
        }

        document.getElementById('high-score').textContent = `High Score: ${this.highScore}`;
    }

    saveHighScore(score) {
        localStorage.setItem('froggerHighScore', score);
    }

    loadHighScore() {
        return parseInt(localStorage.getItem('froggerHighScore')) || 0;
    }

    saveLongestGameTime(time) {
        localStorage.setItem('froggerLongestGameTime', time);
    }

    loadLongestGameTime() {
        return parseInt(localStorage.getItem('froggerLongestGameTime')) || 0;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.drawImage(this.images.background, 0, 0, this.canvas.width, this.canvas.height);

        // Draw cars
        this.cars.forEach(car => {
            const carImage = this.images[car.type];
            this.ctx.drawImage(carImage, car.x, car.y, car.width, car.height);
        });

        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            this.ctx.drawImage(this.images['power_up'], powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        });

        // Draw frog
        this.ctx.drawImage(this.images.frog, this.frog.x, this.frog.y, this.frog.width, this.frog.height);
    }

    gameOver() {
        alert(`Game Over! Your score: ${this.score}`);
        this.score = 0;
        this.lives = 3;
        this.currentLevel = 1;
        this.resetFrog();
        this.updateGameSettings();
        this.generateCars();
        this.generatePowerUps();
        this.updateScoreboard();
    }
}

// Initialize the game when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new FroggerGame();
});

