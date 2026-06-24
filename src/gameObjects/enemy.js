export class Enemy extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y) {
        super(scene, x, y, 'BanditIdle', 0);
        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(128, 128);
        this.body.setOffset(64, 64);
        this.body.setAllowGravity(false);
        this.health = 3;
        this.gridSize = scene.gridSize || 64;
        this.moveSpeed = 200;

        this.hitboxGraphics = scene.add.graphics();
        this.hitboxGraphics.setDepth(20);
        this.hitboxGraphics.lineStyle(2, 0xff00ff, 1);
        this.hitboxVisible = false;
        this.moveDuration = 500;
        this.pauseMin = 1000;
        this.pauseMax = 5000;
        this.moveTimer = 7000;
        this.pauseTimer = 0;
        this.isPaused = false;
        this.direction = 'left';
        this.targetX = x;
        this.targetY = y;
        this.isMovingToTarget = false;
        this.weapon = scene.add.image(x, y, 'bigger weapon');
        this.weapon.setScale(0.1);
        this.weapon.setDepth(3);

        this.InitAnimations();
        this.play('BanditIdle', true);
        this.updateWeaponSprite();
        this.startPause();
    }

    InitAnimations() 
    {
        if (this.scene.anims.exists('BanditIdle')) {
            return;
        }

        this.anims.create({
            key: 'BanditIdle',
            frames: this.anims.generateFrameNumbers('BanditIdle', { start: 0, end: 3 }),
            frameRate: 7,
            repeat: -1
        });

        this.anims.create({
            key: 'BanditWalk',
            frames: this.anims.generateFrameNumbers('BanditWalk', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'BanditHurt',
            frames: this.anims.generateFrameNumbers('BanditHurt', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'BanditDeath',
            frames: this.anims.generateFrameNumbers('BanditDeath', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });
    }

    update() {
        const now = this.scene.time.now;

        if (this.isPaused) {
            if (now >= this.pauseTimer) {
                this.isPaused = false;
                this.startMoving();
            } else {
                this.setVelocity(0, 0);
                if (this.anims.currentAnim?.key !== 'BanditIdle') {
                    this.play('BanditIdle', true);
                }
                this.updateWeaponSprite();
                return;
            }
        }

        if (this.isMovingToTarget) {
            const reachedX = Math.abs(this.x - this.targetX) < 2;
            const reachedY = Math.abs(this.y - this.targetY) < 2;

            if (reachedX && reachedY) {
                this.setPosition(this.targetX, this.targetY);
                this.setVelocity(0, 0);
                this.isMovingToTarget = false;
                this.play('BanditIdle', true);
                this.startPause();
                this.updateWeaponSprite();
                return;
            }

            this.scene.physics.moveTo(this, this.targetX, this.targetY, this.moveSpeed);
            this.flipX = this.x < this.targetX;
            if (this.anims.currentAnim?.key !== 'BanditWalk') {
                this.play('BanditWalk', true);
            }
            this.updateWeaponSprite();
            return;
        }

        if (now >= this.moveTimer) {
            this.startPause();
            return;
        }

        if (this.anims.currentAnim?.key !== 'BanditWalk') {
            this.play('BanditWalk', true);
        }

        this.updateWeaponSprite();
    }

    updateWeaponSprite() {
        if (!this.weapon) {
            return;
        }

        if (!this.active || !this.visible) {
            this.weapon.setVisible(false);
            return;
        }

        const facingLeft = this.flipX;
        const offsetX = facingLeft ? -28 : 28;
        const offsetY = 18;

        this.weapon.setVisible(true);
        this.weapon.setPosition(this.x + offsetX, this.y + offsetY);
        this.weapon.setFlipX(facingLeft);
        this.weapon.setDepth(this.depth + 1);
    }

    drawHitbox() {
        const body = this.body;
        if (!body) {
            return;
        }

        this.hitboxGraphics.clear();
        this.hitboxGraphics.lineStyle(2, 0xff00ff, 1);
        this.hitboxGraphics.strokeRect(body.x, body.y, body.width, body.height);
    }

    startMoving() {
        this.moveTimer = this.scene.time.now + this.moveDuration;
        this.direction = this.pickValidDirection();

        if (!this.direction) {
            this.startPause();
            return;
        }

        const nextPos = this.getNextTilePosition(this.direction);
        if (!nextPos) {
            this.startPause();
            return;
        }

        this.targetX = nextPos.x;
        this.targetY = nextPos.y;
        this.isMovingToTarget = true;
        this.flipX = this.direction === 'left';
        this.play('BanditWalk', true);
    }

    pickValidDirection() {
        const directions = ['left', 'right', 'up', 'down'];
        const validDirections = directions.filter(direction => this.isWalkableDirection(direction));

        if (validDirections.length === 0) {
            return null;
        }

        return Phaser.Math.RND.pick(validDirections);
    }

    isWalkableDirection(direction) {
        const nextPos = this.getNextTilePosition(direction);
        if (!nextPos) {
            return false;
        }

        const tileKey = this.scene.getTileKey
            ? this.scene.getTileKey(nextPos.x, nextPos.y)
            : `${nextPos.x},${nextPos.y}`;

        return this.scene.floorTiles?.has(tileKey) && !this.scene.wallTiles?.has(tileKey);
    }

    getNextTilePosition(direction) {
        const snappedX = Math.round(this.x / this.gridSize) * this.gridSize;
        const snappedY = Math.round(this.y / this.gridSize) * this.gridSize;

        switch (direction) {
            case 'left':
                return { x: snappedX - this.gridSize, y: snappedY };
            case 'right':
                return { x: snappedX + this.gridSize, y: snappedY };
            case 'up':
                return { x: snappedX, y: snappedY - this.gridSize };
            case 'down':
                return { x: snappedX, y: snappedY + this.gridSize };
            default:
                return null;
        }
    }

    startPause() {
        this.setVelocity(0, 0);
        this.isPaused = true;
        this.pauseTimer = this.scene.time.now + Phaser.Math.Between(this.pauseMin, this.pauseMax);
        this.play('BanditIdle', true);
        this.updateWeaponSprite();
    }
}
