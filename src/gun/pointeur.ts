import * as GUI from 'babylonjs-gui';

export class Pointeur {
    private _gui: GUI.AdvancedDynamicTexture;

    private _width = 2;
    private _color = 'white';
    private _length = 10;

    private _verticalLine: GUI.Line;
    private _horizontalLine: GUI.Line;

    constructor() {
        this._gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

        this.drawCross();

        window.addEventListener('resize', () => {
            // Clear the GUI
            this._verticalLine.dispose();
            this._horizontalLine.dispose();

            this.drawCross();
        });
    }

    private drawCross() {
        const canvasWidth = this._gui.getSize().width;
        const canvasHeight = this._gui.getSize().height;

        // Vertical line
        this._verticalLine = new GUI.Line();
        this._verticalLine.lineWidth = this._width;
        this._verticalLine.color = this._color;
        this._verticalLine.x1 = canvasWidth / 2;
        this._verticalLine.y1 = canvasHeight / 2 - this._length;
        this._verticalLine.x2 = canvasWidth / 2;
        this._verticalLine.y2 = canvasHeight / 2 + this._length;

        // Horizontal line
        this._horizontalLine = new GUI.Line();
        this._horizontalLine.lineWidth = this._width;
        this._horizontalLine.color = this._color;
        this._horizontalLine.x1 = canvasWidth / 2 - this._length;
        this._horizontalLine.y1 = canvasHeight / 2;
        this._horizontalLine.x2 = canvasWidth / 2 + this._length;
        this._horizontalLine.y2 = canvasHeight / 2;

        // Add lines as controls to the advanced texture
        this._gui.addControl(this._verticalLine);
        this._gui.addControl(this._horizontalLine);
    }

    public dispose(): void {
        this._gui.dispose();
    }
}
