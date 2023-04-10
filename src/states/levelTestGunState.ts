import * as BABYLON from 'babylonjs';
import { LaserGun } from '../gun/laserGun';
import { State } from './state';

export class LevelTestGunState implements State {
    private _scene: BABYLON.Scene;
    private _light: BABYLON.HemisphericLight;
    private _assetManager: BABYLON.AssetsManager;

    private _gun: LaserGun;

    constructor(scene: BABYLON.Scene, assetManager: BABYLON.AssetsManager) {
        this._scene = scene;
        this._assetManager = assetManager;
    }

    fire(): void {
        this._gun.fire();
    }

    public getName() {
        return 'Test gun';
    }

    public canFire(): boolean {
        return true;
    }

    public load(): void {
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this._scene);

        this._gun = new LaserGun(this._scene);
    }

    public dispose(): void {
        // dispose the light
        this._light.dispose();
    }

    public animate(deltaTime: number): void {
        this._gun.animate(deltaTime);
    }
}
