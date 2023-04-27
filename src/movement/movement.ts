import * as BABYLON from 'babylonjs';
import { Enemy } from '../enemy/enemy';
import { Boss } from '../enemy/boss';

export interface Movement {
    
    moove: (ennemy: Enemy, positions: BABYLON.Vector3[], destination: BABYLON.Vector3, speed: number, deltaTime: number) => number;

}
