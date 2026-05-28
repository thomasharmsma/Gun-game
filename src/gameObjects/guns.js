export class Gun extends Phaser.Physics.Arcade.Sprite
{    
    constructor(scene, x, y)
    {        
        super(scene, x, y, 'revolver', 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
}    