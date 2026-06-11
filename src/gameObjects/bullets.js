export class Bullet extends Phaser.Physics.Arcade.Sprite
{    
    constructor(scene, x, y)
    {        
        super(scene, x, y, 'bullet', 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        const hitboxRadius = 10;

        this.body.setCircle(hitboxRadius);
        this.body.setOffset(
            Math.round((this.width - hitboxRadius * 2) / 2),
            Math.round((this.height - hitboxRadius * 2) / 2)
        );

        this.hitboxGraphics = scene.add.graphics();
        this.hitboxGraphics.setDepth(20);
        this.hitboxGraphics.lineStyle(2, 0xff0000, 1);
        this.hitboxVisible = false;
    }
}