import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { Targetable } from '../target/targetable';
import { IEnemy } from './IEnemy';

export class Enemy extends Targetable implements IEnemy {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _mesh: BABYLON.Mesh;

    // Head Rotation
    private readonly HEAD_ROTATION_SPEED: number = 8;

    // Health
    private dead: boolean = false;
    private readonly _INITIAL_LIFE_POINT: number = 3;
    private _lifePoint: number;

    // Movement
    private readonly _SPEED: number = 4;
    private _speedVector: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _destination: BABYLON.Vector3;

    // Colision
    private readonly _minTargetDistanceTarget: number = 5;
    private readonly _MINDISTANCEENEMY: number = 3;

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
        return this._mesh.getAbsolutePosition();
    }

    public setDestination(destination: BABYLON.Vector3) {
        this._destination = destination;
    }

    public isDeath(): boolean {
        return this.dead;
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
            this.dead = true;
            this.die();
        }
    }

    public die() {
        this._mesh.dispose();
    }

    private move(deltaTime: number, enemiesPositions: BABYLON.Vector3[]) {
        if (!this._destination) {
            return;
        }

        const currentPosition = this.getPosition();

        ////////////////////////////////////
        // Calculate the target direction //
        ////////////////////////////////////
        const destinationVector = BABYLON.Vector3.Zero();
        const destinationDirection = this._destination.subtract(currentPosition).normalize();

        // Check if the robot is close to the destination
        const destinationDistance = BABYLON.Vector3.Distance(currentPosition, this._destination);

        // Apply a slight repulsion effect if the robot is close to the destination
        if (destinationDistance < this._minTargetDistanceTarget) {
            const repulsionForce = (this._minTargetDistanceTarget - destinationDistance) / this._minTargetDistanceTarget;
            const repulsionVector = destinationDirection.scale(-repulsionForce * 0.5);
            destinationVector.addInPlace(repulsionVector);
        } else {
            destinationVector.addInPlace(destinationDirection);
        }

        ////////////////////////////////////////
        // Avoid collision with other enemies //
        ////////////////////////////////////////
        const collisionRobotVector = BABYLON.Vector3.Zero();
        for (let i = 0; i < enemiesPositions.length; i++) {
            const distance = BABYLON.Vector3.Distance(currentPosition, enemiesPositions[i]);

            // Don't take into account the enemy itself
            if (distance === 0) {
                continue;
            }
            // Calculate the repulsion force based on distance
            else if (distance < this._MINDISTANCEENEMY) {
                const direction = currentPosition.subtract(enemiesPositions[i]).normalize();
                const repulsionForce = (this._MINDISTANCEENEMY - distance) / this._MINDISTANCEENEMY; // Inverse proportionality
                const repulsionVector = direction.scale(repulsionForce);

                // Add the repulsion vector to the next speed
                collisionRobotVector.addInPlace(repulsionVector);
            }
        }

        ////////////////////////////////
        // Avoid collision with walls //
        ////////////////////////////////
        const collisionWallVector = BABYLON.Vector3.Zero();

        Game.avoidSpheres.forEach((sphere) => {
            const distance = BABYLON.Vector3.Distance(currentPosition, sphere.position);
            const direction = currentPosition.subtract(sphere.position).normalize();

            // Calculate the repulsion force based on distance
            if (distance < sphere.radius) {
                const repulsionForce = (sphere.radius - distance) / sphere.radius; // Inverse proportionality
                const repulsionVector = direction.scale(repulsionForce * 2);

                // Add the repulsion vector to the next speed
                collisionWallVector.addInPlace(repulsionVector);
            }
        });

        // Calculate the new acceleration vector
        const newAcceleration = BABYLON.Vector3.Zero();
        newAcceleration.addInPlace(destinationVector.scale(4));
        newAcceleration.addInPlace(collisionRobotVector);
        newAcceleration.addInPlace(collisionWallVector);

        // Update the speed vector with acceleration
        this._speedVector.addInPlace(newAcceleration.scale(deltaTime));

        /////////////////////////////////////////////////////////////////
        // Adjust the speed based on the distance from the destination //
        /////////////////////////////////////////////////////////////////
        const speedMultiplier = destinationDistance / 10;
        const targetSpeed = this._SPEED * speedMultiplier;

        // Adjust the speed vector towards the target speed
        if (this._speedVector.length() < targetSpeed) {
            this._speedVector.addInPlace(newAcceleration.scale(deltaTime));
        } else {
            this._speedVector.scaleInPlace(targetSpeed / this._speedVector.length());
        }

        // Update the position
        this._mesh.position.addInPlace(this._speedVector.scale(deltaTime));
    }

    public animate(deltaTime: number, enemiesPositions: BABYLON.Vector3[]): void {
        this.rotation(deltaTime);
        this.checkHealth();
        this.move(deltaTime, enemiesPositions);
    }

    public touch(): void {
        this._lifePoint -= 1;
    }

    public getDistanceFromDestination(): number {
        return BABYLON.Vector3.Distance(this._destination, this._mesh.position);
    }

    public dispose() {
        this._mesh.dispose();
    }
}
