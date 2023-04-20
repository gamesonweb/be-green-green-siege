import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { Projectile } from '../projectile/projectile';
import { Gun } from './gun';
import { Pointeur } from './pointeur';

export class LaserGun implements Gun {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _gunModel: BABYLON.Mesh;
    private _laser: Projectile;
    private _pointeur: Pointeur;

    public constructor(scene: BABYLON.Scene, laser: Projectile) {
        this._scene = scene;
        this._camera = this._scene.activeCamera;

        this._gunModel = this.initGunModel();
        this._laser = laser;
        this.attach();
    }

    private initGunModel(): BABYLON.Mesh {
        const model = BABYLON.MeshBuilder.CreateBox('refGun', { size: 0.2 }, this._scene);

        const material = new BABYLON.StandardMaterial('red', this._scene);
        material.diffuseColor = new BABYLON.Color3(0, 0, 1);
        model.material = material;

        return model;
    }

/**
     * Attaches the gun model to either the VR hand or the camera, depending on whether VR is supported.
     */
    private attach(): void {
        if (Game.vrSupported) {
            // If VR is supported, attach the gun model to the VR hand
            let leftAnchor = this._scene.getMeshByName('leftAnchor');
            let rightAnchor = this._scene.getMeshByName('rightAnchor');

            this._gunModel.setParent(rightAnchor);
            this._gunModel.position = new BABYLON.Vector3(0, 0, 0);
            // this._gunModel.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
        } else {
            // If VR is not supported, attach the gun model to the camera
            this._pointeur = new Pointeur();

            // Calculate the direction the camera is facing
            const cameraDirection = this._camera.getForwardRay().direction;

            // Set the gun position to be in front of the camera
            let offset = cameraDirection.scale(1.2);
            this._gunModel.position = this._camera.position.add(offset);

            // Point the gun towards the camera
            this._gunModel.lookAt(this._camera.position);

            // Offset the gun to the bottom right corner of the camera view
            this._gunModel.position = this._gunModel.absolutePosition.add(this._gunModel.right.normalize().scale(-0.75));
            this._gunModel.position = this._gunModel.absolutePosition.add(this._gunModel.up.normalize().scale(-0.4));

            // Attach the gun to the camera
            this._gunModel.setParent(this._camera);
        }
    }


    public fire(): void {
        this._laser.fire(this._gunModel);
    }

    public animate(deltaTime: number): void {
        this._laser.animate(deltaTime);
    }

    public dispose(): void {
        this._gunModel.dispose();
        this._laser.dispose();

        if (this._pointeur) {
            this._pointeur.dispose();
        }
    }
}
