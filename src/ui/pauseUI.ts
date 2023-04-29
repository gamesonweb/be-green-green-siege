import UI from "./ui";
import * as GUI from "babylonjs-gui";
import * as BABYLON from "babylonjs";
import { Game } from "../game";
import xrHandler from "../XRHandler";
import { Texture } from "babylonjs/Legacy/legacy";

export default class PauseUI implements UI {
    
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _manager: GUI.GUI3DManager;

    private _cylinder: BABYLON.Mesh;
    
    public anchor: BABYLON.TransformNode;

    private _upperSunIntensity: number;
    private _downSunIntensity: number;

    constructor(scene: BABYLON.Scene, camera: BABYLON.Camera) {
        this._scene = scene;
        this._camera = camera;
    }

    load(): void {
        this._manager = new GUI.GUI3DManager(this._scene);
        // let color = new BABYLON.Color4(0, 0, 0, 0.5);
        this._cylinder = BABYLON.CreateCylinder("test", {height: 10, diameter: 5});
        this._cylinder.flipFaces(true);

        let material = new BABYLON.StandardMaterial("Cylinder", this._scene);
        material.diffuseColor = new BABYLON.Color3(0,0,0);
        material.alpha = 0.4;

        let upSun = this._scene.getLightByName("UpperSun");
        let downSun = this._scene.getLightByName("DownSun");
        this._upperSunIntensity = upSun.intensity;
        this._downSunIntensity = downSun.intensity;
        upSun.intensity = 0;
        downSun.intensity = 0;

        this._cylinder.material = material;
        
        if (Game.vrSupported) {
            xrHandler.setControllerVisibility(false);
        }

        this.anchor = new BABYLON.TransformNode("anchorPause ");
        this.anchor.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
        this.anchor.position = this._camera.position.clone();
        this.anchor.position.z -= 5

        this._cylinder.position = this._camera.position.clone();

        let panel = new GUI.StackPanel3D();
    
        this._manager.addControl(panel);
        panel.linkToTransformNode(this.anchor);
        this.anchor.position = this._camera.position.clone();
        this.anchor.position.z -= 5;

        let leftPanel = new GUI.StackPanel3D(true)
        leftPanel.isVertical = true;
        panel.addControl(leftPanel);
        leftPanel.position.x = -1.5; // Position to the left of center
        
        let rightPanel = new GUI.StackPanel3D(true)
        rightPanel.isVertical = true;
        panel.addControl(rightPanel);
        rightPanel.position.x = 1.5; // Position to the right of center
        
        let middlePanel = new GUI.StackPanel3D(true);
        middlePanel.isVertical = true;
        panel.addControl(middlePanel);
        middlePanel.position.x = 0; // Position in the center

        let textButton = new GUI.HolographicButton("PausedButton");
        textButton.text = "Paused";
        textButton.scaling = new BABYLON.Vector3(2, 2, 2);

        middlePanel.addControl(textButton);
    }
    dispose(): void {
        this._manager.dispose();
        this.anchor.dispose();

        let upSun = this._scene.getLightByName("UpperSun");
        let downSun = this._scene.getLightByName("DownSun");

        upSun.intensity = this._upperSunIntensity;
        downSun.intensity = this._downSunIntensity;

        this._cylinder.dispose();

        if (Game.vrSupported) {
            xrHandler.setControllerVisibility(true);
        }
    }
}