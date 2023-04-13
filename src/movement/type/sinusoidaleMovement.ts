import * as BABYLON from 'babylonjs';
import { Movement } from '../movement';
import { Enemy } from '../../enemy/enemy';

export class SinusoidaleMovement implements Movement {

    private frequency: number;    

    constructor(frequency: number) {
        this.frequency = frequency;
    }

    moove(enemy: Enemy, positions: BABYLON.Vector3[], destination: BABYLON.Vector3, speed: number, deltaTime: number): number {
        // @todo : à modifier comme dans gravityMovement
        // this.frequency = 0.0005;
        let direction = destination.subtract(enemy.mesh.position).normalize();
        let distance = BABYLON.Vector3.Distance(enemy.mesh.position, destination);
        let moveDistance = Math.min(distance, speed);
        enemy.mesh.translate(direction, moveDistance, BABYLON.Space.WORLD);
        enemy.mesh.position = BABYLON.Vector3.Lerp(enemy.mesh.position, destination, speed);
        // sinusoidale
        enemy.mesh.position.y += 0.1 * Math.sin(this.frequency * deltaTime);
        enemy.mesh.position = enemy.checkCollision(positions);
        return BABYLON.Vector3.Distance(destination, enemy.mesh.position);
    }

}