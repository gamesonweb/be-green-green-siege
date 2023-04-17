import * as BABYLON from 'babylonjs';
import Logger from '../debug/logger';
import { Game } from '../game';
import { StateManager } from '../states/stateManager';

export default class Inputs {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _canvas: HTMLCanvasElement;
    private _stateManager: StateManager;

    constructor(game: Game, stateManager: StateManager, scene: BABYLON.Scene, camera: BABYLON.FreeCamera, canvas: HTMLCanvasElement) {
        this._scene = scene;
        this._camera = camera;
        this._canvas = canvas;
        this._stateManager = stateManager;
    }

    public leftTrigger(pressed: boolean): void {
        Logger.log('Left Trigger');
    }

    public rightTrigger(pressed: boolean): void {
        if (pressed) {
            const currentstate = this._stateManager.getCurrentState();

            if (currentstate.canFire()) {
                currentstate.fire();
            }

            Logger.log('Right Trigger');
        }
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
            Game.debug3D.toggleDebug();
        }
    }

    public rightSecondary(pressed: boolean): void {
        Logger.log('Right Secondary');
    }
}
