import { Player } from '../gameObjects/Player.js';
import { Gun, Bullet } from '../gameObjects/guns.js';
document.body.style.cursor = 'none';
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

        // map generation
        this.snake = [];
        this.snake2 = [];
        this.food = {};
        this.direction = 'right';
        this.nextDirection = 'right';
        this.direction2 = 'left';
        this.nextDirection2 = 'left';
        this.gridSize = 16;
        this.snakeSpeed = 1;
        this.lastMoveTime = 0;
        this.isGameOver = false;
        this.snakesMoving = true;
    }

    create() {
        this.isGameOver = false;
        this.snakesMoving = true;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.cameras.main.setBackgroundColor(0x00ff00);
        this.add.image(512, 384, 'background').setAlpha(0.5);

        // Initialize snake
        this.snake = [];
        const startX = 25;
        const startY = 20;

        // Create initial snake body (1 segment)
        for (let i = 0; i < 1; i++) {
            const segment = this.add.rectangle(
                (startX - i) * this.gridSize,
                startY * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2,
                0x000000
            );
            this.snake.push(segment);
        }

        // Initialize second snake
        this.snake2 = [];
        const startX2 = 25;
        const startY2 = 20;
        for (let i = 0; i < 1; i++) {
            const segment2 = this.add.rectangle(
                (startX2 + i) * this.gridSize,
                startY2 * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2,
                0xff0000
            );
            this.snake2.push(segment2);
        }

        this.time.addEvent({
            delay: this.snakeSpeed,
            callback: this.chooseRandomDirection,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: this.snakeSpeed,
            callback: this.chooseRandomDirection2,
            callbackScope: this,
            loop: true
        });

        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
        this.cameras.main.startFollow(this.player);
        this.player.currentSide = 'right';
        this.lastSide = null;
        this.crosshair = this.add.image(this.scale.width / 2, this.scale.height / 2, 'crosshair')
            .setDepth(1)
            .setScrollFactor(0);

        this.gun = new Gun(this, this.player.x, this.player.y);
        this.gun.scale = 0.5;
        this.crosshair.scale = 0.53;

        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 20,
            runChildUpdate: true
        });

        this.input.on('pointermove', (pointer) => {
            const currentSide = pointer.worldX < this.player.x ? "left" : "right";

            this.player.currentSide = currentSide;

            if (currentSide !== this.lastSide) {
                console.log(`Mouse moved to the ${currentSide} side`);
                this.lastSide = currentSide;

                if (currentSide === "left")
                {
                    this.player.anims.play('lookleft', true);
                } 
                
                else 
                {
                    this.player.anims.play('lookright', true);
                }

                this.player.flipX = (currentSide === 'left');
            }

        });

        this.input.on('pointerdown', (pointer) => {
            if (!pointer.leftButtonDown()) {
                return;
            }

            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const bullet = this.bullets.get();

            if (bullet) {
                bullet.fire(this.gun.x, this.gun.y, worldPoint.x, worldPoint.y);
            }
        });

        this.keys = this.input.keyboard.addKeys('W,A,S,D');
    }

    update(time) 
    {
        if (this.isGameOver) return;

        const totalTilesCovered = this.snake.length + this.snake2.length;
        if (totalTilesCovered >= 200) {
            this.snakesMoving = false;
        }

        // Move snake at fixed intervals
        if (this.snakesMoving && time >= this.lastMoveTime + this.snakeSpeed) {
            this.moveSnake();
            this.moveSnake2();
            this.lastMoveTime = time;
        }

        this.player.update(this.keys);
        
        const pointer = this.input.activePointer;
        this.crosshair.x = pointer.x;
        this.crosshair.y = pointer.y;

        const crosshairWorld = this.cameras.main.getWorldPoint(this.crosshair.x, this.crosshair.y);
        const aimAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, crosshairWorld.x, crosshairWorld.y);
        const orbitRadius = 45;
        const targetX = this.player.x + Math.cos(aimAngle) * orbitRadius;
        const targetY = this.player.y + 8 + Math.sin(aimAngle) * orbitRadius;
        const isMouseLeft = crosshairWorld.x < this.player.x;

        this.gun.setFlipY(isMouseLeft);
        this.gun.setPosition(targetX, targetY);
        this.gun.rotation = Phaser.Math.Angle.RotateTo(this.gun.rotation, aimAngle, 0.35);
    }

    chooseRandomDirection() {
        const options = ['none'];

        if (this.direction === 'left' || this.direction === 'right') {
            options.push('up', 'down');
        } else {
            options.push('left', 'right');
        }

        const choice = Phaser.Math.RND.pick(options);
        if (choice !== 'none') {
            this.nextDirection = choice;
        }
    }

    chooseRandomDirection2() {
        const options = ['none'];

        if (this.direction2 === 'left' || this.direction2 === 'right') {
            options.push('up', 'down');
        } else {
            options.push('left', 'right');
        }

        const choice = Phaser.Math.RND.pick(options);
        if (choice !== 'none') {
            this.nextDirection2 = choice;
        }
    }

    moveSnake() {
        // Update current direction
        this.direction = this.nextDirection;

        // Calculate new head position
        const head = this.snake[0];
        let newX = head.x;
        let newY = head.y;

        switch (this.direction) {
            case 'left':
                newX -= this.gridSize;
                break;
            case 'right':
                newX += this.gridSize;
                break;
            case 'up':
                newY -= this.gridSize;
                break;
            case 'down':
                newY += this.gridSize;
                break;
        }

        // Check for food collision
        const eating = newX === this.food.x && newY === this.food.y;

        // Move snake
        const newHead = this.add.rectangle(newX, newY, this.gridSize - 2, this.gridSize - 2, 0x000000);
        this.snake.unshift(newHead);

        if (!eating) {
            // Remove tail if not eating
            // const tail = this.snake.pop();
            // tail.destroy();
        } else {
            // Spawn new food if eating
            this.food.destroy();
            this.spawnFood();
        }
    }

    moveSnake2() {
        this.direction2 = this.nextDirection2;

        const head = this.snake2[0];
        let newX = head.x;
        let newY = head.y;

        switch (this.direction2) {
            case 'left':
                newX -= this.gridSize;
                break;
            case 'right':
                newX += this.gridSize;
                break;
            case 'up':
                newY -= this.gridSize;
                break;
            case 'down':
                newY += this.gridSize;
                break;
        }

        const newHead = this.add.rectangle(newX, newY, this.gridSize - 2, this.gridSize - 2, 0xff0000);
        this.snake2.unshift(newHead);
    }
}
