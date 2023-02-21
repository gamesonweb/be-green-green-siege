import { FreeCamera, PointerEventTypes, Mesh, PointerInfo, PhysicsImpostor, Vector3, KeyboardEventTypes, MeshBuilder } from "@babylonjs/core";
import { sceneUboDeclaration } from "@babylonjs/core/Shaders/ShadersInclude/sceneUboDeclaration";

import { fromChildren, visibleInInspector, onPointerEvent, onKeyboardEvent, fromScene } from "../decorators";
import laser from "./laser";

import LaserComponent from "./laser"

export default class PlayerCamera extends FreeCamera {

    @fromChildren("laser")
    private _laser: LaserComponent;

    @fromChildren("blaster")
    private _blaster: LaserComponent;

    /**
     * Override constructor.
     * @warn do not fill.
     */
    // @ts-ignore ignoring the super call as we don't want to re-init
    private constructor() { }

    /**
     * Called on the scene starts.
     */
    public onStart(): void {
    }


    /**
     * Called each frame.
     */
    public onUpdate(): void {
    }

    /**
     * Called on the user clicks on the canvas.
     * Used to request pointer lock and launch a new ball.
     */
    @onPointerEvent(PointerEventTypes.POINTERDOWN, false)
    private _onPointerEvent(info: PointerInfo): void {
        this._enterPointerLock();
        this._launchBall(info);
    }

    /**
     * Called on the escape key (key code 27) is up.
     * Used to exit pointer lock.
     */
    @onKeyboardEvent([27], KeyboardEventTypes.KEYUP)
    private _onEscapeKey(): void {
        const engine = this.getEngine();
        if (engine.isPointerLock) {
            engine.exitPointerlock();
        }
    }

    /**
     * Requests the pointer lock.
     */
    private _enterPointerLock(): void {
        const engine = this.getEngine();
        if (!engine.isPointerLock) {
            engine.enterPointerlock();
        }
    }

    /**
     * Launches a new ball from the camera position to the camera direction.
     */
    private _launchBall(info: PointerInfo): void {

        // Create a laser instance
        const laserInstance = this._laser.createInstance("laserInstance");
        laserInstance.position.copyFrom(this._laser.getAbsolutePosition());
        laserInstance.rotation = new Vector3(this.rotation.x + Math.PI /2, this.rotation.y, this.rotation.z);

    }
}
