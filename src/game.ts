import * as BABYLON from 'babylonjs';
import DebugConsole from './debug/DebugConsole';
import Logger from './debug/Logger';
import Inputs from './inputs/Inputs';
import KeyboardInputs from './inputs/KeyboardInputs';
import XRInputs from './inputs/XRInputs';
import { StateManager, StatesEnum } from './states/stateManager';
import { GameUtils } from './game-utils';


export class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;

    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _inputs: Inputs;

    public static debug: DebugConsole;

    private _assetManager: BABYLON.AssetsManager;
    private _spawnPoint: BABYLON.AbstractMesh;
    private _stateManager: StateManager;

    constructor(canvasElement: string) {
        this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
    }

    createBasicScene(): BABYLON.Scene {
        const scene = new BABYLON.Scene(this._engine);
        const glowLayeer = new BABYLON.GlowLayer('glow', this._scene);
        glowLayeer.intensity = 0.3;
        return scene;
    }

    createFreeCamera(scene: BABYLON.Scene): BABYLON.FreeCamera {
        const camera = new BABYLON.FreeCamera('Camera', BABYLON.Vector3.Zero(), scene);
        camera.attachControl(this._canvas, true);
        camera.inertia = 0;
        camera.angularSensibility = 1000;
        return camera;
    }

    async createInput(scene: BABYLON.Scene) {
        let VrSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-ar');

        if (VrSupported) {
            Logger.log('VR supported');

            // Get platform
            let platform = this._scene.getMeshByName('Platform');

            // Load input
            let xr = await this._scene.createDefaultXRExperienceAsync({ floorMeshes: [platform] });
            new XRInputs(this._scene, this._camera, this._canvas, xr, this._inputs);

        } else {
            Logger.log('VR not supported');

            // Load input
            new KeyboardInputs(this._scene, this._camera, this._canvas, this._inputs);
        }
    }

    /**

     * Creates the BABYLONJS Scene
     */
    async createScene(): Promise<void> {
        this._scene = this.createBasicScene();
        this._camera = this.createFreeCamera(this._scene);
        this._assetManager = new BABYLON.AssetsManager(this._scene);

        Game.debug = new DebugConsole(this, this._scene, this._camera, this._canvas);

        this._inputs = new Inputs(this, this._scene, this._camera, this._canvas);
        Game.debug = new DebugConsole(this, this._scene, this._camera, this._canvas);

        // create the skybox
        let skybox = GameUtils.createSkybox(    
            'skybox',
            './assets/texture/skybox/TropicalSunnyDay',
            this._scene
        );

        // let meshTask = this._assetManager.addMeshTask(
        //     'test',
        //     '',
        //     './assets/',
        //     'test.glb'
        // );
        // let meshTask2 = this._assetManager.addMeshTask('test', '', './assets/', 'robotAnimated.glb')

        // meshTask.onSuccess = (task) => {
        //     console.log('Loading mesh');

        //     task.loadedMeshes.forEach((mesh) => {
        //         console.log(mesh.name);
        //     });
        // };
        // meshTask2.onSuccess = (task) => {
        //     console.log('Loading mesh');
        //     task.loadedAnimationGroups.forEach((anim) => {
        //         console.log(anim.name);
        //     });
            
        //     let leftLaserShot = task.loadedAnimationGroups[0];
        //     let leftLaserShot2 = task.loadedAnimationGroups[1];
        //     let rightLaserShot = task.loadedAnimationGroups[2];
        //     let rightLaserShot2 = task.loadedAnimationGroups[3];

        //     rightLaserShot.stop();
        //     leftLaserShot.stop();
        //     rightLaserShot2.stop();
        //     leftLaserShot2.stop();

        //     rightLaserShot.reset();
        //     leftLaserShot.reset();
        //     rightLaserShot2.reset();
        //     leftLaserShot2.reset();

        //     rightLaserShot.play(true);
        //     leftLaserShot.play(true);
        //     // rightLaserShot2.play(true);
        //     // leftLaserShot2.play(true);
            
        //     // voir doc on peut les stop les resets loops etc.
        // };

        // Load platform
        this._assetManager.addMeshTask('platform', '', './assets/', 'platform.glb');
        this._assetManager.load();

        this._scene.executeWhenReady(async () => {
            Logger.log('Scene is ready');

            let supported =
                await BABYLON.WebXRSessionManager.IsSessionSupportedAsync(
                    'immersive-ar'
                );
            // let robot = this._scene.getMeshByName('Robot');
            
            let platform = this._scene.getMeshByName('Platform');
            // robot.position = new BABYLON.Vector3(10, 5, 10);
            this._spawnPoint = this._scene.getMeshByName('SpawnPoint');

            // Update camera position
            this._camera.position = this._spawnPoint.position.clone();

            // Load input
            this.createInput(this._scene);

            this._stateManager = new StateManager(this._scene, this._assetManager);
            this._stateManager.switchState(StatesEnum.MAINMENU);

            //
            let axes = new BABYLON.AxesViewer(this._scene, 10);
            //
        });
    }

    /**
     * Starts the animation loop.
     */
    animate(): void {
        this._scene.registerBeforeRender(() => {
            let deltaTime: number = 1 / this._engine.getFps();
            Game.debug.fps.innerHTML = 'FPS: ' + this._engine.getFps().toFixed();
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
