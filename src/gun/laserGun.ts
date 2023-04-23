import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { Projectile } from '../projectile/projectile';
import { Gun } from './gun';
import { Pointeur } from './pointeur';
import { animations } from '../AnimationController';

export class LaserGun implements Gun {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _gunModel: BABYLON.Mesh;
    private _laserPoint: BABYLON.Mesh;
    private _gunBack: BABYLON.Mesh;

    private _laser: Projectile;
    private _pointeur: Pointeur;

    private _coolDown: number;

    private _timeSinceLastShot: number;

    public constructor(scene: BABYLON.Scene, laser: Projectile, coolDown: number = 0.1) {
        this._scene = scene;
        this._camera = this._scene.activeCamera;
        this._timeSinceLastShot = 0;
        this._coolDown = coolDown;

        this.initGunModel();

        this._laser = laser;
        this.attach();
    }

    private initGunModel(): void {
        this._gunModel = this._scene.getMeshByName('Gun') as BABYLON.Mesh;
        this._laserPoint = this._scene.getMeshByName('GunLaser') as BABYLON.Mesh;     
        this._gunBack = this._scene.getMeshByName('GunBack') as BABYLON.Mesh;
    }

    /**
     * Attaches the gun model to either the VR hand or the camera, depending on whether VR is supported.
     */
    private attach(): void {
        const rightAnchor = this._scene.getMeshByName('rightAnchor');

        if (Game.vrSupported) {
            // If VR is supported, attach the gun model to the VR hand
            this.attachToVRHand(rightAnchor);
        } else {
            // If VR is not supported, attach the gun model to the camera
            this.attachToCamera(rightAnchor);
        }
    }

    private attachToVRHand(rightAnchor: BABYLON.AbstractMesh): void {
        this._gunModel.setParent(rightAnchor);
        this._gunModel.position = new BABYLON.Vector3(0, 0, 0);
    }

    private attachToCamera(rightAnchor: BABYLON.AbstractMesh): void {
        rightAnchor.setParent(this._camera);
        rightAnchor.position = new BABYLON.Vector3(0.3, -0.3, 0.7);
        rightAnchor.rotation = new BABYLON.Vector3(0, 0, 0);
        rightAnchor.isVisible = false;

        this._pointeur = new Pointeur();

        this._gunModel.setParent(rightAnchor);
        this._gunModel.position = rightAnchor.position;
    }


    public fire(force: number): void {
        // Calculate direction vector from back to laser
        if (this._timeSinceLastShot * force >= this._coolDown) {

            const laserDirection = this._laserPoint.absolutePosition.subtract(this._gunBack.absolutePosition);

            this._laser.fire(this._laserPoint, laserDirection);
            animations.ShotAnimation.speedRatio = 2;
            animations.ShotAnimation.reset();
            animations.ShotAnimation.start();
            this._timeSinceLastShot = 0;
            Game.hapticManager.vibrateController('right', 1, 60);
        }
    }

    public animate(deltaTime: number): void {
        this._timeSinceLastShot += deltaTime;
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
