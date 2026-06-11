export class Gun extends Phaser.Physics.Arcade.Sprite
{    
    constructor(scene, x, y)
    {        
        super(scene, x, y, 'revolver', 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
}

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet', 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        const hitboxRadius = 22;

        this.setActive(false);
        this.setVisible(false);
        this.body.setAllowGravity(false);
        this.speed = 1800;
        this.maxLifespan = 2000;
        this.firedAt = 0;

        this.body.setCircle(hitboxRadius);
        this.body.setOffset(
            Math.round((this.width - hitboxRadius * 2) / 2),
            Math.round((this.height - hitboxRadius * 2) / 2 + 10)

        
        );
    }

    fire(x, y, targetX, targetY) {
        this.body.enable = true;
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setFrame(0);
        this.setScale(0.5);

        const baseAngle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        const spreadDegrees = 4;
        const spreadRad = Phaser.Math.DegToRad(Phaser.Math.Between(-spreadDegrees, spreadDegrees));
        const angle = baseAngle + spreadRad;
        this.setRotation(angle);

        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        this.firedAt = this.scene.time.now;

        this.scene.time.delayedCall(50, () => {
            if (this.active) {
                this.setFrame(1);
            }
        });
    }


    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (!this.active) {
            return;
        }

        const bounds = this.scene.cameras.main.worldView;
        const margin = 100;

        if (time - this.firedAt > this.maxLifespan ||
            this.x < bounds.x - margin || this.x > bounds.right + margin ||
            this.y < bounds.y - margin || this.y > bounds.bottom + margin) {
            this.deactivate();
        }
    }

    deactivate() {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
        this.body.enable = false;
    }
}    