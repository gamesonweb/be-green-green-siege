import * as GUI from 'babylonjs-gui';

export class Pointeur {
    private gui: GUI.AdvancedDynamicTexture;

    private _width = 2;
    private _color = 'white';
    private _length = 10;

    constructor() {
        this.gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

        const canvasWidth = this.gui.getSize().width;
        const canvasHeight = this.gui.getSize().height;

        // Vertical line
        const verticalLine = new GUI.Line();
        verticalLine.lineWidth = this._width;
        verticalLine.color = this._color;
        verticalLine.x1 = canvasWidth / 2;
        verticalLine.y1 = canvasHeight / 2 - this._length;
        verticalLine.x2 = canvasWidth / 2;
        verticalLine.y2 = canvasHeight / 2 + this._length;

        // Horizontal line
        const horizontalLine = new GUI.Line();
        horizontalLine.lineWidth = this._width;
        horizontalLine.color = this._color;
        horizontalLine.x1 = canvasWidth / 2 - this._length;
        horizontalLine.y1 = canvasHeight / 2;
        horizontalLine.x2 = canvasWidth / 2 + this._length;
        horizontalLine.y2 = canvasHeight / 2;

        // Add lines as controls to the advanced texture
        this.gui.addControl(verticalLine);
        this.gui.addControl(horizontalLine);

        window.addEventListener('resize', function () {
            updateGUI();
        });
    }

    public dispose(): void {
        this.gui.dispose();
    }
}

function updateGUI() {
    this.gui.idealHeight = window.innerHeight;
    this.gui.idealWidth = window.innerWidth;
}
