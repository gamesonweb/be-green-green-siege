import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { LaserGun } from '../gun/laserGun';
import { Laser } from '../projectile/laser';
import { Shield } from '../shield/shield';
import { TestTarget } from '../target/testTarget';
import { State } from './state';

export class LevelTestGunState implements State {
    private _scene: BABYLON.Scene;
    private _light: BABYLON.HemisphericLight;

    private _gun: LaserGun;
    private _target: TestTarget;
    private _shield: Shield;
    private _fakeEnemy: any;

    constructor(scene: BABYLON.Scene) {
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

    // private createMeshInstanceWithChildren(mesh, newInstanceName) {
    //     const newInstance = mesh.createInstance(newInstanceName);

    //     mesh.getChildren().forEach((child, index) => {
    //         if (child instanceof BABYLON.AbstractMesh) {
    //             const childInstance = this.createMeshInstanceWithChildren(child, `${newInstanceName}_child_${index}`);
    //             childInstance.parent = newInstance;
    //         }
    //     });

    //     return newInstance;
    // }

    public load(): void {
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this._scene);

        this._gun = new LaserGun(this._scene, new Laser(this._scene));

        // target
        this._target = new TestTarget(this._scene, new BABYLON.Vector3(0, 4, 10));

        // shield
        this._shield = new Shield(this._scene);

        // fake enemy
        this._fakeEnemy = new fakeEnnemy(this._scene, new BABYLON.Vector3(10, 4, 0));
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

        this._fakeEnemy.animate(deltaTime);
    }
}

class fakeEnnemy {
    private _scene: BABYLON.Scene;
    private _mesh: BABYLON.Mesh;
    private _laser: Laser;

    private _timeSinceLastFire: number = 0;
    private readonly FIRE_INTERVAL: number = 1;

    constructor(Scene: BABYLON.Scene, position: BABYLON.Vector3) {
        this._scene = Scene;
        this._mesh = Game.instanceLoader.getBot('ennemy');
        this._mesh.position = position;
        this._mesh.lookAt(this._scene.activeCamera.position);

        this._laser = new Laser(this._scene, 4);
    }

    public fire(): void {
        // get right laser childre name "RightLaser" from robot mesh
        const result = Game.instanceLoader.findInstanceSubMeshByName(this._mesh, 'RightLaserPoint') as BABYLON.Mesh;

        // fire in camera direction
        this._laser.fireDirection(result, this._scene.activeCamera.position);
    }

    public animate(deltaTime: number): void {
        this._timeSinceLastFire += deltaTime;

        this._mesh.lookAt(this._scene.activeCamera.position);

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
