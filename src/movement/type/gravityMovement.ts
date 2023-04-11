import * as BABYLON from 'babylonjs';
import { Movement } from '../movement';
import { Enemy } from '../../enemy/enemy';

export class GravityMovement implements Movement {

    constructor() {}

    moove(enemy: Enemy, destination: BABYLON.Vector3, speed: number, deltaTime: number): number {
        enemy.force.copyFrom(destination).subtractInPlace(enemy.mesh.position).normalize().scaleInPlace(0.1);
        enemy.velocity.addInPlace(enemy.force.scale(speed));
        enemy.mesh.position.addInPlace(enemy.velocity);
        enemy.velocity.scaleInPlace(0.99);
        // this._force = this._force.copyFrom(destination).subtractInPlace(mesh.position).normalize().scaleInPlace(speed);
        // mesh.position.addInPlace(this._force);
        return BABYLON.Vector3.Distance(destination, enemy.mesh.position);
    }

}