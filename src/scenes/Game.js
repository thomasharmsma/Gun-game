import { Player } from '../gameObjects/player.js';
import { Gun, Bullet, EnemyBullet } from '../gameObjects/guns.js';
import { Enemy } from '../gameObjects/enemy.js';
document.body.style.cursor = 'none';
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

        // map generation
        this.floorTiles = new Set();
        this.wallTiles = new Map();
        this.gridSize = 64;
        this.snakeSpeed = 1;
        this.lastMoveTime = 0;
    }

    create() {
        this.isGameOver = false;
        this.snakesMoving = true;
        this.enemiesSpawned = false;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.direction2 = 'left';
        this.nextDirection2 = 'left';
        this.cameras.main.setBackgroundColor(0xa98e67);

        const spawnX = this.scale.width / 2;
        const spawnY = this.scale.height / 2;

        this.snake = [];
        for (let i = 0; i < 1; i++) {
            const segment = this.addFloorTile(
                spawnX + i * this.gridSize,
                spawnY
            );
            this.snake.push(segment);
        }

        this.snake2 = [];
        for (let i = 0; i < 1; i++) {
            const segment2 = this.addFloorTile(
                spawnX + i * this.gridSize,
                spawnY + this.gridSize
            );
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
        this.enemies = this.physics.add.group();
        this.player.setDepth(2);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.player.currentSide = 'right';
        this.lastSide = null;

        this.hitboxesVisible = false;
        this.wallHitboxGraphics = this.add.graphics();
        this.wallHitboxGraphics.setDepth(20);
        this.wallHitboxGraphics.lineStyle(2, 0x00ff00, 1);
        this.wallHitboxGraphics.clear();

        this.bulletHitboxGraphics = this.add.graphics();
        this.bulletHitboxGraphics.setDepth(20);
        this.bulletHitboxGraphics.lineStyle(2, 0x0000ff, 1);
        this.bulletHitboxGraphics.clear();

        this.wallTiles.forEach((wall) => {
            this.physics.add.collider(this.player, wall);
        });

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

        this.enemyBullets = this.physics.add.group({
            classType: EnemyBullet,
            maxSize: 50,
            runChildUpdate: true
        });
        this.enemyShootRange = this.gridSize * 5;
        this.enemyShotCooldown = 2000;

        this.setupBulletWallColliders();
        this.physics.add.collider(this.enemies, this.bullets, this.handleBulletEnemyCollision, undefined, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.handleEnemyBulletPlayerCollision, undefined, this);

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
                bullet.fire(this.player.x, this.player.y, worldPoint.x, worldPoint.y);
                this.lastShotAt = now;
            }
        });

        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.gamePaused = false;

        this.input.keyboard.on('keydown-H', () => {
            this.hitboxesVisible = !this.hitboxesVisible;
            if (!this.hitboxesVisible) {
                this.wallHitboxGraphics.clear();
                this.bulletHitboxGraphics.clear();
                this.player.hitboxGraphics.clear();
                this.clearEnemyHitboxes();
            }
        });

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

    getTileKey(x, y) {
        return `${x},${y}`;
    }

    addFloorTile(x, y) {
        const tileKey = this.getTileKey(x, y);
        const existingWall = this.wallTiles.get(tileKey);

        if (existingWall) {
            existingWall.destroy();
            this.wallTiles.delete(tileKey);
        }

        const floorTile = this.add.image(x, y, 'desertfloor').setDepth(-2);

        if (!this.floorTiles.has(tileKey)) {
            this.floorTiles.add(tileKey);
            this.addBorderWalls(x, y);
        }

        return floorTile;
    }

    addBorderWalls(x, y) {

        
        const borderOffsets = [
            [-this.gridSize, 0],
            [this.gridSize, 0],
            [0, -this.gridSize],
            [0, this.gridSize],
            [-this.gridSize, -this.gridSize],
            [this.gridSize, this.gridSize],
            [this.gridSize, -this.gridSize],
            [-this.gridSize, this.gridSize]
        ];

        borderOffsets.forEach(([offsetX, offsetY]) => {
            const wallX = x + offsetX;
            const wallY = y + offsetY;
            const wallKey = this.getTileKey(wallX, wallY);

            if (this.floorTiles.has(wallKey) || this.wallTiles.has(wallKey)) {
                return;
            }

            const wall = this.add.image(wallX, wallY, 'wall1').setDepth(1);
            this.physics.add.existing(wall, true);
            wall.body.setSize(this.gridSize, this.gridSize);
            this.wallTiles.set(wallKey, wall); 

            if (this.player) {
                this.physics.add.collider(this.player, wall);
            }

            if (this.enemies) {
                this.physics.add.collider(this.enemies, wall);
            }

            if (this.bullets) {
                this.physics.add.collider(wall, this.bullets, this.handleBulletWallCollision, undefined, this);
            }

            if (this.enemyBullets) {
                this.physics.add.collider(wall, this.enemyBullets, this.handleBulletWallCollision, undefined, this);
            }
        });
    }

    drawWallHitboxes() {
        if (!this.wallHitboxGraphics) {
            return;
        }

        this.wallHitboxGraphics.clear();
        this.wallHitboxGraphics.lineStyle(2, 0x00ff00, 1);

        this.wallTiles.forEach((wall) => {
            if (!wall.body) {
                return;
            }

            const body = wall.body;
            this.wallHitboxGraphics.strokeRect(body.x, body.y, body.width, body.height);
        });
    }

    drawBulletHitboxes() {
        if (!this.bulletHitboxGraphics || !this.bullets) {
            return;
        }

        this.bulletHitboxGraphics.clear();
        this.bulletHitboxGraphics.lineStyle(2, 0x0000ff, 1);

        const bulletGroups = [this.bullets, this.enemyBullets].filter(Boolean);

        bulletGroups.forEach((bulletGroup) => bulletGroup.getChildren().forEach((bullet) => {
            if (!bullet.active || !bullet.body) {
                return;
            }

            const body = bullet.body;
            if (body.circle) {
                const radius = body.radius || Math.max(body.width, body.height) / 2;
                const centerX = body.x + radius;
                const centerY = body.y + radius;
                this.bulletHitboxGraphics.strokeCircle(centerX, centerY, radius);
            } else {
                this.bulletHitboxGraphics.strokeRect(body.x, body.y, body.width, body.height);
            }
        }));
    }

    setupBulletWallColliders() {
        if (!this.bullets) {
            return;
        }

        this.wallTiles.forEach((wall) => {
            this.physics.add.collider(wall, this.bullets, this.handleBulletWallCollision, undefined, this);

            if (this.enemyBullets) {
                this.physics.add.collider(wall, this.enemyBullets, this.handleBulletWallCollision, undefined, this);
            }
        });
    }

    spawnEnemiesOnRandomFloorTiles(count = 10) {
        if (!this.enemies) {
            return;
        }

        const availableTiles = Array.from(this.floorTiles)
            .map((tileKey) => {
                const [x, y] = tileKey.split(',').map(Number);
                return { x, y, tileKey };
            })
            .filter(({ x, y, tileKey }) => {
                if (this.wallTiles.has(tileKey)) {
                    return false;
                }

                if (!this.player) {
                    return true;
                }

                return Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y) > this.gridSize;
            });

        Phaser.Utils.Array.Shuffle(availableTiles)
            .slice(0, count)
            .forEach(({ x, y }) => {
                const enemy = new Enemy(this, x, y);
                enemy.setScale(0.4);
                enemy.lastShotAt = this.time.now;
                this.enemies.add(enemy);

                this.wallTiles.forEach((wall) => {
                    this.physics.add.collider(enemy, wall);
                });
            });
    }

    clearEnemyHitboxes() {
        if (!this.enemies) {
            return;
        }

        this.enemies.getChildren().forEach((enemy) => {
            if (enemy.hitboxGraphics) {
                enemy.hitboxGraphics.clear();
            }
        });
    }

    handleBulletWallCollision(wall, bullet) {
        if (bullet && typeof bullet.deactivate === 'function') {
            bullet.deactivate();
        }
    }

    handleBulletEnemyCollision(enemy, bullet) {
        if (bullet && typeof bullet.deactivate === 'function') {
            bullet.deactivate();
        }

        if (!enemy) {
            return;
        }

        enemy.health = (enemy.health || 1) - 1;

        if (enemy.health <= 0) {
            if (enemy.weapon) {
                enemy.weapon.setVisible(false);
            }
            enemy.disableBody(true, true);
        }
    }

    handleEnemyBulletPlayerCollision(player, bullet) {
        if (bullet && typeof bullet.deactivate === 'function') {
            bullet.deactivate();
        }
    }

    updateEnemyShooting(enemy, time) {
        if (!this.player || !this.enemyBullets) {
            return;
        }

        const distanceToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (distanceToPlayer > this.enemyShootRange) {
            return;
        }

        if (time - (enemy.lastShotAt || 0) < this.enemyShotCooldown) {
            return;
        }

        const bullet = this.enemyBullets.get();
        if (!bullet) {
            return;
        }

        bullet.fire(enemy.x, enemy.y, this.player.x, this.player.y);
        enemy.lastShotAt = time;
    }

    

    update(time)
    {
        const pointer = this.input.activePointer;
        this.crosshair.x = pointer.x;
        this.crosshair.y = pointer.y;

        if (this.isGameOver || this.gamePaused) return;

        const totalTilesCovered = this.snake.length + this.snake2.length;
        if (totalTilesCovered >= 300) {
            this.snakesMoving = false;
            if (!this.enemiesSpawned) {
                this.enemiesSpawned = true;
                this.spawnEnemiesOnRandomFloorTiles(10);
            }
        }

        if (this.snakesMoving && time >= this.lastMoveTime + this.snakeSpeed) {
            this.moveSnake();
            this.moveSnake2();
            this.lastMoveTime = time;
        }

        const cam = this.cameras.main;

        const offsetX = Phaser.Math.Clamp((this.scale.width / 2 - pointer.x) * 0.2, -120, 120);
        const offsetY = Phaser.Math.Clamp((this.scale.height / 2 - pointer.y) * 0.2, -80, 80);

        cam.followOffset.set(offsetX, offsetY);

        this.player.update(this.keys, this.hitboxesVisible);
        this.enemies.getChildren().forEach((enemy) => {
            if (enemy.active) {
                enemy.update();
                this.updateEnemyShooting(enemy, time);
            }
        });
        if (this.hitboxesVisible) {
            this.drawWallHitboxes();
            this.drawBulletHitboxes();
            this.enemies.getChildren().forEach((enemy) => enemy.drawHitbox());
        } else {
            this.wallHitboxGraphics.clear();
            this.bulletHitboxGraphics.clear();
            this.clearEnemyHitboxes();
        }

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
        
        this.direction = this.nextDirection;

        
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
        const newHead = this.addFloorTile(newX, newY);
        
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

        const newHead = this.addFloorTile(newX, newY);
        this.snake2.unshift(newHead);
    }
}
