import * as BABYLON from 'babylonjs';
import { Movement } from '../movement';
import { Enemy } from '../../enemy/enemy';

export class SinusoidaleMovement implements Movement {

    private frequency: number;    

    constructor(frequency: number) {
        this.frequency = frequency;
    }

    moove(enemy: Enemy, positions: BABYLON.Vector3[], destination: BABYLON.Vector3, speed: number, deltaTime: number): number {        let deplacement = BABYLON.Vector3.Zero();
        deplacement.addInPlace(destination.subtract(enemy.mesh.position).normalize().scale(speed));
        deplacement.addInPlace(new BABYLON.Vector3(0, Math.sin(this.frequency * deltaTime), 0));
        deplacement.addInPlace(enemy.checkCollision(positions));
        enemy.mesh.position.addInPlace(deplacement.scale(deltaTime));
        return BABYLON.Vector3.Distance(destination, enemy.mesh.position);
    }

}