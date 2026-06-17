import { Gun, Bullet } from '../gameObjects/guns.js';
export class Enemy extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y) {
        super(scene, x, y, 'Bandit', 0);
        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.health = 3;
        this.InitAnimations();
        const hitboxRadius = 22;
    }


    InitAnimations() 
    {   this.anims.create({
            key: 'BanditIdle',
            frames: this.anims.generateFrameNumbers('BanditIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'BanditWalk',
            frames: this.anims.generateFrameNumbers('BanditWalk', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
    }
}