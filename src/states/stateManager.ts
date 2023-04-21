import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { LevelTestBotState } from './levelTestBotState';
import { LevelTestGunState } from './levelTestGunState';
import { LevelTestEmpty } from './levelTestempty';
import { MainMenuState } from './mainMenuState';
import { State } from './state';

export enum StatesEnum {
    MAINMENU = 0,
    LEVELTESTBOT = 1,
    LEVELTESTGUN = 2,
    EMPTY = 3,
}

export class StateManager {
    private _scene: BABYLON.Scene;
    private _currentState: State;

    constructor(scene: BABYLON.Scene) {
        this._scene = scene;
    }

    /**
     * Switch the current state
     * @param state The state to switch to
     */
    public switchState(state: StatesEnum): void {
        // Dispose the current state
        if (this._currentState) {
            this._currentState.dispose();
        }

        // Switch to the new state
        switch (state) {
            case StatesEnum.MAINMENU:
                this._currentState = new MainMenuState(this._scene, this);
                break;
            case StatesEnum.LEVELTESTBOT:
                this._currentState = new LevelTestBotState(this._scene);
                break;
            case StatesEnum.LEVELTESTGUN:
                this._currentState = new LevelTestGunState(this._scene);
                break;
            case StatesEnum.EMPTY:
                this._currentState = new LevelTestEmpty(this._scene);
        }

        // Update the debug panel
        Game.debug.currentstate.innerHTML = 'Current state: ' + this._currentState.getName();
        this._currentState.load();
    }

    /**
     * Get the current state
     * @returns The current state
     */
    public getCurrentState(): State {
        return this._currentState;
    }
}
