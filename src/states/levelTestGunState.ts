import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { LaserGun } from '../gun/laserGun';
import { Laser } from '../projectile/laser';
import { Shield } from '../shield/shield';
import { Targetable } from '../target/targetable';
import { TestTarget } from '../target/testTarget';
import { State } from './state';

export class LevelTestGunState implements State {
    private _scene: BABYLON.Scene;
    private _light: BABYLON.HemisphericLight;

    private _gun: LaserGun;
    private _target: TestTarget;
    private _shield: Shield;
    private _fakeEnemy: any;

    public shieldSize: number = 0;

    constructor(scene: BABYLON.Scene) {
        this._scene = scene;
    }

    fire(force: number): void {
        this._gun.fire(force);
    }

    public getName() {
        return 'Test gun';
    }

    public load(): void {
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 200, 0), this._scene);
        this._light.intensity = 0.3;
        this._gun = new LaserGun(this._scene, new Laser(this._scene));

        // target
        this._target = new TestTarget(this._scene, new BABYLON.Vector3(0, 4, 10));

        // shield
        this._shield = new Shield(this._scene);

        // fake enemy
        this._fakeEnemy = new fakeEnnemy(this._scene, new BABYLON.Vector3(30, 4, -25));
    }

    public dispose(): void {
        // this._light.dispose();
        this._gun.dispose();
        this._target.dispose();
        this._shield.dispose();
    }

    public animate(deltaTime: number): void {
        this._gun.animate(deltaTime);
        this._shield.animate(deltaTime, this.shieldSize);
        this._target.animate(deltaTime);

        this._fakeEnemy.animate(deltaTime);
    }
}

class fakeEnnemy extends Targetable {
    private _scene: BABYLON.Scene;
    private _mesh: BABYLON.Mesh;
    private _laser: Laser;
    private _camera: BABYLON.Camera;

    private _timeSinceLastFire: number = 0;
    private readonly FIRE_INTERVAL: number = 5;

    constructor(Scene: BABYLON.Scene, position: BABYLON.Vector3) {
        super();
        this._scene = Scene;
        const metadata = { parentClass: this };
        this._mesh = Game.instanceLoader.getBot('ennemy', metadata);
        this._mesh.position = position;

        if (Game.vrSupported) {
            this._camera = this._scene.activeCamera;
        } else {
            this._camera = this._scene.getCameraByName('PlayerNoVRCamera');
        }

        this._laser = new Laser(this._scene, 20, 40, 10);
    }

    public fire(): void {
        // get right laser childre name "RightLaser" from robot mesh
        const result = Game.instanceLoader.findInstanceSubMeshByName(this._mesh, 'RightLaserPoint') as BABYLON.Mesh;

        // fire in camera direction
        const laserDirection = this._camera.position.subtract(result.absolutePosition);
        // fire in camera direction
        this._laser.fire(result, laserDirection);
    }

    public animate(deltaTime: number): void {
        this._timeSinceLastFire += deltaTime;

        this._mesh.lookAt(this._camera.position);

        if (this._timeSinceLastFire >= this.FIRE_INTERVAL) {
            this._timeSinceLastFire = 0;
            this.fire();
        }
        this._laser.animate(deltaTime);
    }

    public dispose(): void {
        this._mesh.dispose();
    }
}
