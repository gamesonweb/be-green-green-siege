import * as BABYLON from 'babylonjs';
import { LaserGun } from '../gun/laserGun';
import { Laser } from '../projectile/laser';
import { TestTarget } from '../target/testTarget';
import { State } from './state';
import { Shield } from '../shield/shield';

export class LevelTestGunState implements State {
    private _scene: BABYLON.Scene;
    private _light: BABYLON.HemisphericLight;

    private _gun: LaserGun;
    private _target: TestTarget;
    private _shield: Shield;

    constructor(scene: BABYLON.Scene, assetManager: BABYLON.AssetsManager) {
        this._scene = scene;
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

        this._gun = new LaserGun(this._scene, new Laser(this._scene));

        // target
        this._target = new TestTarget(this._scene, new BABYLON.Vector3(0, 4, 10));

        // shield
        this._shield = new Shield(this._scene);
    }

    public dispose(): void {
        this._light.dispose();
        this._gun.dispose();
        this._target.dispose();
        this._shield.dispose();
    }

    public animate(deltaTime: number): void {
        this._gun.animate(deltaTime);
        this._target.animate(deltaTime);
    }
}
