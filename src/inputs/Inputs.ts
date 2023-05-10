import * as BABYLON from 'babylonjs';
import timeControl from '../TimeControl';
import { Game } from '../game';
import { StateManager, StatesEnum } from '../states/stateManager';

export default class Inputs {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _canvas: HTMLCanvasElement;
    private _stateManager: StateManager;

    constructor(
        game: Game,
        stateManager: StateManager,
        scene: BABYLON.Scene,
        camera: BABYLON.FreeCamera,
        canvas: HTMLCanvasElement
    ) {
        this._scene = scene;
        this._camera = camera;
        this._canvas = canvas;
        this._stateManager = stateManager;
    }

    public leftTrigger(pressed: boolean, force: number): void {
        const currentstate = this._stateManager.getCurrentState();

        currentstate.shieldDeploymentPercentage = force;
    }

    private _rightTriggerMaintained: boolean = false;
    private _rightTriggerFireInterval: NodeJS.Timer;
    private _rightTriggerCurrentForce: number = 0;

    public rightTrigger(pressed: boolean, force: number): void {
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
        
        //////////////////////////////////////////
        // Time control power, disabled for now //
        //////////////////////////////////////////

        // const newTimeScale = 1.1 - force;
        // if (newTimeScale < 1) {
        //     timeControl.activeSlowPower(newTimeScale);
        // } else {
        //     timeControl.disableSlowPower();
        // }
    }

    public rightSqueeze(pressed: boolean, force: number): void {}

    public leftPrimary(pressed: boolean): void {
        let currentstate = this._stateManager.getCurrentState();
        if (currentstate.type !== StatesEnum.LEVEL) return;

        if (pressed) {
            if (timeControl.isPaused()) {
                timeControl.resume();
                currentstate.resume();
            } else {
                timeControl.pause();
                currentstate.pause();
            }
        }
    }

    public rightPrimary(pressed: boolean): void {}

    public leftSecondary(pressed: boolean): void {
        if (pressed) {
            Game.debug.toggleDebug();
            Game.debug3D.toggleDebug();
        }
    }

    public rightSecondary(pressed: boolean): void {}
}
