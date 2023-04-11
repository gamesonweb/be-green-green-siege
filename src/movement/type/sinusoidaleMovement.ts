import * as BABYLON from 'babylonjs';
import { Movement } from '../movement';
import { Enemy } from '../../enemy/enemy';

export class SinusoidaleMovement implements Movement {

    private frequency: number;    

    constructor(frequency: number) {
        this.frequency = frequency;
    }

    moove(ennemy: Enemy, destination: BABYLON.Vector3, speed: number, deltaTime: number): number {
        // this.frequency = 0.0005;
        let direction = destination.subtract(ennemy.mesh.position).normalize();
        let distance = BABYLON.Vector3.Distance(ennemy.mesh.position, destination);
        let moveDistance = Math.min(distance, speed);
        ennemy.mesh.translate(direction, moveDistance, BABYLON.Space.WORLD);
        ennemy.mesh.position = BABYLON.Vector3.Lerp(ennemy.mesh.position, destination, speed);
        // sinusoidale
        ennemy.mesh.position.y += 0.1 * Math.sin(this.frequency * deltaTime);
        return BABYLON.Vector3.Distance(destination, ennemy.mesh.position);
    }

}