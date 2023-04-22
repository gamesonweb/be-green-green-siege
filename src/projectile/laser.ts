import * as BABYLON from 'babylonjs';
import { Targetable } from '../target/targetable';
import { Projectile } from './projectile';

export class Laser implements Projectile {
    private _scene: BABYLON.Scene;
    private _laserModel: BABYLON.Mesh;
    private _laserSpeed: number;
    private _dispownDistance: number;
    private _collisionDistance: number;

    public constructor(scene: BABYLON.Scene, speed: number = 70, dispowerDistance: number = 80, collisionDistance: number = 40) {
        this._scene = scene;
        this._laserSpeed = speed;
        this._dispownDistance = dispowerDistance;
        this._collisionDistance = collisionDistance;
        this._laserModel = this.initLaserModel();
        this._laserModel.metadata = { parentClass: this };
    }

    private initLaserModel(): BABYLON.Mesh {
        const model = BABYLON.MeshBuilder.CreateCylinder(
            'laser',
            {
                height: 0.1,
                diameter: 0.1,
            },
            this._scene
        );

        const material = new BABYLON.StandardMaterial('red', this._scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        model.material = material;
        model.isVisible = false;

        return model;
    }

    public get laserModel(): BABYLON.Mesh {
        return this._laserModel;
    }

    public fire(origin: BABYLON.Mesh, direction?: BABYLON.Vector3): void {
        const laserInstance = this.createLaserInstance(origin, direction);
        laserInstance.isVisible = true;
    }

    private createLaserInstance(origin: BABYLON.Mesh, direction?: BABYLON.Vector3): BABYLON.InstancedMesh {
        const laserInstance = this._laserModel.createInstance('laserInstance');
        laserInstance.position = origin.getAbsolutePosition().clone();

        if (direction) {
            laserInstance.lookAt(direction);
            // Rotate the laser instance to make its forward direction become its up direction
            laserInstance.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);
        } else {
            laserInstance.rotationQuaternion = origin.absoluteRotationQuaternion.clone();
            laserInstance.rotationQuaternion = laserInstance.rotationQuaternion.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI / 2));
        }

        return laserInstance;
    }

    private getAllLaserInstances(): BABYLON.InstancedMesh[] {
        return this._laserModel.instances;
    }

    private checkCollision(laser: BABYLON.InstancedMesh, nextPosition: BABYLON.Vector3): void {
        const currentPosition = laser.absolutePosition;
        const direction = nextPosition.subtract(currentPosition).normalize();
        const rayLength = BABYLON.Vector3.Distance(currentPosition, nextPosition) + 0.1;

        const ray = new BABYLON.Ray(currentPosition, direction, rayLength);

        const predicate = (mesh) => {
            return mesh.name.indexOf('HitBox') !== -1;
        };

        const hitInfo = this._scene.pickWithRay(ray, predicate, true);

        if (hitInfo.hit) {
            const hitObject = hitInfo.pickedMesh;

            if (hitObject.metadata && hitObject.metadata.parentClass instanceof Targetable) {
                hitObject.metadata.parentClass.touch();
            }

            laser.dispose();
        }
    }

    public animate(deltaTime: number): void {
        this.getAllLaserInstances().forEach((laser) => {
            const nextPosition = laser.position.addInPlace(laser.up.scale(this._laserSpeed * deltaTime));
            const distancePlayer = BABYLON.Vector3.Distance(nextPosition, this._scene.activeCamera.position);

            // Dispose if the laser is too far away from the player
            if (distancePlayer > this._dispownDistance) {
                laser.dispose();
            }

            // Check collision if the laser is close enough to the player
            if (distancePlayer < this._collisionDistance) {
                this.checkCollision(laser, nextPosition);
            }
        }, this);
    }

    public dispose(): void {
        this.getAllLaserInstances().forEach((laser) => {
            laser.dispose();
        }, this);

        this._laserModel.dispose();
    }
}
