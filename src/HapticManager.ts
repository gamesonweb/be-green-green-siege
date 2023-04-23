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

    public vibrateController(handedness: 'left' | 'right' | 'all', intensity: number, duration: number, timeout: number = 0): void {
        const vibrate = (controller: BABYLON.WebXRAbstractMotionController) => {
            if (controller) {
                setTimeout(() => {
                    controller.pulse(intensity, duration);
                }, timeout);
            }
        };

        if (handedness === 'all') {
            vibrate(this._leftController);
            vibrate(this._rightController);
        } else {
            const controller = handedness === 'left' ? this._leftController : this._rightController;
            vibrate(controller);
        }
    }
}
