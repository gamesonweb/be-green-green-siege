import * as BABYLON from 'babylonjs';
import { Game } from '../game';

export interface IEnemy {
    animate(deltaTime: number, enemiesPositions: BABYLON.Vector3[]): void;
    fire(): void;
    dispose(): void;
}
