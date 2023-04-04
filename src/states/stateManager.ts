import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { Level1State } from './level1State';
import { MainMenuState } from './mainMenuState';
import { State } from './state';

export enum StatesEnum {
    MAINMENU = 0,
    LEVEL1 = 1,
}

export class StateManager {
    private _scene: BABYLON.Scene;
    private _spawnPoint: BABYLON.AbstractMesh;

    private _currentState: State;

    constructor(scene: BABYLON.Scene, spawnPoint: BABYLON.AbstractMesh) {
        this._scene = scene;
        this._spawnPoint = spawnPoint;
    }

    public switchState(state: StatesEnum): void {
        if (this._currentState) {
            this._currentState.dispose();
        }

        switch (state) {
            case StatesEnum.MAINMENU:
                this._currentState = new MainMenuState(this._scene, this);
                break;
            case StatesEnum.LEVEL1:
                this._currentState = new Level1State(this._scene, this, this._spawnPoint);
                break;
        }

        Game.debug.currentstate.innerHTML = 'Current state: ' + this._currentState.getName();
        this._currentState.load();
    }
}
