import * as BABYLON from 'babylonjs';

export interface Projectile {
    laserModel: BABYLON.Mesh;
    fire(origin: BABYLON.Mesh): void;
    animate(deltaTime: number): void;
    dispose(): void;
}
