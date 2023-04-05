import * as BABYLON from 'babylonjs';
import { Ennemy } from '../ennemy';
import { EnnemiesSpace } from '../ennemies-space';

export class Level1State {
    
    private _scene: BABYLON.Scene;
    private _light: BABYLON.HemisphericLight;
    private _assetManager: BABYLON.AssetsManager;
    private _e_space: EnnemiesSpace;

    constructor(scene: BABYLON.Scene, assetManager: BABYLON.AssetsManager) {
        this._scene = scene;
        this._assetManager = assetManager;
    }

    public getName() {
        return 'Level 1';
    }

    public load(): void {
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight(
            'light',
            new BABYLON.Vector3(0, 1, 0),
            this._scene
        );
        // this._light.diffuse = new BABYLON.Color3(1, 0, 0);
        // set enemies area
        this._e_space = new EnnemiesSpace(
            new BABYLON.Vector3(-20, 30, 25),
            new BABYLON.Vector3(-200, 100, 50),
            1,
            this._scene
        );
        // create a new ennemy
        let ennemy = new Ennemy(this._scene, this._assetManager, this._e_space, 1, new BABYLON.Vector3(20,10,5));
        // push it in list
        this._e_space.addEnnemy(ennemy);
        // remove it when it's finished
        this._e_space.launch();
    }

    public dispose(): void {
        // dispose the light
        this._light.dispose();
        // this._ennemies.forEach(function(ennemy) {
        //     ennemy.getMesh().dispose();
        // });
    }
}
