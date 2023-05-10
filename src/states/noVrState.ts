import * as BABYLON from 'babylonjs';
import noVRGUI from '../ui/noVrUI';
import { State } from './state';
import { StateManager, StatesEnum } from './stateManager';

export class NoVrState implements State {
    private _scene: BABYLON.Scene;
    private _stateManager: StateManager;

    private _mainUI: noVRGUI;

    public type: StatesEnum;
    levelNumber: number;
    shieldDeploymentPercentage: number;

    constructor(scene: BABYLON.Scene, stateManager: StateManager, type: StatesEnum) {
        this._scene = scene;
        this._stateManager = stateManager;
        this.type = type;
        this._mainUI = new noVRGUI(this._scene, this._scene.activeCamera, this._stateManager);
    }

    fire(force: number): void {}

    public getName() {
        return 'Main Menu';
    }

    public load(): void {
        this._mainUI.load();
    }

    public dispose(): void {
        this._mainUI.dispose();
    }

    public animate(deltaTime: number): void {}

    public pause() {
        throw new Error('Method pause not implemented !');
    }

    public resume() {
        throw new Error('Method pause not implemented !');
    }
}
