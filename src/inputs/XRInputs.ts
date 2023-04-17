import * as BABYLON from 'babylonjs';
import Inputs from './Inputs';

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

    private initInputs(): void {
        const createAnchor = (name: string): BABYLON.Mesh => {
            const anchor = BABYLON.MeshBuilder.CreateBox(name, { size: 0.1 }, this._scene);
            anchor.isVisible = false;
            return anchor;
        };

        const leftAnchor = createAnchor('leftAnchor');
        const rightAnchor = createAnchor('rightAnchor');

        const setupButtonListeners = (
            controller: string,
            trigger: BABYLON.WebXRControllerComponent,
            primary: BABYLON.WebXRControllerComponent,
            secondary: BABYLON.WebXRControllerComponent,
            squeeze: BABYLON.WebXRControllerComponent
        ): void => {
            trigger.onButtonStateChangedObservable.add((component) => {
                this._inputs[controller + 'Trigger'](component.pressed);
            });
            primary.onButtonStateChangedObservable.add((component) => {
                this._inputs[controller + 'Primary'](component.pressed);
            });
            secondary.onButtonStateChangedObservable.add((component) => {
                this._inputs[controller + 'Secondary'](component.pressed);
            });
            squeeze.onButtonStateChangedObservable.add((component) => {
                this._inputs[controller + 'Squeeze'](component.pressed);
            });
        };

        this._xr.input.onControllerAddedObservable.add((controller) => {
            controller.onMotionControllerInitObservable.add((motionController) => {
                const [triggerId, squeezeId, , primaryId, secondaryId] = motionController.getComponentIds();
                const handedness = motionController.handedness;

                if (handedness === 'left' || handedness === 'right') {
                    const anchor = handedness === 'left' ? leftAnchor : rightAnchor;
                    anchor.setParent(controller.grip);
                    anchor.rotationQuaternion = controller.grip.rotationQuaternion.clone();
                    anchor.position = new BABYLON.Vector3(0, 0, 0);

                    const trigger = motionController.getComponent(triggerId);
                    const primary = motionController.getComponent(primaryId);
                    const secondary = motionController.getComponent(secondaryId);
                    const squeeze = motionController.getComponent(squeezeId);

                    setupButtonListeners(handedness, trigger, primary, secondary, squeeze);
                }
            });
        });
    }
}
