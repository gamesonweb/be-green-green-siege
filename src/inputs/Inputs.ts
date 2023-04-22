import * as BABYLON from 'babylonjs';
import { TimeControl } from '../TimeControl';
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

    public leftTrigger(pressed: boolean, force: number): void {
        Logger.log('Left Trigger : ' + force);
        // Game.debug3D.log = 'Left Trigger : ' + force;

        const currentstate = this._stateManager.getCurrentState();

        currentstate.shieldSize = force;
    }

    private _rightTriggerMaintained: boolean = false;
    private _rightTriggerFireInterval: NodeJS.Timer;
    private _rightTriggerCurrentForce: number = 0;

    public rightTrigger(pressed: boolean, force: number): void {
        Logger.log('Right Trigger : ' + force);
        // Game.debug3D.log = 'Right Trigger : ' + force;

        const currentstate = this._stateManager.getCurrentState();

        if (pressed) {
            if (!this._rightTriggerMaintained) {
                this._rightTriggerMaintained = true;
                this._rightTriggerCurrentForce = force;

                this._rightTriggerFireInterval = setInterval(() => {
                    if (this._rightTriggerCurrentForce > 0.1) {
                        currentstate.fire(this._rightTriggerCurrentForce);
                    }
                }, 50); // 100 ms interval, you can adjust this value
            } else {
                this._rightTriggerCurrentForce = force;
            }
        } else {
            if (this._rightTriggerMaintained) {
                this._rightTriggerMaintained = false;
                clearInterval(this._rightTriggerFireInterval);
            }
        }
    }

    public leftSqueeze(pressed: boolean, force: number): void {
        Logger.log('Left Squeeze : ' + force);
        // Game.debug3D.log = 'Left Squeeze : ' + force;

        if (pressed) {
            TimeControl.setTimeScale(1.03 - force);
        } else {
            TimeControl.setTimeScale(1);
        }
    }

    public rightSqueeze(pressed: boolean, force: number): void {
        Logger.log('Right Squeeze' + force);
        // Game.debug3D.log = 'Right Squeeze : ' + force;
    }

    public leftPrimary(pressed: boolean): void {
        Logger.log('Left Primary');
        // Game.debug3D.log = 'Left Primary';
    }

    public rightPrimary(pressed: boolean): void {
        Logger.log('Right Primary');
        // Game.debug3D.log = 'Right Primary';
    }

    public leftSecondary(pressed: boolean): void {
        Logger.log('Left Secondary');
        // Game.debug3D.log = 'Left Secondary';
        if (pressed) {
            Game.debug.toggleDebug();
            Game.debug3D.toggleDebug();
        }
    }

    public rightSecondary(pressed: boolean): void {
        Logger.log('Right Secondary');
        // Game.debug3D.log = 'Right Secondary';
    }
}
