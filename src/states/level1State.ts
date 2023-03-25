import * as BABYLON from 'babylonjs';
import { StateManager } from './stateManager';

export class Level1State {
    private _scene: BABYLON.Scene;
    private _stateManager: StateManager;
    private _light: BABYLON.HemisphericLight;

    constructor(scene: BABYLON.Scene, stateManager: StateManager) {
        this._scene = scene;
        this._stateManager = stateManager;
    }

    public load(): void {
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight(
            'light',
            new BABYLON.Vector3(0, 1, 0),
            this._scene
        );
        this._light.diffuse = new BABYLON.Color3(1, 0, 0);
    }

    public dispose(): void {
        // dispose the light
        this._light.dispose();
    }
}
