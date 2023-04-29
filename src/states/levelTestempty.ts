import * as BABYLON from 'babylonjs';
import { State } from './state';
import { StatesEnum } from './stateManager';

export class LevelTestEmpty implements State {
    private _scene: BABYLON.Scene;

    shieldSize: number;
    type: StatesEnum;

    constructor(scene: BABYLON.Scene, type: StatesEnum) {
        this._scene = scene;
        this.type = type;
    }

    fire(force: number): void {}

    public getName() {
        return 'Test bot';
    }

    public load(): void {}

    public dispose(): void {}

    // This function is called at each image rendering
    // You must use this function to animate all the things in this level
    public animate(deltaTime: number): void {}
    public pause() {
        throw new Error("Method pause not implemented !");
    }

    public resume() {
        throw new Error("Method pause not implemented !");
    }
}
