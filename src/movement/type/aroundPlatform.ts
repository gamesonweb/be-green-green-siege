import * as BABYLON from 'babylonjs';
import { Movement } from '../movement';
import { Enemy } from '../../enemy/enemy';

export class AroundPlatform implements Movement {

    private _angle: number;
    private _radius: number;

    constructor() {
        this._angle = 0;
        this._radius = 100;
    }

    moove(enemy: Enemy, positions: BABYLON.Vector3[], destination: BABYLON.Vector3, speed: number, deltaTime: number): number {   
        this._angle += speed * deltaTime;
        // console.log("angle: ", speed * deltaTime);
        // this._radius = BABYLON.Vector3.Distance(enemy.mesh.position, BABYLON.Vector3.Zero());   
        // console.log("")
        enemy.mesh.setAbsolutePosition(new BABYLON.Vector3(this._radius * Math.cos(this._angle), enemy.mesh.position.y, this._radius * Math.sin(this._angle)));
        return BABYLON.Vector3.Distance(destination, enemy.mesh.position);
    }

}