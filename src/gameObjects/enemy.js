import { Gun, Bullet } from '../gameObjects/guns.js';
export class Enemy extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');
        this.scene = scene;
        this.setCollideWorldBounds(true);
        this.health = 3;
        this.InitAnimations();
    }
}

    InitAnimations() 
    {   this.anims.create({
            key: 'Bandit-idle',
            frames: this.anims.generateFrameNumbers('Bandit_Idle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'Bandit-right',
            frames: this.anims.generateFrameNumbers('Bandit_Walk', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
    }