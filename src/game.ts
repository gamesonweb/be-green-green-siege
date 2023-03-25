import { GameUtils } from './game-utils';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { FreeCamera, SceneLoader } from 'babylonjs';

export class Game {

    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _assetManager: BABYLON.AssetsManager;
    private _light: BABYLON.Light;


    constructor(canvasElement: string) {
        // Create canvas and engine
        this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
        
    }

    /**
     * Creates the BABYLONJS Scene
     */
    async createScene(): Promise<void> {
        // create a basic BJS Scene object
        this._scene = new BABYLON.Scene(this._engine);
        this._assetManager = new BABYLON.AssetsManager(this._scene);


        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        this._camera = new FreeCamera("Camera", new BABYLON.Vector3(0, 5, -10), this._scene);
        this._camera.attachControl(this._canvas, true);
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene);
        // create the skybox
        let skybox = GameUtils.createSkybox("skybox", "./assets/texture/skybox/TropicalSunnyDay", this._scene);
        // creates the sandy ground
        // let ground = GameUtils.createGround(this._scene);
        // // creates the watermaterial and adds the relevant nodes to the renderlist
        
        let meshTask = this._assetManager.addMeshTask("test", "", "./assets/", "test.glb");

        meshTask.onSuccess = (task) => {
            console.log("Loading mesh");
            
            task.loadedMeshes.forEach((mesh) => {
                console.log(mesh.name);
            });
        }
        this._assetManager.load();
        

        this._scene.executeWhenReady(async () => {
            console.log("Scene is ready");
            
            let supported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-ar');
            let platform = this._scene.getMeshByName("Platform");
            let spawnPoint = this._scene.getMeshByName("SpawnPoint");
            this._camera.position = spawnPoint.position.clone();
            
            if (supported) {
                console.log('supported');
                let xr = await this._scene.createDefaultXRExperienceAsync({
                    floorMeshes: [platform]
                });
            } else {
                console.log('not supported');
            }
        });
        
    }

    /**
     * Starts the animation loop.
     */
    animate(): void {
        this._scene.registerBeforeRender(() => {
            let deltaTime: number = (1 / this._engine.getFps());

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