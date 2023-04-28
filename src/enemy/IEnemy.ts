import * as BABYLON from 'babylonjs';

export interface IEnemy {
    animate(deltaTime: number, enemiesPositions: BABYLON.Vector3[]): void;
    dispose(): void;
}
