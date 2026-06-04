import { Player } from '../gameObjects/player.js';
import { Gun, Bullet } from '../gameObjects/guns.js';
document.body.style.cursor = 'none';
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {

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


        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
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

        this.shotCooldown = 180;
        this.lastShotAt = 0;

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
    }

    update() 
    {

        const cam = this.cameras.main;
        const pointer = this.input.activePointer;

        const offsetX = Phaser.Math.Clamp((this.scale.width / 2 - pointer.x) * 0.2, -120, 120);
        const offsetY = Phaser.Math.Clamp((this.scale.height / 2 - pointer.y) * 0.2, -80, 80);

        cam.followOffset.set(offsetX, offsetY);

        this.player.update(this.keys);
        
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