import * as BABYLON from 'babylonjs';
import DebugConsole from './debug/debugConsole';
import Logger from './debug/logger';
import { GameUtils } from './game-utils';
import Inputs from './inputs/Inputs';
import KeyboardInputs from './inputs/KeyboardInputs';
import XRInputs from './inputs/XRInputs';
import { StateManager, StatesEnum } from './states/stateManager';

export class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;

    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _inputs: Inputs;

    public static debug: DebugConsole;
    public static vrSupported: Boolean;

    private _assetManager: BABYLON.AssetsManager;
    private _spawnPoint: BABYLON.AbstractMesh;
    private _stateManager: StateManager;

    constructor(canvasElement: string) {
        this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
    }

    createBasicScene(engine: BABYLON.Engine): BABYLON.Scene {
        const scene = new BABYLON.Scene(engine);
        const glowLayeer = new BABYLON.GlowLayer('glow', scene);
        glowLayeer.intensity = 0.3;
        return scene;
    }

    createFreeCamera(scene: BABYLON.Scene, cavnas: HTMLCanvasElement): BABYLON.FreeCamera {
        const camera = new BABYLON.FreeCamera('Camera', BABYLON.Vector3.Zero(), scene);
        camera.attachControl(cavnas, true);
        camera.inertia = 0;
        camera.angularSensibility = 1000;
        return camera;
    }

    async createInput(scene: BABYLON.Scene, camera: BABYLON.FreeCamera, cavnas: HTMLCanvasElement, inputs: Inputs) {
        if (Game.vrSupported) {
            Logger.log('VR supported');

            // Get platform
            let platform = scene.getMeshByName('Platform');

            // Load input
            let xr = await scene.createDefaultXRExperienceAsync({ floorMeshes: [platform] });
            new XRInputs(scene, camera, cavnas, xr, inputs);
        } else {
            Logger.log('VR not supported');

            // Load input
            new KeyboardInputs(scene, camera, cavnas, inputs);
        }
    }

    /**
     * Creates the BABYLONJS Scene
     */
    async createScene(): Promise<void> {
        this._scene = this.createBasicScene(this._engine);
        this._camera = this.createFreeCamera(this._scene, this._canvas);
        this._assetManager = new BABYLON.AssetsManager(this._scene);
        this._stateManager = new StateManager(this._scene, this._assetManager);
        this._inputs = new Inputs(this, this._stateManager, this._scene, this._camera, this._canvas);

        Game.vrSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-ar');
        Game.debug = new DebugConsole(this, this._scene, this._camera, this._canvas);

        // create the skybox
        GameUtils.createSkybox('skybox', './assets/texture/skybox/TropicalSunnyDay', this._scene);

        // Load platform
        this._assetManager.addMeshTask('platform', '', './assets/', 'platform.glb');
        this._assetManager.load();

        this._scene.executeWhenReady(async () => {
            Logger.log('Scene is ready');

            // Set the camera's position to the spawn point's position plus the up vector
            this._spawnPoint = this._scene.getMeshByName('SpawnPoint');
            const upVector = new BABYLON.Vector3(0, 1, 0);
            this._camera.position = this._spawnPoint.position.clone().add(upVector);

            // Load input
            this.createInput(this._scene, this._camera, this._canvas, this._inputs);

            this._stateManager.switchState(StatesEnum.MAINMENU);

            // Debug
            this.CreateCameraDebug(this._scene, this._canvas);

            this.animate();
        });
    }

    /**
     * Creates the debug camera.
     */
    CreateCameraDebug(scene: BABYLON.Scene, cavnas: HTMLCanvasElement): void {
        const cameraDebug = new BABYLON.FreeCamera('cameraDebug', new BABYLON.Vector3(0, 0, -10), scene);
        cameraDebug.position = new BABYLON.Vector3(5, 10);
        cameraDebug.setTarget(BABYLON.Vector3.Zero());
        cameraDebug.attachControl(cavnas, true);
        cameraDebug.inertia = 0;
        cameraDebug.angularSensibility = 1000;
    }

    /**
     * Starts the animation loop.
     */
    animate(): void {
        this._scene.registerBeforeRender(() => {
            let deltaTime: number = 1 / this._engine.getFps();
            Game.debug.fps.innerHTML = 'FPS: ' + this._engine.getFps().toFixed();
            this._stateManager.getCurrentState().animate(deltaTime);
        });

        // run the render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        // the canvas/window resize event handler
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}
