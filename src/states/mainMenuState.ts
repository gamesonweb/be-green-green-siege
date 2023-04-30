import * as BABYLON from 'babylonjs';
import { State } from './state';
import { StateManager, StatesEnum } from './stateManager';
import  MainGUI  from '../ui/mainUI';

export class MainMenuState implements State {
    private _scene: BABYLON.Scene;
    private _stateManager: StateManager;

    private _mainUI: MainGUI; 

    public type: StatesEnum;
    levelNumber: number;
    shieldSize: number;


    constructor(scene: BABYLON.Scene, stateManager: StateManager, type: StatesEnum) {
        this._scene = scene;
        this._stateManager = stateManager;
        this.type = type;
        this._mainUI = new MainGUI(this._scene, this._scene.activeCamera, this._stateManager);
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
        throw new Error("Method pause not implemented !");
    }

    public resume() {
        throw new Error("Method pause not implemented !");
    }
}
