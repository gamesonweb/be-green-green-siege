import * as BABYLON from 'babylonjs';
import { Game } from '../game';

export default class DebugConsole {
    private _game: Game;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;

    private _window = document.getElementById('debugWindow');

    fps = document.getElementById('fps');
    cameraSpeed = document.getElementById('cameraSpeed') as HTMLInputElement;
    debugCamera = document.getElementById('debugCamera') as HTMLInputElement;
    currentstate = document.getElementById('currentstate');

    constructor(game: Game, scene: BABYLON.Scene, camera: BABYLON.FreeCamera, canvas: HTMLCanvasElement) {
        this._game = game;
        this._scene = scene;
        this._camera = camera;

        this._window.style.display = 'none';

        this.addListeners();
    }

    toggleDebug() {
        this._window.style.display = this._window.style.display == 'none' ? 'block' : 'none';
    }

    addListeners() {
        this.cameraSpeed.addEventListener('input', (evt) => {
            this._camera.angularSensibility = +this.cameraSpeed.value;
        });

        this.debugCamera.addEventListener('change', (evt) => {
            // get debugCamera
            let debugCamera = this._scene.getCameraByName('DebugCamera');
            if (this._scene.activeCamera == debugCamera) {
                this._scene.activeCamera = this._camera;
            } else {
                this._scene.activeCamera = debugCamera;
            }
        });
    }
}
