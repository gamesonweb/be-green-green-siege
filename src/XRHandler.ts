import * as BABYLON from 'babylonjs';

class XRHandler {
    // XR
    public _xr: BABYLON.WebXRDefaultExperience;

    // Controllers
    private _leftController: BABYLON.WebXRAbstractMotionController | null = null;
    private _rightController: BABYLON.WebXRAbstractMotionController | null = null;

    /**
     * Initialize XR.
     * @param scene The scene.
     */
    public async initXR(scene: BABYLON.Scene): Promise<void> {
        // Get platform
        let platform = scene.getMeshByName('n1b14');
        this._xr = await scene.createDefaultXRExperienceAsync({ floorMeshes: [platform] });

        this._xr.input.onControllerAddedObservable.add((controller) => {
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

    /**
     * Get the XR object.
     * @returns The XR object.
     */
    public getXR(): BABYLON.WebXRDefaultExperience {
        return this._xr;
    }

    /**
     * Hide or show the controllers.
     * @param visible True to show the controllers, false to hide them.
     */
    public isControllerVisible(visible: boolean): void {
        this._xr.input.controllers.forEach((controller) => {
            controller.motionController!.rootMesh.getChildMeshes().forEach((mesh) => {
                mesh.isVisible = visible;
            });
        });
    }

    /**
     * Vibrate the controllers.
     * @param handedness witch controller to vibrate
     * @param intensity intensity of the vibration
     * @param duration duration of the vibration
     * @param timeout time before the vibration
     */
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

const xrHandler = new XRHandler();
export default xrHandler;
