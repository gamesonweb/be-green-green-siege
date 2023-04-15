import * as BABYLON from 'babylonjs';
import { Commando } from '../enemy/commando';
import { EnemiesSpace } from '../enemy/enemies-space';
import { Enemy } from '../enemy/enemy';
import { LaserGun } from '../gun/laserGun';
import { GravityMovement } from '../movement/type/gravityMovement';
import { Laser } from '../projectile/laser';
import { State } from './state';

export class LevelTestBotState implements State {
    private _scene: BABYLON.Scene;
    private _light: BABYLON.HemisphericLight;
    private _assetManager: BABYLON.AssetsManager;
    private _e_space: EnemiesSpace;
    private _ennemies: Enemy[];
    private _gun: LaserGun;

    constructor(scene: BABYLON.Scene, assetManager: BABYLON.AssetsManager) {
        this._scene = scene;
        this._assetManager = assetManager;
    }

    fire(): void {
        this._gun.fire();
    }

    /**
     * Creates the debug element
     * @param scene The BABYLONJS Scene
     */
    createDebugElement(scene: BABYLON.Scene): void {
        let axes = new BABYLON.AxesViewer(scene, 2);
    }

    public getName() {
        return 'Test bot';
    }

    public canFire(): boolean {
        return true;
    }

    public load(): void {
        this._gun = new LaserGun(this._scene, new Laser(this._scene));

        this.createDebugElement(this._scene);
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this._scene);
        // this._light.diffuse = new BABYLON.Color3(1, 0, 0);
        // set enemies area
        this._e_space = new EnemiesSpace(new BABYLON.Vector3(-100, 30, 25), new BABYLON.Vector3(-200, 60, 75), this._scene);
        // this._e_space.logDim();
        // create a new ennemy
        // let ennemySinusoidale = new Ennemy(this._scene, this._assetManager, this._e_space, new BABYLON.Vector3(20, 10, 5), new SinusoidaleMovement(0.0005), 0.01);
        // this._e_space.addEnnemy(ennemySinusoidale);
        // let ennemyGravity = new Enemy(this._scene, this._assetManager, this._e_space, new BABYLON.Vector3(20, 10, 5), new GravityMovement(), 0.5, this._e_space.getRandomPoint());
        let commando = new Commando(4, this._scene, this._assetManager, this._e_space, new BABYLON.Vector3(20, 10, 5), new GravityMovement(), 5, this._e_space.getRandomPoint());
        this._e_space.addCommando(commando);
        // this._e_space.addEnnemy(ennemyGravity);
        // remove it when it's finished
    }

    public dispose(): void {
        // dispose the light
        this._light.dispose();
        // this._ennemies.forEach(function(ennemy) {
        //     ennemy.getMesh().dispose();
        // });
    }

    // This function is called at each image rendering
    // You must use this function to animate all the things in this level
    public animate(deltaTime: number): void {
        this._e_space.animate(deltaTime);
        this._gun.animate(deltaTime);
    }
}
