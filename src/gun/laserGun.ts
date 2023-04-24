import * as BABYLON from 'babylonjs';
import { animations } from '../AnimationController';
import xrHandler from '../XRHandler';
import { Game } from '../game';
import { Projectile } from '../projectile/projectile';
import { Gun } from './gun';
import { Pointeur } from './pointeur';

export class LaserGun implements Gun {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _gunModel: BABYLON.Mesh;
    private _laserPoint: BABYLON.Mesh;
    private _gunBack: BABYLON.Mesh;
    private _gunEnergy: BABYLON.Mesh;

    private _gunEnergyScale: number;

    private _laser: Projectile;
    private _pointeur: Pointeur;

    private _coolDown: number;

    private _timeSinceLastShot: number;

    private _heat: number;
    private _maxHeat: number;
    private _heatPerShot: number;
    private _coolingRate: number;
    private _overheatCooldown: number;
    private _overheated: boolean;

    public constructor(scene: BABYLON.Scene, laser: Projectile, coolDown: number = 0.1) {
        this._scene = scene;
        this._camera = this._scene.activeCamera;
        this._timeSinceLastShot = 0;
        this._coolDown = coolDown;

        this._heat = 0;
        this._maxHeat = 30; // You can adjust this value to your liking.
        this._heatPerShot = 5; // You can adjust this value to your liking.
        this._coolingRate = 20; // You can adjust this value to your liking.
        this._overheatCooldown = 0;

        this.initGunModel();

        this._laser = laser;
        this.attach();
    }

    private initGunModel(): void {
        this._gunModel = this._scene.getMeshByName('GunParent') as BABYLON.Mesh;
        this._laserPoint = this._scene.getMeshByName('GunLaser') as BABYLON.Mesh;
        this._gunBack = this._scene.getMeshByName('GunBack') as BABYLON.Mesh;
        this._gunEnergy = this._scene.getMeshByName('GunEnergy') as BABYLON.Mesh;
        this._gunEnergy.material = new BABYLON.StandardMaterial('gunEnergyMaterial', this._scene);
        this._gunEnergyScale = this._gunEnergy.scaling.x;
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
        // Set the controller visibility to false
        xrHandler.isControllerVisible(false);

        this._gunModel.setParent(rightAnchor);
        this._gunModel.position = new BABYLON.Vector3(0, 0, 0);
        this._gunModel.rotation = rightAnchor.rotation.clone();
        this._gunModel.rotate(BABYLON.Axis.X, (-2 * Math.PI) / 3, BABYLON.Space.LOCAL);
        this._gunModel.rotate(BABYLON.Axis.Z, -0.1745, BABYLON.Space.LOCAL);
    }

    private attachToCamera(rightAnchor: BABYLON.AbstractMesh): void {
        rightAnchor.setParent(this._camera);
        rightAnchor.position = new BABYLON.Vector3(0.3, -0.3, 0.7);
        rightAnchor.rotation = new BABYLON.Vector3(0, 0, 0);

        this._pointeur = new Pointeur();

        this._gunModel.setParent(rightAnchor);
        this._gunModel.position = rightAnchor.position.clone();
        this._gunModel.rotation = rightAnchor.rotation.clone();
        this._gunModel.rotate(BABYLON.Axis.X, Math.PI, BABYLON.Space.LOCAL);
    }

    private updateGunEnergyColor(): void {
        const heatPercentage = this._heat / this._maxHeat;

        const startColor = new BABYLON.Color3(0, 1, 0); // Green
        const endColor = new BABYLON.Color3(1, 0, 0); // Red

        const currentColor = BABYLON.Color3.Lerp(startColor, endColor, heatPercentage);

        if (this._gunEnergy.material instanceof BABYLON.StandardMaterial) {
            const material = this._gunEnergy.material as BABYLON.StandardMaterial;
            material.diffuseColor = currentColor;
            material.emissiveColor = currentColor;
        }
        // Update scale
        const minScale = this._gunEnergyScale; // You can adjust this value to your liking.
        const maxScale = 0.05; // You can adjust this value to your liking.
        const currentScale = BABYLON.Scalar.Lerp(minScale, maxScale, heatPercentage);
        this._gunEnergy.scaling = new BABYLON.Vector3(currentScale, currentScale, currentScale);
    }

    public fire(force: number): void {
        if (this._overheated) {
            return;
        }
        if (this._overheatCooldown > 0) {
            this._overheated = true;
            animations.playAnimation(animations.overHeatBack, false, 2);
            animations.playAnimation(animations.overHeatFront, false, 2);
            return; // Gun is overheated, don't allow firing.
        }

        // Calculate direction vector from back to laser
        if (this._timeSinceLastShot * force >= this._coolDown && !this._overheated) {
            const laserDirection = this._laserPoint.absolutePosition.subtract(this._gunBack.absolutePosition);

            this._laser.fire(this._laserPoint, laserDirection);
            animations.playAnimation(animations.BarelShot, false);

            this._timeSinceLastShot = 0;
            xrHandler.vibrateController('right', 1, 60);

            this._heat += this._heatPerShot;
            if (this._heat >= this._maxHeat) {
                this._overheatCooldown = 2; // Set a cooldown period when overheated (in seconds).
            }
            this.updateGunEnergyColor();
        }
    }

    public animate(deltaTime: number): void {
        this._timeSinceLastShot += deltaTime;

        // Reduce the heat based on the cooling rate
        this._heat -= this._coolingRate * deltaTime;
        if (this._heat < 0) {
            this._heat = 0;
            if (this._overheated) {
                this._overheated = false;
                animations.playAnimation(animations.overHeatBack, false, -2);
                animations.playAnimation(animations.overHeatFront, false, -2);
            }
        }
        this.updateGunEnergyColor();

        // Handle overheat cooldown
        if (this._overheatCooldown > 0) {
            this._overheatCooldown -= deltaTime;
            if (this._overheatCooldown < 0) {
                this._overheatCooldown = 0;
            }
        }

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
