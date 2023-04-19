import * as BABYLON from 'babylonjs';

export default class HapticManager {
    private _leftController: BABYLON.WebXRAbstractMotionController | null = null;
    private _rightController: BABYLON.WebXRAbstractMotionController | null = null;

    constructor(xr: BABYLON.WebXRDefaultExperience | null) {
        if (xr) {
            xr.input.onControllerAddedObservable.add((controller) => {
                controller.onMotionControllerInitObservable.add((motionController) => {
                    const handedness = motionController.handedness;
                    if (handedness === 'left') {
                        this._leftController = motionController;
                    } else if (handedness === 'right') {
                        this._rightController = motionController;
                    }
                });
            });
        }
    }

    public vibrateController(handedness: 'left' | 'right', intensity: number, duration: number): void {
        const controller = handedness === 'left' ? this._leftController : this._rightController;
        if (controller) {
            controller.pulse(intensity, duration);
        }
    }
}
