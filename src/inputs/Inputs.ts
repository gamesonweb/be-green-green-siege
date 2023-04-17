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
        Game.debug3D.log = 'Left Trigger';
    }

    public rightTrigger(pressed: boolean): void {
        Logger.log('Right Trigger');
        Game.debug3D.log = 'Right Trigger';
        if (pressed) {
            const currentstate = this._stateManager.getCurrentState();

            if (currentstate.canFire()) {
                currentstate.fire();
            }
        }
    }

    public leftPrimary(pressed: boolean): void {
        Logger.log('Left Primary');
        Game.debug3D.log = 'Left Primary';
    }

    public rightPrimary(pressed: boolean): void {
        Logger.log('Right Primary');
        Game.debug3D.log = 'Right Primary';
    }

    public leftSecondary(pressed: boolean): void {
        Logger.log('Left Secondary');
        Game.debug3D.log = 'Left Secondary';
        if (pressed) {
            Game.debug.toggleDebug();
            Game.debug3D.toggleDebug();
        }
    }

    public rightSecondary(pressed: boolean): void {
        Logger.log('Right Secondary');
        Game.debug3D.log = 'Right Secondary';
    }

    public leftSqueeze(pressed: boolean): void {
        Logger.log('Left Squeeze');
        Game.debug3D.log = 'Left Squeeze';
    }

    public rightSqueeze(pressed: boolean): void {
        Logger.log('Right Squeeze');
        Game.debug3D.log = 'Right Squeeze';
    }
}
