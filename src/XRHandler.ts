import * as BABYLON from 'babylonjs';
import timeControl from './TimeControl';
import { Game } from './game';
import { StateManager, StatesEnum } from './states/stateManager';

class XRHandler {
    // Scene
    private _scene: BABYLON.Scene;
    private _stateManager: StateManager;

    // XR
    public _xr: BABYLON.WebXRDefaultExperience;

    // Controllers
    private _leftController: BABYLON.WebXRAbstractMotionController;
    private _rightController: BABYLON.WebXRAbstractMotionController;

    /**
     * Initialize XR.
     * @param scene The scene.
     */
    public async initXR(scene: BABYLON.Scene, StateManager: StateManager): Promise<void> {
        this._scene = scene;
        this._stateManager = StateManager;

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
        this._xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
            // Create a sphere to show the user where the center of the world is
            let sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 2 }, this._scene);
            sphere.position = Game.player.getHeadPosition();
            let material = new BABYLON.StandardMaterial('black', this._scene);
            material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            material.backFaceCulling = false;
            material.alpha = 1;
            sphere.material = material;

            // Fade out the sphere
            setTimeout(() => {
                let alpha = 1;
                let interval = setInterval(() => {
                    alpha -= 0.05;
                    material.alpha = alpha;
                    if (alpha <= 0) {
                        clearInterval(interval);
                        sphere.dispose();
                    }
                }, 50);
            }, 1000);

            // Switch to menu state
            if (this._stateManager.getCurrentState().type === StatesEnum.NOVR) {
                this._stateManager.switchState(StatesEnum.LOBY);
            }
        });

        // Pause the game when the session is ended
        this._xr.baseExperience.sessionManager.onXRSessionEnded.add(() => {
            const currentstate = this._stateManager.getCurrentState();
            if (currentstate.type === StatesEnum.LEVEL) {
                if (!timeControl.isPaused()) {
                    timeControl.pause();
                    currentstate.pause();
                }
            }
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
     * Hide or show the controllers and laser.
     * @param visible True to show the controllers and laser, false to hide them.
     * @param controllerSide The side of the controller to hide.
     */
    public setControllerVisibility(visible: boolean, controllerSide: 'left' | 'right' | 'both' = 'both'): void {
        if (!this._xr) return;
        this._xr.input.controllers.forEach((controller, index) => {
            if (
                (controllerSide === 'right' && index === 1) ||
                (controllerSide === 'left' && index === 0) ||
                controllerSide === 'both'
            ) {
                controller.motionController!.rootMesh.getChildMeshes().forEach((mesh) => {
                    mesh.isVisible = visible;
                });
            }
        });

        // Hide the laser and pointer
        if (visible) {
            this._xr.pointerSelection.displayLaserPointer = true;
            this._xr.pointerSelection.displaySelectionMesh = true;
        } else {
            if (controllerSide === 'both') {
                this._xr.pointerSelection.displayLaserPointer = false;
                this._xr.pointerSelection.displaySelectionMesh = false;
            }
        }

        if (controllerSide === 'both' || controllerSide === 'right') {
            this._hideMeshWithChildren(this._scene.getMeshByName('GunParent'), !visible);
        }

        if (controllerSide === 'both' || controllerSide === 'left') {
            this._hideMeshWithChildren(this._scene.getMeshByName('ShieldGrip'), !visible);
        }
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
