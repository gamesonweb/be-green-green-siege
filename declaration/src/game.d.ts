export declare class Game {
    private _canvas;
    private _engine;
    private _scene;
    private _camera;
    private _light;
    constructor(canvasElement: string);
    /**
     * Creates the BABYLONJS Scene
     */
    createScene(): Promise<void>;
    /**
     * Starts the animation loop.
     */
    animate(): void;
}
