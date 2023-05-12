import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { SoundPlayer } from '../sounds/soundPlayer';
import { SoundsBank } from '../sounds/soundsBank';
import LobyUI from '../ui/lobyUI';
import { State } from './state';
import { StateManager, StatesEnum } from './stateManager';

export class LobyState implements State {
    private _scene: BABYLON.Scene;
    private _stateManager: StateManager;

    private _mainUI: LobyUI;

    public type: StatesEnum;
    levelNumber: number;
    shieldDeploymentPercentage: number;

    constructor(scene: BABYLON.Scene, stateManager: StateManager, type: StatesEnum) {
        this._scene = scene;
        this._stateManager = stateManager;
        this.type = type;
        this._mainUI = new LobyUI(this._scene, this._scene.activeCamera, this._stateManager);
    }

    public canbePaused(): boolean {
        return false;
    }

    fire(force: number): void {}

    public getName() {
        return 'Loby';
    }

    public load(): void {
        this._mainUI.load();

        // Music
        Game.music_green_siege = new SoundPlayer(SoundsBank.MUSIC_GREEN_SIEGE, this._scene);
        Game.music_green_siege.setPosition(Game.player.getBodyPosition());
        Game.music_green_siege.setAutoplay(true);
        Game.music_green_siege.setLoop(true);
    }

    public dispose(): void {
        this._mainUI.dispose();
    }

    public animate(deltaTime: number): void {}

    public pause() {
        throw new Error('Method pause not implemented !');
    }

    public resume() {
        throw new Error('Method pause not implemented !');
    }
}
