import * as BABYLON from 'babylonjs';
import { Movement } from '../movement';
import { Enemy } from '../../enemy/enemy';

export class GravityMovement implements Movement {

    constructor() {}

    moove(enemy: Enemy, positions: BABYLON.Vector3[], destination: BABYLON.Vector3, speed: number, deltaTime: number): number {
        let deplacement = BABYLON.Vector3.Zero();
        deplacement.addInPlace(enemy.force.copyFrom(destination).subtractInPlace(enemy.mesh.position).normalize().scaleInPlace(0.1));
        deplacement.addInPlace(enemy.velocity.addInPlace(enemy.force.scale(speed)).scaleInPlace(0.99));
        deplacement.addInPlace(enemy.checkCollision(positions))
        enemy.mesh.position.addInPlace(deplacement.scale(deltaTime));
        return BABYLON.Vector3.Distance(destination, enemy.mesh.position);
    }

}