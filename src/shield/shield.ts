import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { Targetable } from '../target/targetable';

export class Shield extends Targetable {
    private _scene: BABYLON.Scene;
    private shieldMesh: BABYLON.Mesh;
    private _camera: any;

    constructor(scene: BABYLON.Scene) {
        super();
        this._scene = scene;

        // create a 3D rectangle
        this.shieldMesh = BABYLON.MeshBuilder.CreateBox('shield', { width: 0.5, height: 1, depth: 0.2 }, scene);
        this.shieldMesh.position = new BABYLON.Vector3(2, 2, 2);

        // material
        const shieldMaterial = new BABYLON.StandardMaterial('shieldMaterial', scene);
        shieldMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);
        shieldMaterial.alpha = 0.5;
        this.shieldMesh.material = shieldMaterial;

        // camera
        this._camera = this._scene.activeCamera;

        this.attatch();
    }

    private attatch(): void {
        if (Game.vrSupported) {
            // If the VR is supported, the gun model is attached to the hand.
            let leftAnchor = this._scene.getMeshByName('leftAnchor');

            this.shieldMesh.setParent(leftAnchor);
            this.shieldMesh.position = new BABYLON.Vector3(0, 0, 0);
        } else {
            const cameraDirection = this._camera.getForwardRay().direction;

            // Shield position
            let offset = cameraDirection.scale(1.2);
            this.shieldMesh.position = this._camera.position.add(offset);

            // Shield rotation
            this.shieldMesh.lookAt(this._camera.position);

            // Offset to bottom left corner
            this.shieldMesh.position = this.shieldMesh.absolutePosition.add(this.shieldMesh.right.normalize().scale(0.75));
            this.shieldMesh.position = this.shieldMesh.absolutePosition.add(this.shieldMesh.up.normalize().scale(-0.4));

            this.shieldMesh.setParent(this._camera);
        }
    }

    public dispose(): void {
        this.shieldMesh.dispose();
    }
}
