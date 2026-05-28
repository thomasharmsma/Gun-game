import { Player } from '../gameObjects/Player.js';
import { Gun, Bullet } from '../gameObjects/guns.js';
document.body.style.cursor = 'none';
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
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

    update() 
    {
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
}