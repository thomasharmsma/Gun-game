import { Player } from '../gameObjects/player.js';
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
        this.gridSize = 64;
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

        const spawnX = this.scale.width / 2;
        const spawnY = this.scale.height / 2;

        this.snake = [];
        for (let i = 0; i < 1; i++) {
            const segment = this.add.image(
                spawnX + i * this.gridSize,
                spawnY,
                'desertfloor'
            ).setDepth(0);
            this.snake.push(segment);
        }

        this.snake2 = [];
        for (let i = 0; i < 1; i++) {
            const segment2 = this.add.image(
                spawnX + i * this.gridSize,
                spawnY,
                'desertfloor'
            ).setDepth(0);
            this.snake2.push(segment2);
        }

        this.snakeTimer = this.time.addEvent({
            delay: this.snakeSpeed,
            callback: this.chooseRandomDirection,
            callbackScope: this,
            loop: true
        });

        this.snakeTimer2 = this.time.addEvent({
            delay: this.snakeSpeed,
            callback: this.chooseRandomDirection2,
            callbackScope: this,
            loop: true
        });

        // dynamic camera
        class Camera {
            constructor(scene) {
                this.scene = scene;
                this.camera = scene.cameras.main;
                this.camera.setBounds(0, 0, 2000, 2000);
            }
        
            follow(target) {
                this.camera.startFollow(target);
            }
        }


        this.player = new Player(this, spawnX, spawnY);
        this.player.setDepth(2);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.player.currentSide = 'right';
        this.lastSide = null;
        this.crosshair = this.add.image(this.scale.width / 2, this.scale.height / 2, 'crosshair')
            .setDepth(11)
            .setScrollFactor(0);

        this.gun = new Gun(this, this.player.x, this.player.y);
        this.gun.setDepth(3);
        this.gun.scale = 0.5;
        this.crosshair.scale = 0.53;

        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 20,
            runChildUpdate: true
        });

        this.shotCooldown = 180;
        this.lastShotAt = 0;

        this.input.on('pointermove', (pointer) => {
            if (this.gamePaused) {
                return;
            }

            const currentSide = pointer.worldX < this.player.x ? "left" : "right";

            this.player.currentSide = currentSide;

            if (currentSide !== this.lastSide) {
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
            if (this.gamePaused) {
                return;
            }

            if (!pointer.leftButtonDown()) {
                return;
            }

            const now = this.time.now;
            if (now - this.lastShotAt < this.shotCooldown) {
                return;
            }

            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const bullet = this.bullets.get();

            if (bullet) {
                bullet.fire(this.gun.x, this.gun.y, worldPoint.x, worldPoint.y);
                this.lastShotAt = now;
            }
        });

        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.gamePaused = false;

        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause(!this.gamePaused);
        });

        this.createPauseMenu();
    }

    togglePause(paused) {
        this.gamePaused = paused;
        this.setPauseMenuVisible(paused);

        if (this.physics && this.physics.world) {
            if (paused) {
                this.physics.world.pause();
                this.player.setVelocity(0, 0);
            } else {
                this.physics.world.resume();
            }
        }

        if (this.snakeTimer) {
            this.snakeTimer.paused = paused;
        }

        if (this.snakeTimer2) {
            this.snakeTimer2.paused = paused;
        }
    }

    setPauseMenuVisible(visible) {
        if (!this.pauseMenuObjects) {
            return;
        }

        this.pauseMenuObjects.forEach(obj => obj.setVisible(visible));
    }

    createPauseMenu() {
        const centerX = this.scale.width / 2;
        const screenHeight = this.scale.height;
        const screenWidth = this.scale.width;

        const overlay = this.add.rectangle(centerX, screenHeight / 2, screenWidth, screenHeight, 0x000000, 0.35)
            .setScrollFactor(0)
            .setDepth(9)
            .setVisible(false);

        const title = this.add.image(centerX, 40, 'pause')
            .setScale(0.6)
            .setScrollFactor(0)
            .setDepth(10)
            .setOrigin(0.5, 0)
            .setVisible(false);

        const quit = this.add.image(20, screenHeight - 250, 'quitButton')
            .setScale(0.5)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(10)
            .setInteractive({ useHandCursor: true })
            .setVisible(false);

        const retry = this.add.image(20, screenHeight - 150, 'retryButton')
            .setScale(0.5)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(10)
            .setInteractive({ useHandCursor: true })
            .setVisible(false);

        const cont = this.add.image(screenWidth - 20, screenHeight - 150, 'continueButton')
            .setScale(0.5)
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setDepth(10)
            .setInteractive({ useHandCursor: true })
            .setVisible(false);

        quit.on('pointerdown', () => {
            this.scene.start('Start');
        });

        retry.on('pointerdown', () => {
            this.scene.restart();
        });

        cont.on('pointerdown', () => {
            this.togglePause(false);
        });

        this.pauseMenuObjects = [overlay, title, quit, retry, cont];
    }

    update(time) 
    {
        const pointer = this.input.activePointer;
        this.crosshair.x = pointer.x;
        this.crosshair.y = pointer.y;

        if (this.isGameOver || this.gamePaused) return;

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

        const cam = this.cameras.main;

        const offsetX = Phaser.Math.Clamp((this.scale.width / 2 - pointer.x) * 0.2, -120, 120);
        const offsetY = Phaser.Math.Clamp((this.scale.height / 2 - pointer.y) * 0.2, -80, 80);

        cam.followOffset.set(offsetX, offsetY);

        this.player.update(this.keys);

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

        // Move snake
        const newHead = this.add.image(newX, newY, 'desertfloor').setDepth(0);
        this.snake.unshift(newHead);
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

        const newHead = this.add.image(newX, newY, 'desertfloor').setDepth(0);
        this.snake2.unshift(newHead);
    }
}
