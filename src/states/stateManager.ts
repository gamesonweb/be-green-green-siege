import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import Level from './level';
import { LevelTestGunState } from './levelTest';
import { MainMenuState } from './mainMenuState';
import { State } from './state';

export enum StatesEnum {
    MAINMENU,
    LEVELTEST,
    LEVEL,
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
    public switchState(state: StatesEnum, levelNumber: number = undefined): void {
        // Dispose the current state
        if (this._currentState) {
            this._currentState.dispose();
        }

        // Switch to the new state
        switch (state) {
            case StatesEnum.MAINMENU:
                this._currentState = new MainMenuState(this._scene, this, StatesEnum.MAINMENU);
                break;
            case StatesEnum.LEVELTEST:
                this._currentState = new LevelTestGunState(this._scene, StatesEnum.LEVELTEST);
                break;
            case StatesEnum.LEVEL:
                this._currentState = new Level(this._scene, levelNumber, StatesEnum.LEVEL, this);
                break;
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
