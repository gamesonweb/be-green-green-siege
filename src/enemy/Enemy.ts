import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { IEnemy } from './IEnemy';
import { Targetable } from '../target/targetable';

export class Enemy extends Targetable implements IEnemy {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _mesh: BABYLON.Mesh;

    // Head Rotation
    private readonly HEAD_ROTATION_SPEED: number = 8;

    // Health
    private isDead: boolean = false;
    private readonly _INITIAL_LIFE_POINT: number = 3;
    private _lifePoint: number;

    // Movement
    private readonly _SPEED: number = 0.5;
    private speedVector: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _destination: BABYLON.Vector3;

    // Colision
    private readonly _REPUSIONFORCE: number = 1;
    private readonly _DISTANCECHECKCOLISION: number = 1;

    constructor(scene: BABYLON.Scene, spawnPosition: BABYLON.Vector3, caracteristics: any) {
        // Objet
        // shotFreq
        // bulletFreq
        // nbBullet
        // speed
        // life
        // score
        // bulletSpeed
        // bulletDmg

        super();
        this._scene = scene;

        // Camera
        if (Game.vrSupported) {
            this._camera = this._scene.activeCamera;
        } else {
            this._camera = this._scene.getCameraByName('PlayerNoVRCamera');
        }

        // Mesh
        this._mesh = Game.instanceLoader.getBot('robot', { parentClass: this });
        this._mesh.position = spawnPosition;

        // Life
        this._lifePoint = this._INITIAL_LIFE_POINT;
    }

    public fire() {}

    public getPosition(): BABYLON.Vector3 {
        return this._mesh.position;
    }

    public setDestination(destination: BABYLON.Vector3) {
        this._destination = destination;
    }

    public isDeath() : boolean {
        return this.isDead;
    }

    private rotation(deltaTime: number) {
        // Calculate the target direction
        const targetDirection = this._camera.position.subtract(this._mesh.position).normalize();

        // Calculate the horizontal rotation (left/right)
        const horizontalAngle = Math.atan2(targetDirection.z, targetDirection.x) - Math.PI / 2;
        const horizontalRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Down(), horizontalAngle);

        // Calculate the vertical rotation (up/down)
        const verticalAngle = Math.asin(targetDirection.y);
        const verticalRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Left(), verticalAngle);

        // combine horizontal and vertical rotation
        const targetRotation = horizontalRotation.multiply(verticalRotation);

        // Spherical interpolation between current and target rotation
        this._mesh.rotationQuaternion = BABYLON.Quaternion.Slerp(this._mesh.rotationQuaternion, targetRotation, this.HEAD_ROTATION_SPEED * deltaTime);
    }

    private checkHealth() {
        if (this._lifePoint <= 0) {
            this.isDead = true;
            this.die();
        }
    }

    private die() {
        this._mesh.dispose();
    }

    private move(deltaTime: number, enemiesPositions: BABYLON.Vector3[]) {
        let nextSpeed = BABYLON.Vector3.Zero();

        // add the speed vector to the current position
        nextSpeed.addInPlace(this.speedVector);

        // Calculate the target direction
        const targetDirection = this._camera.position.subtract(this._mesh.position).normalize();
        nextSpeed.addInPlace(targetDirection);

        // Avoid collision with other enemies
        for (let i = 0; i < enemiesPositions.length; i++) {
            const distance = BABYLON.Vector3.Distance(this._mesh.position, enemiesPositions[i]);

            // Define a minimum distance for the repulsion force to take effect
            const minDistance = 10;

            // Calculate the repulsion force based on distance
            if (distance < minDistance) {
                const direction = this._mesh.position.subtract(enemiesPositions[i]).normalize();
                const repulsionForce = (minDistance - distance) / minDistance; // Inverse proportionality
                const repulsionVector = direction.scale(repulsionForce);

                // Add the repulsion vector to the next speed
                nextSpeed = nextSpeed.add(repulsionVector);
            }
        }

        // Update the position
        this._mesh.position.addInPlace(nextSpeed.scale(deltaTime));
    }

    public animate(deltaTime: number, enemiesPositions: BABYLON.Vector3[]): void {
        this.rotation(deltaTime);
        this.checkHealth();
    }

    public touch(): void {
        this._lifePoint -= 1;
        console.log('Enemy touched');
        console.log('Enemy life: ' + this._lifePoint);
    }

    public getDistanceFromDestination(): number {
        return BABYLON.Vector3.Distance(this._destination, this._mesh.position);
    }

    public dispose() {
        this._mesh.dispose();
    }
}
