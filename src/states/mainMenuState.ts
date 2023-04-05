import * as BABYLON from 'babylonjs';
import { StateManager, StatesEnum } from './stateManager';

export class MainMenuState {
    private _scene: BABYLON.Scene;
    private _stateManager: StateManager;
    private _light: BABYLON.HemisphericLight;
    private _level1Selector: BABYLON.Mesh;

    constructor(scene: BABYLON.Scene, stateManager: StateManager) {
        this._scene = scene;
        this._stateManager = stateManager;
    }

    public getName() {
        return 'Main Menu';
    }

    public load(): void {
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this._scene);

        // Create a cube
        this._level1Selector = BABYLON.MeshBuilder.CreateBox('box', {}, this._scene);
        this._level1Selector.position = new BABYLON.Vector3(3, 3, 3);

        // if click on the cube, switch to level 1
        this._level1Selector.actionManager = new BABYLON.ActionManager(this._scene);
        this._level1Selector.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                this._stateManager.switchState(StatesEnum.LEVEL1);
            })
        );
    }

    public dispose(): void {
        // dispose the light
        this._light.dispose();

        // dispose the cube
        this._level1Selector.dispose();
    }
}
