export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() 
    {

    }

    update() 
    {
        let lastSide = null;

        function update() {
            const mouseX = this.input.activePointer.x;
            const screenWidth = this.scale.width;

            const currentSide = mouseX < screenWidth / 2 ? "left" : "right";

            if (currentSide !== lastSide) {
                console.log(`Mouse moved to the ${currentSide} side`);
                lastSide = currentSide;
            }
        }
    }
}