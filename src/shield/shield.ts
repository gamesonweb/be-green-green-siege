import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { Targetable } from '../target/targetable';

export class Shield extends Targetable {
    private _scene: BABYLON.Scene;
    private _shieldMesh: BABYLON.Mesh;
    private _camera: BABYLON.Camera;

    private _istouched: boolean = false;

    constructor(scene: BABYLON.Scene) {
        super();
        this._scene = scene;

        // create a 3D rectangle
        this._shieldMesh = BABYLON.MeshBuilder.CreateBox('shield', { width: 0.5, height: 1, depth: 0.1 }, scene);
        this._shieldMesh.position = new BABYLON.Vector3(2, 2, 2);
        this._shieldMesh.metadata = { parentClass: this };

        // material
        const shieldMaterial = new BABYLON.StandardMaterial('shieldMaterial', scene);
        shieldMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);
        shieldMaterial.alpha = 0.65;
        this._shieldMesh.material = shieldMaterial;

        // camera
        this._camera = this._scene.activeCamera;

        this.attatch();
        this._shieldMesh.scaling = new BABYLON.Vector3(0, 0, 0);
    }

    private attatch(): void {
        if (Game.vrSupported) {
            // If the VR is supported, the gun model is attached to the hand.
            let leftAnchor = this._scene.getMeshByName('leftAnchor');

            this._shieldMesh.setParent(leftAnchor);
            this._shieldMesh.position = new BABYLON.Vector3(0, 0, 0);
        } else {
            const cameraDirection = this._camera.getForwardRay().direction;

            // Shield position
            let offset = cameraDirection.scale(1.2);
            this._shieldMesh.position = this._camera.position.add(offset);

            // Shield rotation
            this._shieldMesh.lookAt(this._camera.position);

            // Offset to bottom left corner
            this._shieldMesh.position = this._shieldMesh.absolutePosition.add(this._shieldMesh.right.normalize().scale(0.75));
            this._shieldMesh.position = this._shieldMesh.absolutePosition.add(this._shieldMesh.up.normalize().scale(-0.4));

            this._shieldMesh.setParent(this._camera);
        }
    }

    private _alphaLerpSpeed = 0.15; // Adjust this value for faster or slower alpha transitions
    private _noTouchAlpha = 0.65;
    private _touchAlpha = 0.95;

    public animate(deltaTime: number, shieldSize: number): void {
        const scalingLerpSpeed = 0.17; // Adjust this value for faster or slower scaling transitions

        // Smoothly transition the shield scaling
        const currentScaling = this._shieldMesh.scaling;
        const targetScaling = new BABYLON.Vector3(shieldSize, shieldSize, shieldSize);
        const newScaling = BABYLON.Vector3.Lerp(currentScaling, targetScaling, scalingLerpSpeed);
        this._shieldMesh.scaling = newScaling;

        // ===

        // Smoothly transition the shield alpha
        const currentAlpha = this._shieldMesh.material.alpha;
        const targetAlpha = this._istouched ? this._touchAlpha : this._noTouchAlpha;
        const newAlpha = BABYLON.Scalar.Lerp(currentAlpha, targetAlpha, this._alphaLerpSpeed);
        this._shieldMesh.material.alpha = newAlpha;

        if (Math.abs(currentAlpha - this._touchAlpha) < 0.1) {
            this._istouched = false;
        }
    }

    public touch(): void {
        this._istouched = true;
        Game.hapticManager.vibrateController('left', 0.8, 100);
    }

    public dispose(): void {
        this._shieldMesh.dispose();
    }
}
