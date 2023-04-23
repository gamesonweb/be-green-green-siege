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
        const createAnchor = (name: string): BABYLON.Mesh => {
            const anchor = BABYLON.MeshBuilder.CreateBox(name, { size: 1 }, this._scene);
            anchor.isVisible = true;
            return anchor;
        };
        const leftAnchor = createAnchor('leftAnchor');
        const rightAnchor = createAnchor('rightAnchor');
        window.addEventListener('keydown', (evt) => {
            switch (evt.key) {
                case ' ':
                    this._inputs.rightSecondary(true);
                    break;
                case 'a':
                    this._inputs.leftTrigger(true, 1);
                    break;
                case 'z':
                    this._inputs.leftPrimary(true);
                    break;
                case 'e':
                    this._inputs.leftSecondary(true);
                    break;
                case 'r':
                    this._inputs.leftSqueeze(true, 1);
                    break;
                case 't':
                    this._inputs.rightSqueeze(true, 1);
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
                    this._inputs.leftTrigger(false, 0);
                    break;
                case 'z':
                    this._inputs.leftPrimary(false);
                    break;
                case 'e':
                    this._inputs.leftSecondary(false);
                    break;
                case 'r':
                    this._inputs.leftSqueeze(false, 0);
                    break;
                case 't':
                    this._inputs.rightSqueeze(false, 0);
                    break;
            }
        });

        this._canvas.addEventListener('pointerdown', (evt) => {
            if (!this._scene.getEngine().isPointerLock) {
                this._canvas.requestPointerLock();
            }
            switch (evt.button) {
                case 0:
                    this._inputs.rightTrigger(true, 1);
                    break;
                case 2:
                    this._inputs.rightPrimary(true);
                    break;
            }
        });
        this._canvas.addEventListener('pointerup', (evt) => {
            switch (evt.button) {
                case 0:
                    this._inputs.rightTrigger(false, 0);
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
