import * as BABYLON from 'babylonjs';
import { EnnemiesSpace } from '../ennemies-space';

export class LevelTestGunState {
    private _scene: BABYLON.Scene;
    private _light: BABYLON.HemisphericLight;
    private _assetManager: BABYLON.AssetsManager;
    private _e_space: EnnemiesSpace;

    constructor(scene: BABYLON.Scene, assetManager: BABYLON.AssetsManager) {
        this._scene = scene;
        this._assetManager = assetManager;
    }

    public getName() {
        return 'Test gun';
    }

    public load(): void {
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this._scene);
    }

    public dispose(): void {
        // dispose the light
        this._light.dispose();
    }
}
