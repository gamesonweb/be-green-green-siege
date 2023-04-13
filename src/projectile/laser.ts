import * as BABYLON from 'babylonjs';
import { Projectile } from './projectile';

export class Laser implements Projectile {
    private _scene: BABYLON.Scene;
    private _laserModel: BABYLON.Mesh;
    private _laserSpeed: number = 0.4;

    public constructor(scene: BABYLON.Scene) {
        this._scene = scene;
        this._laserModel = this.initLaserModel();
    }

    private initLaserModel(): BABYLON.Mesh {
        const model = BABYLON.MeshBuilder.CreateCylinder(
            'cylinder',
            {
                height: 0.2,
                diameter: 0.2,
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

    public fire(origin: BABYLON.Mesh): void {
        const laserInstance = this._laserModel.createInstance('laserInstance');
        laserInstance.position = origin.getAbsolutePosition().clone();
        laserInstance.rotationQuaternion = origin.absoluteRotationQuaternion.clone();
        laserInstance.rotationQuaternion = laserInstance.rotationQuaternion.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI / 2));

        laserInstance.isVisible = true;
    }

    public animate(deltaTime: number): void {
        this._laserModel.instances.forEach((laser) => {
            laser.position.addInPlace(laser.up.scale(this._laserSpeed));
        }, this);
    }

    public dispose(): void {
        this._laserModel.instances.forEach((laser) => {
            laser.dispose();
        }, this);

        this._laserModel.dispose();
    }
}
