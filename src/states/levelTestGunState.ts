import * as BABYLON from 'babylonjs';
import xrHandler from '../XRHandler';
import { Enemy } from '../enemy/Enemy';
import { Game } from '../game';
import { LaserGun } from '../gun/laserGun';
import { Laser } from '../projectile/laser';
import { Shield } from '../shield/shield';
import { State } from './state';
import { StatesEnum } from './stateManager';

export class LevelTestGunState implements State {
    private _scene: BABYLON.Scene;
    private _light: BABYLON.HemisphericLight;

    private _gun: LaserGun;
    private _shield: Shield;
    private _fakeEnemy: any;

    private _enemy1: Enemy;
    private _enemy2: Enemy;

    public shieldSize: number = 0;
    public type: StatesEnum;
    levelNumber: number;

    constructor(scene: BABYLON.Scene, type: StatesEnum) {
        this._scene = scene;
        this.type = type;
    }

    fire(force: number): void {
        this._gun.fire(force);
    }

    public getName() {
        return 'Test gun';
    }

    public load(): void {
        // Set the controller visibility to false
        if (Game.vrSupported) {
            xrHandler.setControllerVisibility(false);
        }

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 200, 0), this._scene);
        this._light.intensity = 0.3;
        this._gun = new LaserGun(this._scene, new Laser(this._scene));

        // shield
        this._shield = new Shield(this._scene);

        // fake enemy
        // this._fakeEnemy = new FakeEnemy(this._scene, new BABYLON.Vector3(30, 4, -25));
        const destination = new BABYLON.Vector3(0, 0, -35);
        const caracteristics = {
            shotFreq: 10,
            bulletFreq: 1,
            nbBullet: 3,
            bulletSpeed: 20,
            speed: 4,
            life: 3,
            score: 10,
            bias: 0.02,
        };
        this._enemy1 = new Enemy(this._scene, new BABYLON.Vector3(30, 4, -25), caracteristics);
        this._enemy2 = new Enemy(this._scene, new BABYLON.Vector3(30, 4, -35), caracteristics);

        this._enemy1.setDestination(destination);
        this._enemy2.setDestination(destination);
    }

    public dispose(): void {
        // this._light.dispose();
        this._gun.dispose();
        this._shield.dispose();
    }

    public animate(deltaTime: number): void {
        this._gun.animate(deltaTime);
        this._shield.animate(deltaTime, this.shieldSize);

        // this._fakeEnemy.animate(deltaTime);
        this._enemy1.animate(deltaTime, [this._enemy2.getPosition()]);
        this._enemy2.animate(deltaTime, [this._enemy1.getPosition()]);

        this._enemy1.setDestination(this._scene.activeCamera.position);
        this._enemy2.setDestination(this._scene.activeCamera.position);
    }

    public pause() {
        throw new Error('Method pause not implemented !');
    }

    public resume() {
        throw new Error('Method pause not implemented !');
    }
}
