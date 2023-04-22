import * as BABYLON from 'babylonjs';
import HapticManager from './HapticManager';
import { TimeControl } from './TimeControl';
import DebugConsole from './debug/debugConsole';
import Debug3D from './debug/debugConsole3D';
import Logger from './debug/logger';
import Inputs from './inputs/Inputs';
import KeyboardInputs from './inputs/KeyboardInputs';
import XRInputs from './inputs/XRInputs';
import { InstanceLoader } from './instanceLoader';
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

    testRobot: BABYLON.AbstractMesh;

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

    configureMaterials(scene: BABYLON.Scene) {
        let mat = ['m1.002', 'm10.002', 'm3.002', 'm2.003', 'm14']
        mat.forEach((materialName) => {
            let material = scene.getMaterialByName(materialName) as BABYLON.PBRMaterial;
            material.metallicF0Factor = 0;
        });
    }

    async createInput(scene: BABYLON.Scene, camera: BABYLON.FreeCamera, cavnas: HTMLCanvasElement, inputs: Inputs) {
        if (Game.vrSupported) {
            Logger.log('VR supported');

            // Get platform
            let platform = scene.getMeshByName('n1b14');

            // Load input
            let xr = await scene.createDefaultXRExperienceAsync({ floorMeshes: [platform] });
            new XRInputs(scene, camera, cavnas, xr, inputs);
            Game.hapticManager = new HapticManager(xr);
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

        // Load platform
        // FIXME : Changer pour chargé l'objet unique
        let platformTask = this._assetManager.addMeshTask('scene', '', './assets/', 'scene.glb');

        let testTask = this._assetManager.addMeshTask('robot', '', './assets/', 'robot.glb');

        platformTask.onSuccess = (task) => {
            task.loadedMeshes.forEach((mesh) => {
                if (mesh.name.includes("HitBox")) {
                    mesh.visibility = 0;
                }
            });

            task.loadedAnimationGroups.forEach((animationGroup) => {
                console.log(animationGroup.name);
                animationGroup.loopAnimation = true;
                animationGroup.start();
                animationGroup.speedRatio = 0.1;
            });
        };

        testTask.onSuccess = (task) => {
            task.loadedMeshes.forEach((mesh) => {
                console.log(mesh.name);
                if (mesh.name == 'Robot') {
                    mesh.parent = null;
                }
            });
        };

        this._assetManager.load();

        this._scene.executeWhenReady(async () => {
            Logger.log('Scene is ready');

            Game.instanceLoader = new InstanceLoader(this._scene);
            
            this.configureMaterials(this._scene);
            // Set the camera's position to the spawn point's position plus the up vector
            this._spawnPoint = this._scene.getMeshByName('SpawnPoint');

            let upperLight = this._scene.getLightByName('UpperSun');
            let underLight = this._scene.getLightByName('DownSun');
            upperLight.intensity = 1;
            underLight.intensity = 1;

            let lightTest = new BABYLON.HemisphericLight('lightTest', new BABYLON.Vector3(0, 1, 0), this._scene);
            lightTest.direction = new BABYLON.Vector3(0, 1, 0);
            lightTest.intensity = 0.5;

            this._spawnPoint.visibility = 0;

            const upVector = new BABYLON.Vector3(0, 1, 0);
            this._camera.position = this._spawnPoint.absolutePosition.clone().add(upVector);
            console.log(this._camera.position);
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
