import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import Level from './level';
import { LevelTestGunState } from './levelTest';
import { LobyState } from './lobyState';
import { MainMenuState } from './mainMenuState';
import { NoVrState } from './noVrState';
import { State } from './state';
import Tutorial1 from './tuto/tuto1';
import Tutorial2 from './tuto/tuto2';
import Tutorial3 from './tuto/tuto3';
import Tutorial4 from './tuto/tuto4';
import Tutorial5 from './tuto/tuto5';
import Tutorial6 from './tuto/tuto6';
import { Credit } from './credit';
import { Controls } from './controls';

export enum StatesEnum {
    MAINMENU,
    LEVELTEST,
    LEVEL,
    TUTO1,
    TUTO2,
    TUTO3,
    TUTO4,
    TUTO5,
    TUTO6,
    NOVR,
    LOBY,
    CREDIT,
    CONTROLS
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
            case StatesEnum.TUTO1:
                this._currentState = new Tutorial1(this._scene, StatesEnum.TUTO1, this);
                break;
            case StatesEnum.TUTO2:
                this._currentState = new Tutorial2(this._scene, StatesEnum.TUTO2, this);
                break;
            case StatesEnum.TUTO3:
                this._currentState = new Tutorial3(this._scene, StatesEnum.TUTO3, this);
                break;
            case StatesEnum.TUTO4:
                this._currentState = new Tutorial4(this._scene, StatesEnum.TUTO4, this);
                break;
            case StatesEnum.TUTO5:
                this._currentState = new Tutorial5(this._scene, StatesEnum.TUTO5, this);
                break;
            case StatesEnum.TUTO6:
                this._currentState = new Tutorial6(this._scene, StatesEnum.TUTO6, this);
                break;
            case StatesEnum.NOVR:
                this._currentState = new NoVrState(this._scene, this, StatesEnum.NOVR);
                break;
            case StatesEnum.LOBY:
                this._currentState = new LobyState(this._scene, this, StatesEnum.LOBY);
                break;
            case StatesEnum.CREDIT:
                this._currentState = new Credit(this._scene, this, StatesEnum.CREDIT);
                break;
            case StatesEnum.CONTROLS:
                this._currentState = new Controls(this._scene, this, StatesEnum.CONTROLS);
                break;
            default:
                console.error('State not found');
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
