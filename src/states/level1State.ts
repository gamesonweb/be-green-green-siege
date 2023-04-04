import * as BABYLON from 'babylonjs';
import { Ennemy } from '../ennemy';
import { StateManager } from './stateManager';

export class Level1State {
    private _scene: BABYLON.Scene;
    private _stateManager: StateManager;
    private _light: BABYLON.HemisphericLight;
    private _spawnPoint: BABYLON.AbstractMesh;
    private _ennemies: Ennemy[];

    constructor(scene: BABYLON.Scene, stateManager: StateManager, spawnPoint: BABYLON.AbstractMesh) {
        this._scene = scene;
        this._stateManager = stateManager;
        this._spawnPoint = spawnPoint;
        this._ennemies = [];
    }

    public getName() {
        return 'Level 1';
    }

    public load(): void {
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this._scene);
        this._light.diffuse = new BABYLON.Color3(1, 0, 0);
        // init ennemies
        this._ennemies = [];
        // create a new ennemy
        let ennemy = new Ennemy(this._scene, this._spawnPoint.position, 30, 1);
        // push it in list
        this._ennemies.push(ennemy);
        // remove it when it's finished
    }

    public dispose(): void {
        // dispose the light
        this._light.dispose();
        this._ennemies.forEach(function (ennemy) {
            ennemy.getMesh().dispose();
        });
    }
}
