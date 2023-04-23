// import { Color4, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, VertexBuffer, int } from "babylonjs";
import * as BABYLON from 'babylonjs';
import { Enemy } from './enemy'

export class EnemiesPower {

    private _fireFreq: number;
    private _nBullets: number;
    private _speed: number;

    constructor(fireFrequence: number, numberBullets: number, speed: number) {
        this._fireFreq = fireFrequence;
        this._nBullets = numberBullets;
        this._speed = speed;
    }

    public affectPowerToEnemy(enemy: Enemy): void {
        // set speed
        enemy.setSpeed(this._speed);
        enemy.setFireFreq(this._fireFreq);
        enemy.setNBullets(this._nBullets);
    }

}
