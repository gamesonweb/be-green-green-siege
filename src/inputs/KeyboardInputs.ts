import * as BABYLON from 'babylonjs';
import Inputs from './Inputs';

export default class KeyboardInputs {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _canvas: HTMLCanvasElement;
    private _inputs: Inputs;

    constructor(scene: BABYLON.Scene, camera: BABYLON.FreeCamera, canvas: HTMLCanvasElement, inputs: Inputs) {
        this._scene = scene;
        this._camera = camera;
        this._canvas = canvas;
        this._inputs = inputs;

        this.initInputs();
    }

    initInputs() {
        window.addEventListener('keydown', (evt) => {
            switch (evt.key) {
                case ' ':
                    this._inputs.rightSecondary(true);
                    break;
                case 'a':
                    this._inputs.leftTrigger(true);
                    break;
                case 'z':
                    this._inputs.leftPrimary(true);
                    break;
                case 'e':
                    this._inputs.leftSecondary(true);
                    break;
                case 'r':
                    this._inputs.leftSqueeze(true);
                    break;
                case 't':
                    this._inputs.rightSqueeze(true);
                    break;
                case 'Escape':
                    this._scene.getEngine().exitPointerlock();
            }
        });

        window.addEventListener('keyup', (evt) => {
            switch (evt.key) {
                case ' ':
                    this._inputs.rightSecondary(false);
                    break;
                case 'a':
                    this._inputs.leftTrigger(false);
                    break;
                case 'z':
                    this._inputs.leftPrimary(false);
                    break;
                case 'e':
                    this._inputs.leftSecondary(false);
                    break;
                case 'r':
                    this._inputs.leftSqueeze(false);
                    break;
                case 't':
                    this._inputs.rightSqueeze(false);
                    break;
            }
        });

        this._canvas.addEventListener('pointerdown', (evt) => {
            if (!this._scene.getEngine().isPointerLock) {
                this._canvas.requestPointerLock();
            }
            switch (evt.button) {
                case 0:
                    this._inputs.rightTrigger(true);
                    break;
                case 2:
                    this._inputs.rightPrimary(true);
                    break;
            }
        });
        this._canvas.addEventListener('pointerup', (evt) => {
            switch (evt.button) {
                case 0:
                    this._inputs.rightTrigger(false);
                    break;
                case 2:
                    this._inputs.rightPrimary(false);
                    break;
            }
        });

        this._canvas.addEventListener('pointerlockchange', (evt) => {
            if (document.pointerLockElement === this._canvas) {
                this._scene.getEngine().enterPointerlock();
            } else {
                this._scene.getEngine().exitPointerlock();
            }
        });
    }
}
