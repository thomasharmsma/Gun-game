export class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y)
    {
        super(scene, x, y, 'dude');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.currentSide = 'right';
        this.playerVelocity = 150;
        this.initAnimations();
    }



    initAnimations ()
    {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'lookleft',
            frames: [ { key: 'dude', frame: 0 } ],
            frameRate: 1
        });

        this.anims.create({
            key: 'lookright',
            frames: [ { key: 'dude', frame: 7 } ],
            frameRate: 1
        });
    }

    update(keys)
    {
        let isMoving = false;

        if (keys.A.isDown) {
            this.setVelocityX(-this.playerVelocity);
            isMoving = true;
        } else if (keys.D.isDown) {
            this.setVelocityX(this.playerVelocity);
            isMoving = true;
        } else {
            this.setVelocityX(0);
        }

        if (keys.W.isDown) {
            this.setVelocityY(-this.playerVelocity);
            isMoving = true;
        } else if (keys.S.isDown) {
            this.setVelocityY(this.playerVelocity);
            isMoving = true;
        } else {
            this.setVelocityY(0);
        }

        if (!isMoving) {
            this.anims.play('turn', true);
        } else {
            const side = this.currentSide || 'right';
            this.anims.play(side === 'left' ? 'left' : 'right', true);
        }
    }



    idle ()
    {

        this.anims.play('turn', true);
    }
}