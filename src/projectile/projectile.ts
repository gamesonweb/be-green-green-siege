import * as BABYLON from 'babylonjs';

export interface Projectile {
    laserModel: BABYLON.Mesh;
    fire(origin: BABYLON.Mesh, direction?: BABYLON.Vector3): void;
    animate(deltaTime: number): void;
    dispose(): void;
}
