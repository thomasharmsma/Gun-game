export class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y)
    {
        super(scene, x, y, 'Horror-Idle-Sprites', 0);

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
            frames: this.anims.generateFrameNumbers('Horror-Walking-Sprites', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'Horror-Walking-Sprites', frame: 4 } ],
            frameRate: 1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('Horror-Walking-Sprites', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'lookleft',
            frames: [ { key: 'Horror-Idle-Sprites', frame: 0 } ],
            frameRate: 1
        });

        this.anims.create({
            key: 'lookright',
            frames: [ { key: 'Horror-Idle-Sprites', frame: 4 } ],
            frameRate: 1
        });

        this.anims.create({
            key: 'idle',
            frames: [
                { key: 'Horror-Idle-Sprites', frame: 0 },
                { key: 'Horror-Idle-Sprites', frame: 1 },
                { key: 'Horror-Idle-Sprites', frame: 2 },
                { key: 'Horror-Idle-Sprites', frame: 3 },
                { key: 'Horror-Idle-Sprites', frame: 4 }
            ],
            frameRate: 10,
            repeat: -1
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
            this.anims.play('idle', true);
        } else {
            const side = this.currentSide || 'right';
            this.anims.play(side === 'left' ? 'left' : 'right', true);
        }

        this.flipX = (this.currentSide === 'left');
    }



    idle ()
    {
        this.anims.play('idle', true);
    }
}