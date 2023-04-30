import * as BABYLON from 'babylonjs';
import timeControl from './TimeControl';

class XRHandler {
    // Scene
    private _scene: BABYLON.Scene;

    // XR
    public _xr: BABYLON.WebXRDefaultExperience;

    // Controllers
    private _leftController: BABYLON.WebXRAbstractMotionController;
    private _rightController: BABYLON.WebXRAbstractMotionController;

    /**
     * Initialize XR.
     * @param scene The scene.
     */
    public async initXR(scene: BABYLON.Scene): Promise<void> {
        this._scene = scene;

        // Get platform
        const platform = scene.getMeshByName('n1b14');
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

        // Disable teleportation
        this._disableTeleportation();

        // Handle session init
        this._handleXRSessionInit();
    }

    private _disableTeleportation(): void {
        this._xr.teleportation.dispose();
    }

    private _handleXRSessionInit(): void {
        this._xr.baseExperience.sessionManager.onXRSessionInit.add(() => {});

        this._xr.baseExperience.sessionManager.onXRSessionEnded.add(() => {
            // FIXME : appeler la fonction pause du jeu et pas juste le temps
            timeControl.pause();
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
    public setControllerVisibility(visible: boolean): void {
        if (!this._xr) return;
        this._xr.input.controllers.forEach((controller) => {
            controller.motionController!.rootMesh.getChildMeshes().forEach((mesh) => {
                mesh.isVisible = visible;
            });
        });

        // Hide the laser and pointer
        this._xr.pointerSelection.displayLaserPointer = visible;
        this._xr.pointerSelection.displaySelectionMesh = visible;

        // Hide gun and shield
        this._scene.getMeshByName('GunParent').isVisible = !visible;
        this._scene.getMeshByName('ShieldGrip').isVisible = !visible;

        this._hideMeshWithChildren(this._scene.getMeshByName('GunParent'), !visible);
        this._hideMeshWithChildren(this._scene.getMeshByName('ShieldGrip'), !visible);
    }

    private _hideMeshWithChildren(mesh: BABYLON.AbstractMesh, hide: boolean) {
        mesh.isVisible = hide;
        mesh.getChildren().forEach((child) => {
            if (child instanceof BABYLON.AbstractMesh) {
                this._hideMeshWithChildren(child, hide);
            }
        });
    }

    /**
     * Vibrate the controllers.
     * @param handedness witch controller to vibrate
     * @param intensity intensity of the vibration
     * @param duration duration of the vibration
     * @param timeout time before the vibration
     */
    public vibrateController(
        handedness: 'left' | 'right' | 'all',
        intensity: number,
        duration: number,
        timeout: number = 0
    ): void {
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
