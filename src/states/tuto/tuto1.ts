import { Scene } from 'babylonjs';
import { Game } from '../../game';
import { LaserGun } from '../../gun/laserGun';
import { Player } from '../../player/player';
import { Laser } from '../../projectile/laser';
import TutoUI from '../../ui/tutoUI';
import { State } from '../state';
import { StateManager, StatesEnum } from '../stateManager';

export default class Tutorial1 implements State {
    shieldSize: number;
    type: StatesEnum;
    levelNumber: number;
    private _paused: boolean;
    private _gun: any;
    private _scene: Scene;
    private _stateManager: StateManager;
    private _tutorialUI: TutoUI;

    private _success: boolean;

    private readonly TUTORIAL_NUMBER: number = 1;

    constructor(scene: Scene, type: StatesEnum, stateManager: StateManager) {
        this.type = type;
        this._scene = scene;
        this._stateManager = stateManager;
        this._tutorialUI = new TutoUI(this._scene, this._scene.activeCamera, this._stateManager);
    }

    checkTutorialStatus(): void {
        // return this.targets.length == 0;
        this._success = true;
        if (this._success) {
            // this._tutorialUI.loadNext(this.TUTORIAL_NUMBER);
        }
    }

    load(): void {
        this._tutorialUI.load('Tutorial 1: Test your gun', 1);

        this._paused = false;
        this._success = false;
        this._gun = new LaserGun(this._scene, new Laser(this._scene));

        // No heat
        this._gun.heatPerShot = 0;
        Game.player = new Player(this._scene);

        // this.targets = []; Target[] // TODO: Add targets
        // this.targets.push(new Target(position)); // on hit dispose target
    }

    dispose(): void {
        this._gun.dispose();
        this._tutorialUI.dispose();
    }

    getName(): String {
        return 'Tutorial 1';
    }

    fire(force: number): void {
        this._gun.fire(force);
    }

    animate(deltaTime: number): void {
        this._gun.animate(deltaTime);
        if (!this._success) {
            this.checkTutorialStatus();
        }
    }

    public pause() {
        console.log('pause');
    }

    public resume() {
        console.log('resume');
    }
}
