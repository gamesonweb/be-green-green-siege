import * as BABYLON from 'babylonjs';
import { StateManager, StatesEnum } from './stateManager';

export class MainMenuState {
    private _scene: BABYLON.Scene;
    private _stateManager: StateManager;
    private _light: BABYLON.HemisphericLight;

    private _levelTestBotSelector: BABYLON.Mesh;
    private _levelTestGunSelector: BABYLON.Mesh;

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

        this._levelTestBotSelector = this.createLevel(new BABYLON.Vector3(0, 2, 6), StatesEnum.LEVELTESTBOT);
        this._levelTestGunSelector = this.createLevel(new BABYLON.Vector3(2, 2, 6), StatesEnum.LEVELTESTGUN);
    }

    public dispose(): void {
        // dispose the light
        this._light.dispose();

        // dispose the cube
        this._levelTestBotSelector.dispose();
        this._levelTestGunSelector.dispose();
    }

    private createLevel(position: BABYLON.Vector3, levelenum: StatesEnum): BABYLON.Mesh {
        const box = BABYLON.MeshBuilder.CreateBox('box', {}, this._scene);
        box.position = position;

        // if click on the cube, switch to level test boat
        box.actionManager = new BABYLON.ActionManager(this._scene);
        box.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                this._stateManager.switchState(levelenum);
            })
        );

        return box;
    }
}
