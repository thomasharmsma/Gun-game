export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets/');
        this.load.spritesheet('bullet', 'bullet.png', { frameWidth: 132, frameHeight: 128 });
        this.load.image('play', 'play.png');
        this.load.image('wall1', 'Wall1.png');
        this.load.image('desertfloor', 'desertfloor.png');
        this.load.spritesheet('Horror-Walking-Sprites', 'Horror-Walking-Sprites.png', { frameWidth: 183, frameHeight: 175 });
        this.load.spritesheet('Horror-Idle-Sprites', 'Horror-Idle-Sprites.png', { frameWidth: 183, frameHeight: 173 });
        this.load.image('revolver', 'revolver.png');
        this.load.image('crosshair', 'crosshair.png');
        this.load.image('pause', 'Paused.png');
        this.load.image('retryButton', 'Retry.png');
        this.load.image('quitButton', 'Quit.png');
        this.load.image('continueButton', 'Continue.png');

    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.
        this.scene.start('Start');
    }
}