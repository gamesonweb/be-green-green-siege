import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { Targetable } from '../target/targetable';

/**
 * Shield class that creates and animates a shield in the scene.
 * @extends Targetable
 */
export class Shield extends Targetable {
    private readonly _scene: BABYLON.Scene;
    private readonly _shieldMesh: BABYLON.Mesh;
    private readonly _camera: BABYLON.Camera;
    private _isTouched = false;

    private readonly _noTouchAlpha = 0.75;
    private readonly _touchAlpha = 0.98;

    /**
     * Shield constructor.
     * @param {BABYLON.Scene} scene - The Babylon.js scene.
     */
    constructor(scene: BABYLON.Scene) {
        super();
        this._scene = scene;
        this._shieldMesh = this._createShieldMesh();
        this._camera = this._scene.activeCamera;
        this._attach();
    }

    private _createShieldMesh(): BABYLON.Mesh {
        const shieldMesh = BABYLON.MeshBuilder.CreateBox('shieldHitBox', { width: 0.5, height: 1, depth: 0.01 }, this._scene);
        shieldMesh.position = new BABYLON.Vector3(2, 2, 2);
        shieldMesh.metadata = { parentClass: this };
        shieldMesh.scaling = new BABYLON.Vector3(0, 0, 0);

        const shieldMaterial = new BABYLON.StandardMaterial('shieldMaterial', this._scene);
        shieldMaterial.diffuseColor = new BABYLON.Color3(0.0471, 0.4078, 0.4706);
        shieldMaterial.alpha = this._noTouchAlpha;
        shieldMesh.material = shieldMaterial;

        return shieldMesh;
    }

    private _attach(): void {
        if (Game.vrSupported) {
            const leftAnchor = this._scene.getMeshByName('leftAnchor');
            this._shieldMesh.setParent(leftAnchor);
            this._shieldMesh.position = BABYLON.Vector3.Zero();
            this._shieldMesh.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);
        } else {
            this._attachToCamera();
        }
    }

    private _attachToCamera(): void {
        const cameraDirection = this._camera.getForwardRay().direction;
        const offset = cameraDirection.scale(1.2);
        this._shieldMesh.position = this._camera.position.add(offset);
        this._shieldMesh.lookAt(this._camera.position);

        const rightOffset = this._shieldMesh.right.normalize().scale(0.75);
        const upOffset = this._shieldMesh.up.normalize().scale(-0.4);
        this._shieldMesh.position = this._shieldMesh.absolutePosition.add(rightOffset).add(upOffset);

        this._shieldMesh.setParent(this._camera);
    }

    public animate(deltaTime: number, shieldSize: number): void {
        this._updateScaling(shieldSize, deltaTime);
        this._updateAlpha(deltaTime);
    }

    private _updateScaling(shieldSize: number, deltaTime: number): void {
        const scalingLerpSpeed = 11 * deltaTime;
        const currentScaling = this._shieldMesh.scaling;
        const targetScaling = new BABYLON.Vector3(1, shieldSize, shieldSize);
        this._shieldMesh.scaling = BABYLON.Vector3.Lerp(currentScaling, targetScaling, scalingLerpSpeed);
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

    /**
     * Triggers the touch event and vibrates the left controller.
     */
    public touch(): void {
        this._isTouched = true;
        Game.hapticManager.vibrateController('left', 0.2, 300);
    }

    /**
     * Disposes of the shield mesh.
     */
    public dispose(): void {
        this._shieldMesh.dispose();
    }
}
