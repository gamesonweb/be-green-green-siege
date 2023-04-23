import * as BABYLON from 'babylonjs';
import HapticManager from './HapticManager';
import SceneManager from './SceneManager';
import { TimeControl } from './TimeControl';
import xrHandler from './XRHandler';
import DebugConsole from './debug/debugConsole';
import Debug3D from './debug/debugConsole3D';
import Logger from './debug/logger';
import Inputs from './inputs/Inputs';
import KeyboardInputs from './inputs/KeyboardInputs';
import XRInputs from './inputs/XRInputs';
import { InstanceLoader } from './instanceLoader';
import { Player } from './player/player';
import { StateManager, StatesEnum } from './states/stateManager';

export class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;

    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _inputs: Inputs;

    public static hapticManager: HapticManager;
    public static debug: DebugConsole;
    public static debug3D: Debug3D;
    public static vrSupported: Boolean;
    public static instanceLoader: InstanceLoader;

    private _assetManager: BABYLON.AssetsManager;
    private _spawnPoint: BABYLON.AbstractMesh;
    private _stateManager: StateManager;

    private static _player: Player;

    constructor(canvasElement: string) {
        this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
    }

    createBasicScene(engine: BABYLON.Engine): BABYLON.Scene {
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        return scene;
    }

    createFreeCamera(scene: BABYLON.Scene, cavnas: HTMLCanvasElement): BABYLON.FreeCamera {
        const camera = new BABYLON.FreeCamera('PlayerNoVRCamera', BABYLON.Vector3.Zero(), scene);
        camera.attachControl(cavnas, true);
        camera.inertia = 0;
        camera.angularSensibility = 1000;
        return camera;
    }

    /**
     * Creates the debug camera.
     */
    createDebugCamera(scene: BABYLON.Scene, cavnas: HTMLCanvasElement): void {
        const debugCamera = new BABYLON.FreeCamera('DebugCamera', new BABYLON.Vector3(0, 0, -10), scene);
        debugCamera.position = new BABYLON.Vector3(5, 10);
        debugCamera.setTarget(BABYLON.Vector3.Zero());
        debugCamera.attachControl(cavnas, true);
        debugCamera.speed = 10;
        debugCamera.inertia = 0;
        debugCamera.angularSensibility = 1000;
    }

    async createInput(scene: BABYLON.Scene, camera: BABYLON.FreeCamera, cavnas: HTMLCanvasElement, inputs: Inputs) {
        if (Game.vrSupported) {
            Logger.log('VR supported');

            // Load input
            await xrHandler.initXR(scene);

            new XRInputs(scene, camera, cavnas, xrHandler.xr, inputs);
            Game.hapticManager = new HapticManager(xrHandler.xr);
        } else {
            Logger.log('VR not supported');

            // Load input
            new KeyboardInputs(scene, camera, cavnas, inputs);
            Game.hapticManager = new HapticManager(null);
        }
    }

    /**
     * Creates the BABYLONJS Scene
     */
    async createScene(): Promise<void> {
        this._scene = this.createBasicScene(this._engine);
        this._camera = this.createFreeCamera(this._scene, this._canvas);
        this._assetManager = new BABYLON.AssetsManager(this._scene);
        this._stateManager = new StateManager(this._scene);
        this._inputs = new Inputs(this, this._stateManager, this._scene, this._camera, this._canvas);

        Game.vrSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-ar');
        Game.debug = new DebugConsole(this, this._scene, this._camera, this._canvas);
        Game.debug3D = new Debug3D(this._scene);

        // Player
        Game._player = new Player(this._scene);

        // Load platform
        // FIXME : Changer pour chargé l'objet unique
        let platformTask = this._assetManager.addMeshTask('scene', '', './assets/', 'scene.glb');
        let testTask = this._assetManager.addMeshTask('robot', '', './assets/', 'robot.glb');
        let gunTask = this._assetManager.addMeshTask('fun', '', './assets/', 'gun.glb');
        let shieldTask = this._assetManager.addMeshTask('shield', '', './assets/', 'shield.glb');

        SceneManager.initPlatform(platformTask);
        SceneManager.initRobot(testTask);
        SceneManager.initGun(gunTask);
        SceneManager.initShield(shieldTask);

        this._assetManager.load();

        this._scene.executeWhenReady(async () => {
            Game.instanceLoader = new InstanceLoader(this._scene);

            SceneManager.configureMaterials(this._scene);
            SceneManager.configureLights(this._scene);

            // Set the camera's position to the spawn point's position plus the up vector
            this._spawnPoint = this._scene.getMeshByName('SpawnPoint');
            this._spawnPoint.visibility = 0;

            const upVector = new BABYLON.Vector3(0, 1, 0);
            this._camera.position = this._spawnPoint.absolutePosition.clone().add(upVector);
            this._camera.rotation.y -= Math.PI;

            // Load input
            this.createInput(this._scene, this._camera, this._canvas, this._inputs);

            this._stateManager.switchState(StatesEnum.MAINMENU);

            // Debug
            this.createDebugCamera(this._scene, this._canvas);

            this.animate();
        });
    }

    /**
     * Starts the animation loop.
     */
    animate(): void {
        let lastTime = performance.now(); // Get the current time

        this._scene.registerBeforeRender(() => {
            const currentTime = performance.now(); // Get the new current time
            let deltaTime: number = (currentTime - lastTime) / 1000; // Calculate deltaTime in seconds
            lastTime = currentTime; // Update lastTime for the next frame

            const fps = 'FPS: ' + this._engine.getFps().toFixed();
            Game.debug.fps.innerHTML = fps;
            Game.debug3D.update(fps);

            Game._player.animate(deltaTime * TimeControl.getTimeScale());
            this._stateManager.getCurrentState().animate(deltaTime * TimeControl.getTimeScale());
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
