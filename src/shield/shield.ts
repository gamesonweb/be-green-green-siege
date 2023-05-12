import * as BABYLON from 'babylonjs';
import xrHandler from '../XRHandler';
import { Game } from '../game';
import { Targetable } from '../target/targetable';
import { SoundPlayer } from '../sounds/soundPlayer';
import { SoundsBank } from '../sounds/soundsBank';

/**
 * Shield class that creates and animates a shield in the scene.
 * @extends Targetable
 */
export class Shield extends Targetable {
    private readonly _scene: BABYLON.Scene;
    private readonly _camera: BABYLON.Camera;
    private _isTouched = false;

    private readonly _noTouchAlpha = 0.4;
    private readonly _touchAlpha = 0.98;

    private _shieldMesh: BABYLON.Mesh;
    private _shieldGrip: BABYLON.Mesh;
    private _baseScale: BABYLON.Vector3;
    private _sizeMax: number = 0.8;

    private _life: number = 100;
    private readonly _maxLife: number = 100;
    private _regenerating: boolean = false;

    // sounds effect
    private _sound_activated: SoundPlayer;
    private _sound_broken: SoundPlayer;

    /**
     * Shield constructor.
     * @param {BABYLON.Scene} scene - The Babylon.js scene.
     */
    constructor(scene: BABYLON.Scene) {
        super();
        this._scene = scene;
        this._initShield();
        if (Game.vrSupported) {
            this._camera = this._scene.activeCamera;
        } else {
            this._camera = this._scene.getCameraByName('PlayerNoVRCamera');
        }
        this._attach();
        this.initSounds();
    }

    public initSounds(): void {
        this._sound_activated = new SoundPlayer(SoundsBank.SHIELD_ACTIVATION, this._scene, this._shieldMesh);
        this._sound_broken = new SoundPlayer(SoundsBank.SHIELD_BROKEN, this._scene, this._shieldMesh);
    }

    private _initShield(): void {
        this._shieldMesh = this._scene.getMeshByName('ShieldHitBox') as BABYLON.Mesh;
        this._shieldGrip = this._scene.getMeshByName('ShieldGrip') as BABYLON.Mesh;
        this._baseScale = new BABYLON.Vector3(0.028150120750069618, 0.04071023315191269, 0.3871135413646698);
        this._shieldMesh.metadata = { parentClass: this };

        // const shieldMesh = BABYLON.MeshBuilder.CreateBox('shield', { width: 0.5, height: 1, depth: 0.1 }, this._scene);
        // shieldMesh.position = new BABYLON.Vector3(2, 2, 2);
        // shieldMesh.scaling = new BABYLON.Vector3(0, 0, 0);

        const shieldMaterial = new BABYLON.StandardMaterial('shieldMaterial', this._scene);
        shieldMaterial.diffuseColor = new BABYLON.Color3(0.0471, 0.4078, 0.4706);
        shieldMaterial.alpha = this._noTouchAlpha;
        this._shieldMesh.material = shieldMaterial;

        // return shieldMesh;
    }

    /**
     * Attaches the gun model to either the VR hand or the camera, depending on whether VR is supported.
     */
    private _attach(): void {
        const leftAnchor = this._scene.getMeshByName('leftAnchor');

        if (Game.vrSupported) {
            // If VR is supported, attach the gun model to the VR hand
            this.attachToVRHand(leftAnchor);
        } else {
            // If VR is not supported, attach the gun model to the camera
            this.attachToCamera(leftAnchor);
        }
    }

    private attachToVRHand(leftAnchor: BABYLON.AbstractMesh): void {
        this._shieldGrip.setParent(leftAnchor);
        this._shieldGrip.position = new BABYLON.Vector3(0, 0, 0);
        this._shieldGrip.rotation = leftAnchor.rotation.clone();
        this._shieldGrip.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.LOCAL);

        // Rotate 20° around z axis to align the shield with the hand
        this._shieldGrip.rotate(BABYLON.Axis.Z, Math.PI / 8, BABYLON.Space.LOCAL);

        this._shieldGrip.rotate(BABYLON.Axis.X, Math.PI, BABYLON.Space.LOCAL);
    }

    private attachToCamera(leftAnchor: BABYLON.AbstractMesh): void {
        leftAnchor.setParent(this._camera);
        leftAnchor.position = new BABYLON.Vector3(-0.3, -0.3, 0.7);
        leftAnchor.rotation = new BABYLON.Vector3(0, 0, 0);

        this._shieldGrip.setParent(leftAnchor);
        this._shieldGrip.position = leftAnchor.position.clone();
        this._shieldGrip.rotation = leftAnchor.rotation.clone();
        this._shieldGrip.rotate(BABYLON.Axis.X, Math.PI, BABYLON.Space.LOCAL);
        this._shieldGrip.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.LOCAL);
    }

    public animate(deltaTime: number, shieldDeploymentPercentage: number): void {
        // console.log("shieldDeploymentPercentage= ", shieldDeploymentPercentage);
        if(shieldDeploymentPercentage != 0) {
            this._sound_activated.setVolume(this._sound_activated.getVolume() * shieldDeploymentPercentage, 0.01);
            this._sound_activated.play();
        }
        this._updateScaling(shieldDeploymentPercentage, deltaTime);
        this._updateAlpha(deltaTime);
        this.updateColor();
        if (this._regenerating) {
            this._regenerateShield(deltaTime);
        }
    }

    private _updateScaling(shieldDeploymentPercentage: number, deltaTime: number): void {
        if (this._regenerating) {
            this._shieldMesh.scaling = this._baseScale.clone();
        } else {
            const scalingLerpSpeed = 11 * deltaTime;
            const currentScaling = this._shieldMesh.scaling;
            const targetScaling = new BABYLON.Vector3(
                this._baseScale.x,
                this._baseScale.y + this._sizeMax * shieldDeploymentPercentage,
                this._baseScale.z
            );
            this._shieldMesh.scaling = BABYLON.Vector3.Lerp(currentScaling, targetScaling, scalingLerpSpeed);
        }
    }

    private _updateAlpha(deltaTime: number): void {
        const alphaLerpSpeed = 7.8 * deltaTime;

        const currentAlpha = this._shieldMesh.material.alpha;
        const targetAlpha = this._isTouched ? this._touchAlpha : this._noTouchAlpha;
        this._shieldMesh.material.alpha = BABYLON.Scalar.Lerp(currentAlpha, targetAlpha, alphaLerpSpeed);

        // Reset the touch flag if the alpha is close to the touch alpha
        if (Math.abs(currentAlpha - this._touchAlpha) < 0.1) {
            this._isTouched = false;
        }
    }

    // /**
    //  * Triggers the touch event and vibrates the left controller.
    //  */

    public touch(): void {
        if (this._life > 0) {
            this._isTouched = true;
            xrHandler.vibrateController('left', 0.2, 300);
            this._life -= 10;
            if (this._life <= 0) {
                this.breakShield();
            }
        }
    }

    private breakShield(): void {
        this._regenerating = true;
        this._shieldMesh.scaling = this._baseScale;
        // TODO SOUND: Play shield break sound
        this._sound_broken.play();
    }

    private _regenerateShield(deltaTime: number): void {
        const regenerationSpeed = 0.5 * deltaTime;
        this._life = BABYLON.Scalar.Lerp(this._life, this._maxLife + 20, regenerationSpeed);

        if (this._life >= this._maxLife) {
            this._life = this._maxLife;
            this._regenerating = false;
        }
    }

    private updateColor(): void {
        let lifePercentage = this._life / this._maxLife;
        let maxColor = new BABYLON.Color3(0.0471, 0.4078, 0.4706);
        let minColor = new BABYLON.Color3(0.4706, 0.0471, 0.0471);
        let currentColor = BABYLON.Color3.Lerp(minColor, maxColor, lifePercentage);

        (this._shieldMesh.material as BABYLON.StandardMaterial).diffuseColor = currentColor;
    }

    public getLife(): number {
        return this._life;
    }

    /**
     * Disposes of the shield mesh.
     */
    public dispose(): void {
        this._shieldGrip.parent = null;
        this._shieldGrip.position = new BABYLON.Vector3(0, 0, 0);
    }
}
