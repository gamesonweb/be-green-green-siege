import * as BABYLON from 'babylonjs';
import { AnimationName, animations } from '../AnimationController';
import score from '../Score';
import timeControl from '../TimeControl';
import xrHandler from '../XRHandler';
import { Game } from '../game';
import { Projectile } from '../projectile/projectile';
import { SoundPlayer } from '../sounds/soundPlayer';
import { SoundsBank } from '../sounds/soundsBank';
import { Gun } from './gun';
import { Pointer } from './pointer';

export class LaserGun implements Gun {
    private readonly _scene: BABYLON.Scene;
    private readonly _camera: BABYLON.Camera;

    private _gunModel: BABYLON.Mesh;
    private _gunBack: BABYLON.Mesh;
    private _gunEnergy: BABYLON.Mesh;
    private _gunEnergyScale: number;
    private _laserPoint: BABYLON.Mesh;

    private _laser: Projectile;

    private _pointer: Pointer;

    private readonly _fireRate: number;
    private _timeSinceLastShot: number;

    private _currentHeat: number;
    private _isOverheated: boolean;
    private readonly _maxHeat: number;
    public heatPerShot: number;
    private readonly _coolingRate: number;

    // sound effect
    private _shoot: SoundPlayer;
    private _reloadGun: SoundPlayer;

    /**
     * Creates an instance of LaserGun.
     * @param scene scene to add the gun to
     * @param laser projectile to fire
     */
    public constructor(scene: BABYLON.Scene, laser: Projectile) {
        this._scene = scene;
        this._camera = Game.vrSupported ? this._scene.activeCamera : this._scene.getCameraByName('PlayerNoVRCamera');

        this.initializeGunModel();
        this.attach();

        this.initSound();

        this._laser = laser;

        this._fireRate = 0.15;
        this._timeSinceLastShot = 0;

        this._currentHeat = 0;
        this._isOverheated = false;
        this._maxHeat = 30;
        this.heatPerShot = 5;
        this._coolingRate = 20;
    }

    private initSound() {
        this._shoot = new SoundPlayer(SoundsBank.GUN_SHOOT, 2, this._scene, this._gunModel);
        this._reloadGun = new SoundPlayer(SoundsBank.GUN_RELOAD, 2, this._scene, this._gunModel);
    }

    private initializeGunModel(): void {
        this._gunModel = this._scene.getMeshByName('GunParent') as BABYLON.Mesh;
        this._gunBack = this._scene.getMeshByName('GunBack') as BABYLON.Mesh;
        this._gunEnergy = this._scene.getMeshByName('GunEnergy') as BABYLON.Mesh;
        this._laserPoint = this._scene.getMeshByName('GunLaser') as BABYLON.Mesh;
        this._gunEnergy.material = new BABYLON.StandardMaterial('gunEnergyMaterial', this._scene);
        this._gunEnergyScale = this._gunEnergy.scaling.x;
    }

    private attach(): void {
        const rightAnchor = this._scene.getMeshByName('rightAnchor');
        Game.vrSupported ? this.attachToVRHand(rightAnchor) : this.attachToCamera(rightAnchor);
    }

    private dettach(): void {
        this._gunModel.parent = null;
        this._gunModel.position = new BABYLON.Vector3(0, 0, 0);
    }

    private attachToVRHand(rightAnchor: BABYLON.AbstractMesh): void {
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

        this._gunModel.setParent(rightAnchor);
        this._gunModel.position = rightAnchor.position.clone();
        this._gunModel.rotation = rightAnchor.rotation.clone();
        this._gunModel.rotate(BABYLON.Axis.X, Math.PI, BABYLON.Space.LOCAL);

        this._pointer = new Pointer();
    }

    /**
     * Update the gun
     * @param force ratio of how much the trigger is pressed
     */
    public fire(force: number): void {
        // if game is paused, don't fire
        if (timeControl.isPaused()) {
            return;
        }

        // if gun is overheated, don't fire
        if (this._isOverheated) {
            return;
        }

        // if time since last shot is less than fire rate, don't fire
        if (this._timeSinceLastShot * force < this._fireRate) {
            return;
        }

        // fire
        const laserDirection = this._laserPoint.absolutePosition.subtract(this._gunBack.absolutePosition);
        this._laser.fire(this._laserPoint.getAbsolutePosition(), laserDirection);

        // play sound
        this._shoot.play(true);

        // play animation
        animations.playAnimation(this._gunModel, AnimationName.BarrelShot);
        xrHandler.vibrateController('right', 1, 60);

        // reset time since last shot
        this._timeSinceLastShot = 0;

        // update heat
        this._currentHeat += this.heatPerShot;

        // Update score
        score.playerShoots();
    }

    public isOverheated(): boolean {
        return this._isOverheated;
    }

    private updateHeat(deltaTime: number): void {
        // check if gun is overheated
        if (this._currentHeat >= this._maxHeat && !this._isOverheated) {
            this._isOverheated = true;
            animations.playAnimation(this._gunModel, AnimationName.OverHeatFront);
            animations.playAnimation(this._gunModel, AnimationName.OverHeatBack);
            this._reloadGun.play();
        }

        // update heat
        if (this._currentHeat > 0) {
            this._currentHeat -= this._coolingRate * deltaTime;
        } else {
            this._currentHeat = 0;
            if (this._isOverheated) {
                this._isOverheated = false;
                animations.playAnimation(this._gunModel, AnimationName.OverHeatFront, true);
                animations.playAnimation(this._gunModel, AnimationName.OverHeatBack, true);
            }
        }
    }

    private updateGunEnergyBall(): void {
        // update color
        const heatPercentage = this._currentHeat / this._maxHeat;
        const coolColor = new BABYLON.Color3(0.1, 0.7, 0.1); // Green
        const hotColor = new BABYLON.Color3(0.9, 0.1, 0.1); // Red
        const currentColor = BABYLON.Color3.Lerp(coolColor, hotColor, heatPercentage);

        const material = this._gunEnergy.material as BABYLON.StandardMaterial;
        material.diffuseColor = currentColor;
        material.emissiveColor = currentColor;
        material.alpha = 0.8;

        // update scale
        const minScale = this._gunEnergyScale;
        const maxScale = 0.05;
        const currentScale = BABYLON.Scalar.Lerp(minScale, maxScale, heatPercentage);
        this._gunEnergy.scaling = new BABYLON.Vector3(currentScale, currentScale, currentScale);
    }

    /**
     * Update the gun
     * @param deltaTime time since last update
     */
    public animate(deltaTime: number): void {
        this._timeSinceLastShot += deltaTime;

        this.updateHeat(deltaTime);
        this.updateGunEnergyBall();

        this._laser.animate(deltaTime);
    }

    /**
     * Dispose the gun
     */
    public dispose(): void {
        this._laser.dispose();
        this.dettach();

        if (this._pointer) {
            this._pointer.dispose();
        }
    }
}
