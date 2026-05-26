import { Player } from '../gameObjects/Player.js';
import { Gun } from '../gameObjects/guns.js';
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
        this.player.currentSide = 'right';
        this.lastSide = null;

        this.gun = new Gun(this, this.player.x, this.player.y);
        this.gun.scale = 0.5;

        this.input.on('pointermove', (pointer) => {
            const currentSide = pointer.x < this.player.x ? "left" : "right";

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

        this.keys = this.input.keyboard.addKeys('W,A,S,D');
    }

    update() 
    {
        this.player.update(this.keys);
    }
}