import { FreeCamera } from "@babylonjs/core";
export default class PlayerCamera extends FreeCamera {
    private _ball;
    private _forwardKey;
    private _backwardKey;
    private _strafeLeftKey;
    private _strafeRightKey;
    private _ballForceFactor;
    /**
     * Override constructor.
     * @warn do not fill.
     */
    private constructor();
    /**
     * Called on the scene starts.
     */
    onStart(): void;
    /**
     * Called each frame.
     */
    onUpdate(): void;
    /**
     * Called on the user clicks on the canvas.
     * Used to request pointer lock and launch a new ball.
     */
    private _onPointerEvent;
    /**
     * Called on the escape key (key code 27) is up.
     * Used to exit pointer lock.
     */
    private _onEscapeKey;
    /**
     * Requests the pointer lock.
     */
    private _enterPointerLock;
    /**
     * Launches a new ball from the camera position to the camera direction.
     */
    private _launchBall;
}
