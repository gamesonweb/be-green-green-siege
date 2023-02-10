"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@babylonjs/core");
var decorators_1 = require("../decorators");
var PlayerCamera = /** @class */ (function (_super) {
    __extends(PlayerCamera, _super);
    /**
     * Override constructor.
     * @warn do not fill.
     */
    // @ts-ignore ignoring the super call as we don't want to re-init
    function PlayerCamera() {
        var _this = this;
        return _this;
    }
    /**
     * Called on the scene starts.
     */
    PlayerCamera.prototype.onStart = function () {
        // For the example, let's configure the keys of the camera using the @visibleInInspector decorator.
        this.keysUp = [this._forwardKey];
        this.keysDown = [this._backwardKey];
        this.keysLeft = [this._strafeLeftKey];
        this.keysRight = [this._strafeRightKey];
    };
    /**
     * Called each frame.
     */
    PlayerCamera.prototype.onUpdate = function () {
        // Nothing to do now...
    };
    /**
     * Called on the user clicks on the canvas.
     * Used to request pointer lock and launch a new ball.
     */
    PlayerCamera.prototype._onPointerEvent = function (info) {
        this._enterPointerLock();
        this._launchBall(info);
    };
    /**
     * Called on the escape key (key code 27) is up.
     * Used to exit pointer lock.
     */
    PlayerCamera.prototype._onEscapeKey = function () {
        var engine = this.getEngine();
        if (engine.isPointerLock) {
            engine.exitPointerlock();
        }
    };
    /**
     * Requests the pointer lock.
     */
    PlayerCamera.prototype._enterPointerLock = function () {
        var engine = this.getEngine();
        if (!engine.isPointerLock) {
            engine.enterPointerlock();
        }
    };
    /**
     * Launches a new ball from the camera position to the camera direction.
     */
    PlayerCamera.prototype._launchBall = function (info) {
        // Create a new ball instance
        var ballInstance = this._ball.createInstance("ballInstance");
        ballInstance.position.copyFrom(this._ball.getAbsolutePosition());
        // Create physics impostor for the ball instance
        ballInstance.physicsImpostor = new core_1.PhysicsImpostor(ballInstance, core_1.PhysicsImpostor.SphereImpostor, { mass: 1, friction: 0.2, restitution: 0.2 });
        // Apply impulse on ball
        var force = this.getDirection(new core_1.Vector3(0, 0, 1)).multiplyByFloats(this._ballForceFactor, this._ballForceFactor, this._ballForceFactor);
        ballInstance.applyImpulse(force, ballInstance.getAbsolutePosition());
    };
    __decorate([
        (0, decorators_1.fromChildren)("ball")
    ], PlayerCamera.prototype, "_ball", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("KeyMap", "Forward Key", "z".charCodeAt(0))
    ], PlayerCamera.prototype, "_forwardKey", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("KeyMap", "Backward Key", "s".charCodeAt(0))
    ], PlayerCamera.prototype, "_backwardKey", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("KeyMap", "Strafe Left Key", "q".charCodeAt(0))
    ], PlayerCamera.prototype, "_strafeLeftKey", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("KeyMap", "Strafe Right Key", "d".charCodeAt(0))
    ], PlayerCamera.prototype, "_strafeRightKey", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("number", "Ball Force Factor", 1)
    ], PlayerCamera.prototype, "_ballForceFactor", void 0);
    __decorate([
        (0, decorators_1.onPointerEvent)(core_1.PointerEventTypes.POINTERDOWN, false)
    ], PlayerCamera.prototype, "_onPointerEvent", null);
    __decorate([
        (0, decorators_1.onKeyboardEvent)([27], core_1.KeyboardEventTypes.KEYUP)
    ], PlayerCamera.prototype, "_onEscapeKey", null);
    return PlayerCamera;
}(core_1.FreeCamera));
exports.default = PlayerCamera;
//# sourceMappingURL=camera.js.map