import * as BABYLON from 'babylonjs';
import { Targetable } from '../target/targetable';
import { Projectile } from './projectile';

export class Laser implements Projectile {
    private _scene: BABYLON.Scene;
    private _laserModel: BABYLON.Mesh;
    private _laserSpeed: number;
    private _dispowerDistance: number = 200;

    public constructor(scene: BABYLON.Scene, speed: number = 20) {
        this._scene = scene;
        this._laserSpeed = speed;
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

    private checkDistance(laser: BABYLON.InstancedMesh): void {
        const distance = BABYLON.Vector3.Distance(laser.position, this._scene.getCameraById('PlayerCamera').position);
        if (distance > this._dispowerDistance) {
            laser.dispose();
        }
    }

    public fire(origin: BABYLON.Mesh): void {
        const laserInstance = this._laserModel.createInstance('laserInstance');
        laserInstance.position = origin.getAbsolutePosition().clone();
        laserInstance.rotationQuaternion = origin.absoluteRotationQuaternion.clone();
        laserInstance.rotationQuaternion = laserInstance.rotationQuaternion.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI / 2));

        laserInstance.isVisible = true;
    }

    public fireDirection(origin: BABYLON.Mesh, direction: BABYLON.Vector3): void {
        const laserInstance = this._laserModel.createInstance('laserInstance');
        laserInstance.position = origin.getAbsolutePosition().clone();
        laserInstance.lookAt(direction);

        // Rotate the laser instance to make its forward direction become its up direction
        laserInstance.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);

        laserInstance.isVisible = true;
    }

    private getAllLaserInstances(): BABYLON.InstancedMesh[] {
        return this._laserModel.instances;
    }

    private checkCollision(laser: BABYLON.InstancedMesh): void {
        const ray = new BABYLON.Ray(laser.position, laser.up, this._laserSpeed * 0.02);
        const hit = this._scene.pickWithRay(ray);

        if (hit.pickedMesh && hit.pickedMesh.metadata && hit.pickedMesh.metadata.parentClass instanceof Targetable) {
            hit.pickedMesh.metadata.parentClass.touch();
            laser.dispose();
        }

        // dispose if hit something
        if (hit.pickedMesh && hit.pickedMesh.name !== 'laserInstance') {
            laser.dispose();
        }
    }

    public animate(deltaTime: number): void {
        this.getAllLaserInstances().forEach((laser) => {
            var distance = this._laserSpeed * deltaTime;
            laser.position.addInPlace(laser.up.scale(distance));
            this.checkDistance(laser);
            this.checkCollision(laser);
        }, this);
    }

    public dispose(): void {
        this.getAllLaserInstances().forEach((laser) => {
            laser.dispose();
        }, this);

        this._laserModel.dispose();
    }
}
