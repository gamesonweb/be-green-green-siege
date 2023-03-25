import Inputs from "./Inputs";
import * as BABYLON from 'babylonjs';

export default class XRInputs {

    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _canvas: HTMLCanvasElement;
    private _xr: BABYLON.WebXRDefaultExperience;
    private _inputs: Inputs;

    constructor(scene: BABYLON.Scene, camera: BABYLON.FreeCamera, canvas: HTMLCanvasElement, xr: BABYLON.WebXRDefaultExperience, inputs: Inputs) {
        this._scene = scene;
        this._camera = camera;
        this._canvas = canvas;
        this._xr = xr;
        this._inputs = inputs;

        this.initInputs();
    }

    initInputs() {
        this._xr.input.onControllerAddedObservable.add((controller) => {
            controller.onMotionControllerInitObservable.add((motionController) => {

                let xrIds = motionController.getComponentIds();

                if (motionController.handedness === "left") {
                    let leftTrigger = motionController.getComponent(xrIds[0]); // XR standard trigger
                    let leftPrimary = motionController.getComponent(xrIds[3]); // XR standard primary button
                    let leftSecondary = motionController.getComponent(xrIds[4]); // XR standard primary button
                    
                    leftTrigger.onButtonStateChangedObservable.add((component) => {
                        this._inputs.leftTrigger(component.pressed);
                    });
                    leftPrimary.onButtonStateChangedObservable.add((component) => {
                        this._inputs.leftPrimary(component.pressed);
                    });
                    leftSecondary.onButtonStateChangedObservable.add((component) => {
                        this._inputs.leftSecondary(component.pressed);
                    });
                }
                else if (motionController.handedness === "right") {
                    let rightTrigger = motionController.getComponent(xrIds[0]); // XR standard trigger
                    let rightPrimary = motionController.getComponent(xrIds[3]); // XR standard primary button
                    let rightSecondary = motionController.getComponent(xrIds[4]); // XR standard primary button

                    rightTrigger.onButtonStateChangedObservable.add((component) => {
                        this._inputs.rightTrigger(component.pressed);
                    });
                    rightPrimary.onButtonStateChangedObservable.add((component) => {
                        this._inputs.rightPrimary(component.pressed);
                    });
                    rightSecondary.onButtonStateChangedObservable.add((component) => {
                        this._inputs.rightSecondary(component.pressed);
                    });
                }
            });
        });
    }




    
    
    

}