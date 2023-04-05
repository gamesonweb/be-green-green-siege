import * as BABYLON from 'babylonjs';
import Logger from '../debug/Logger';
import { Game } from '../game';

export default class Inputs {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _canvas: HTMLCanvasElement;

    constructor(game: Game, scene: BABYLON.Scene, camera: BABYLON.FreeCamera, canvas: HTMLCanvasElement) {
        this._scene = scene;
        this._camera = camera;
        this._canvas = canvas;
    }

    public leftTrigger(pressed: boolean): void {
        Logger.log('Left Trigger');
    }

    public rightTrigger(pressed: boolean): void {
        Logger.log('Right Trigger');
    }

    public leftPrimary(pressed: boolean): void {
        Logger.log('Left Primary');
    }

    public rightPrimary(pressed: boolean): void {
        Logger.log('Right Primary');
    }

    public leftSecondary(pressed: boolean): void {
        if (pressed) {
            Game.debug.toggleDebug();
        }
    }

    public rightSecondary(pressed: boolean): void {
        Logger.log('Right Secondary');
    }
}
