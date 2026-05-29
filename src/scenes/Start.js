document.body.style.cursor = 'none';
export class Start extends Phaser.Scene {
   
    constructor() {
        super('Start');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const playButton = this.add.image(centerX, centerY, 'play')
            .setInteractive()
            .setScale(1)
            .setDepth(1);

        playButton.on('pointerdown', () => {
            this.scene.start('Game');
        });

        this.crosshair = this.add.image(this.scale.width / 2, this.scale.height / 2, 'crosshair')
            .setDepth(1)
            .setScrollFactor(0);
        this.crosshair.scale = 0.53;
    }

    update() {
        const pointer = this.input.activePointer;
        if (this.crosshair) {
            this.crosshair.x = pointer.x;
            this.crosshair.y = pointer.y;
        }
    }
}
