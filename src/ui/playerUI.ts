import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { Game } from '../game';

export default class PlayerUI {
    scoreString: string;
    shieldLifeString: string;
    lifeString: string;

    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;
    anchorUI: BABYLON.TransformNode;
    private _mainPanel: GUI.StackPanel3D;
    private _manager: GUI.GUI3DManager;
    private textBox: GUI.TextBlock;

    private static WIDTH = 0.5;
    private static HEIGHT = 0.2;
    private static FONT_SIZE = 35;

    constructor(_scene: BABYLON.Scene) {
        this.scoreString = '🪙 0';
        this.shieldLifeString = '🛡️ 0';
        this.lifeString = '❤️ 0';

        this._scene = _scene;
    }

    load() {
        // this._scene.debugLayer.show();
        if (Game.vrSupported) {
            this._camera = this._scene.activeCamera;
        } else {
            this._camera = this._scene.getCameraByName('PlayerNoVRCamera');
        }
        this._initUI();
        this._attach();
        this.updateText();
    }

    private _initUI(): void {
        this._manager = new GUI.GUI3DManager(this._scene);

        // Create a main panel that will contain 3D UI
        this._mainPanel = new GUI.StackPanel3D();
        this._manager.addControl(this._mainPanel);

        this._initAnchor();

        const planeMesh = BABYLON.MeshBuilder.CreatePlane(
            'textZonePlane',
            {
                width: PlayerUI.WIDTH,
                height: PlayerUI.HEIGHT,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            },
            this._scene
        );

        // Create an advanced dynamic texture for the plane mesh
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
            planeMesh,
            Math.round(PlayerUI.WIDTH * 512),
            Math.round(PlayerUI.HEIGHT * 512)
        );

        // Create a 2D rectangle container for the text block
        const textZone = new GUI.Rectangle('textZone');
        textZone.thickness = 3;
        textZone.background = 'rgba(0, 0, 0, 0.5)';
        textZone.cornerRadius = 10;
        advancedTexture.addControl(textZone);

        // Create a text block inside the rectangle
        const textBlock = new GUI.TextBlock();
        textBlock.text = 'test';
        textBlock.color = 'white';
        textBlock.fontSize = PlayerUI.FONT_SIZE;
        textBlock.fontWeight = 'bold';
        textBlock.textWrapping = true; // Enable text wrapping
        textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        textZone.addControl(textBlock);
        this.textBox = textBlock;

        // Create a standard material and set the advanced dynamic texture as its diffuse texture
        const material = new BABYLON.StandardMaterial('textZoneMaterial', this._scene);
        material.diffuseTexture = advancedTexture;
        material.opacityTexture = material.diffuseTexture;
        material.emissiveColor = BABYLON.Color3.White();
        material.disableLighting = true;
        planeMesh.material = material;

        // Create a MeshButton3D using the plane mesh
        const meshButton = new GUI.MeshButton3D(planeMesh);
        meshButton.scaling.x = PlayerUI.WIDTH;
        meshButton.scaling.y = PlayerUI.HEIGHT;

        // Disable scaling effect on pointer enter and exit
        meshButton.pointerEnterAnimation = () => {};
        meshButton.pointerOutAnimation = () => {};
        meshButton.pointerUpAnimation = () => {};
        meshButton.pointerDownAnimation = () => {};

        // Add the mesh button to the 3D stack panel
        this._mainPanel.addControl(meshButton);
    }

    private _initAnchor(): void {
        // Create anchor transform node
        this.anchorUI = new BABYLON.TransformNode('anchorPlayerUI');
        this.anchorUI.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
        this.anchorUI.position = this._camera.position.clone();
        // this.anchor.position.z -= 5;
        // this.anchor.position.y = 2;
        this._mainPanel.linkToTransformNode(this.anchorUI);
    }

    private _attach(): void {
        const leftAnchor = this._scene.getMeshByName('leftAnchor') as BABYLON.Mesh;

        if (Game.vrSupported) {
            // If VR is supported, attach the gun model to the VR hand
            this.attachToVRHand(leftAnchor);
        } else {
            // If VR is not supported, attach the gun model to the camera
            this.attachToCamera(leftAnchor);
        }
    }

    private attachToVRHand(anchor: BABYLON.Mesh): void {
        this.anchorUI.setParent(anchor);
        this.anchorUI.position = anchor.position.clone();
        this.anchorUI.rotation = anchor.rotation.clone();
        this.anchorUI.rotation.x += 0.3;
        this.anchorUI.position.y += 0.2;
        this.anchorUI.position.z += -0.1;
    }

    private attachToCamera(anchor: BABYLON.Mesh): void {
        this.anchorUI.setParent(anchor);
        this.anchorUI.position = anchor.position.clone();
        this.anchorUI.rotation = anchor.rotation.clone();
        this.anchorUI.rotation.x += 0.3;
        this.anchorUI.position.x += 0;
        this.anchorUI.position.y += 0.2;
        this.anchorUI.position.z += -0.1;
    }

    updateText() {
        let text = ' ' + this.lifeString + '  ' + this.shieldLifeString + '\n ' + this.scoreString;
        this.textBox.text = text;
    }

    updateScore(score: number) {
        this.scoreString = '🪙 ' + score;
    }

    updateShieldLife(shieldLife: number) {
        shieldLife = Math.round(shieldLife);
        this.shieldLifeString = '🛡️ ' + shieldLife;
    }

    updateLife(life: number) {
        this.lifeString = '❤️ ' + life;
    }

    dispose() {
        this._mainPanel.dispose();
        this._manager.dispose();
    }
}
