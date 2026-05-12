export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.lastSide = null;

        this.bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x0000ff)
            .setOrigin(0, 0);

        this.input.on('pointermove', (pointer) => {
            const screenWidth = this.scale.width;
            const currentSide = pointer.x < screenWidth / 2 ? "left" : "right";

            if (currentSide !== this.lastSide) {
                console.log(`Mouse moved to the ${currentSide} side`);
                this.lastSide = currentSide;

                if (currentSide === "left") {
                    this.bg.setFillStyle(0x0000ff);
                } else {
                    this.bg.setFillStyle(0xff0000);
                }
            }
        });
    }

    update() 
    {

    }
}