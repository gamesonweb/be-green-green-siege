import * as BABYLON from 'babylonjs';
import { Game } from '../game';

export default class Inputs {

    private _game: Game;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _canvas: HTMLCanvasElement;

    constructor(game: Game, scene: BABYLON.Scene, camera: BABYLON.FreeCamera, canvas: HTMLCanvasElement) {
        this._game = game;
        this._scene = scene;
        this._camera = camera;
        this._canvas = canvas;
    }

    public leftTrigger(pressed: boolean): void {
        console.log("Left Trigger");
    }

    public rightTrigger(pressed: boolean): void {
        console.log("Right Trigger");
    }

    public leftPrimary(pressed: boolean): void {
        console.log("Left Primary");
    }

    public rightPrimary(pressed: boolean): void {
        console.log("Right Primary");
    }

    public leftSecondary(pressed: boolean): void {
        if (pressed) {
            this._game.debug.toggleDebug();
        }
    }

    public rightSecondary(pressed: boolean): void {
        console.log("Right Secondary");
    }
}