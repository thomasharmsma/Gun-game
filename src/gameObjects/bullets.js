export class Bullet extends Phaser.Physics.Arcade.Sprite
{    
    constructor(scene, x, y)
    {        
        super(scene, x, y, 'bullet', 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
}