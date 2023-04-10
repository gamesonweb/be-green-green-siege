import * as BABYLON from 'babylonjs';
import Logger from '../debug/Logger';
import { Game } from '../game';

export class LaserGun {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _gunModel: BABYLON.Mesh;
    private _laserModel: BABYLON.Mesh;
    private _laserSpeed: number = 0.4;

    public constructor(scene: BABYLON.Scene) {
        this._scene = scene;
        this._camera = this._scene.activeCamera;

        this._gunModel = this.initGunModel();
        this._laserModel = this.initLaserModel();
        this.attatch();
    }

    private initGunModel(): BABYLON.Mesh {
        const model = BABYLON.MeshBuilder.CreateBox('refGun', { size: 0.2 }, this._scene);

        const material = new BABYLON.StandardMaterial('red', this._scene);
        material.diffuseColor = new BABYLON.Color3(0, 0, 1);
        model.material = material;

        return model;
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
        model.rotation.x = Math.PI / 2;
        model.isVisible = false;

        return model;
    }

    private attatch(): void {
        if (Game.vrSupported) {
            // If the VR is supported, the gun model is attached to the hand.
        } else {
            this._gunModel.position = new BABYLON.Vector3(1, 1, 1.5);
            this._gunModel.setParent(this._camera);
        }

        this._laserModel.setParent(this._gunModel);
        this._laserModel.position = new BABYLON.Vector3(0, 0, 0.1);
    }

    public fire(): void {
        Logger.log('Fire!');

        const laserInstance = this._laserModel.createInstance('laserInstance');
        laserInstance.position = this._laserModel.getAbsolutePosition().clone();
        laserInstance.rotationQuaternion = this._laserModel.absoluteRotationQuaternion.clone();
        laserInstance.isVisible = true;
    }

    public animate(deltaTime: number): void {
        Logger.log('Animate!');
        this._laserModel.instances.forEach((laser) => {
            laser.position.addInPlace(laser.up.scale(this._laserSpeed));
        }, this);
    }
}
