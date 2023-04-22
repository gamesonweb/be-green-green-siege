import * as BABYLON from 'babylonjs';
import { State } from './state';

export class LevelTestEmpty implements State {
    private _scene: BABYLON.Scene;

    shieldSize: number;

    constructor(scene: BABYLON.Scene) {
        this._scene = scene;
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
}
