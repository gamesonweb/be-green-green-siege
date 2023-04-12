import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
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
        model.isVisible = false;

        return model;
    }

    private attatch(): void {
        if (Game.vrSupported) {
            // If the VR is supported, the gun model is attached to the hand.
        } else {
            this.createPointeur();

            const cameraDirection = this._camera.getForwardRay().direction;

            // gun position
            let offset = cameraDirection.scale(1.2);
            this._gunModel.position = this._camera.position.add(offset);

            // gun rotation
            this._gunModel.lookAt(this._camera.position);

            this._gunModel.setParent(this._camera);

            // laser position
            this._laserModel.position = this._gunModel.getAbsolutePosition().clone();

            // laser rotation
            this._laserModel.lookAt(this._camera.position);
            this._laserModel.rotation.x = this._laserModel.rotation.x - Math.PI / 2;

            this._laserModel.setParent(this._gunModel);
        }
    }

    private createPointeur(): void {
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
        const canvasWidth = advancedTexture.getSize().width;
        const canvasHeight = advancedTexture.getSize().height;

        const crossSize = 10;

        // Vertical line
        let verticalLine = new GUI.Line();
        verticalLine.lineWidth = 4;
        verticalLine.color = 'white';
        verticalLine.x1 = canvasWidth / 2;
        verticalLine.y1 = canvasHeight / 2 - crossSize;
        verticalLine.x2 = canvasWidth / 2;
        verticalLine.y2 = canvasHeight / 2 + crossSize;

        // Horizontal line
        let horizontalLine = new GUI.Line();
        horizontalLine.lineWidth = 4;
        horizontalLine.x1 = canvasWidth / 2 - crossSize;
        horizontalLine.y1 = canvasHeight / 2;
        horizontalLine.x2 = canvasWidth / 2 + crossSize;
        horizontalLine.y2 = canvasHeight / 2;

        // Add lines as controls to the advanced texture
        advancedTexture.addControl(verticalLine);
        advancedTexture.addControl(horizontalLine);
    }

    public fire(): void {
        const laserInstance = this._laserModel.createInstance('laserInstance');
        laserInstance.position = this._laserModel.getAbsolutePosition().clone();
        laserInstance.rotationQuaternion = this._laserModel.absoluteRotationQuaternion.clone();
        laserInstance.isVisible = true;
    }

    public animate(deltaTime: number): void {
        this._laserModel.instances.forEach((laser) => {
            laser.position.addInPlace(laser.up.scale(this._laserSpeed));
        }, this);
    }
}
