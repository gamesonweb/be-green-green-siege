import { Scene, Vector3 } from 'babylonjs';
import xrHandler from '../../XRHandler';
import { Game } from '../../game';
import { LaserGun } from '../../gun/laserGun';
import { Laser } from '../../projectile/laser';
import { TutoHotTarget } from '../../target/tutoHotTarget';
import TutoUI from '../../ui/tutoUI';
import { State } from '../state';
import { StateManager, StatesEnum } from '../stateManager';
import dialog from '../../ui/dialog';

export default class Tutorial2 implements State {
    private _scene: Scene;

    // Level properties
    public type: StatesEnum;
    public levelNumber: number;
    private _success: boolean;
    private _stateManager: StateManager;

    // Shield
    public shieldSize: number;

    // Gun
    private _gun: LaserGun;

    // UI
    private _tutorialUI: TutoUI;

    // Targets
    private _target: TutoHotTarget;

    /**
     * Constructor
     * @param scene The scene
     * @param type The state type
     * @param stateManager The state manager
     */
    public constructor(scene: Scene, type: StatesEnum, stateManager: StateManager) {
        this._scene = scene;
        this.type = type;
        this._stateManager = stateManager;
        this._tutorialUI = new TutoUI(this._scene, this._scene.activeCamera, this._stateManager);
        this.levelNumber = 2;
    }

    /**
     * Check if the tutorial is finished
     */
    public checkTutorialStatus(): void {
        if (this._gun.isOverheated()) {
            this._success = true;
            this._tutorialUI.flashNextButton();
        }
    }

    /**
     * Load the tutorial
     */
    public load(): void {
        this._success = false;

        const text = dialog.getTuto("tuto2");

        this._tutorialUI.load(text, this.levelNumber);
        this._gun = new LaserGun(this._scene, new Laser(this._scene));
        Game.player.resetLife();
        this._gun.heatPerShot = 5;

        // Targets
        this._target = new TutoHotTarget(this._scene, new Vector3(19, 4, -50));

        xrHandler.setControllerVisibility(true, 'left');
        xrHandler.setControllerVisibility(false, 'right');
    }

    /**
     * Dispose the tutorial
     */
    public dispose(): void {
        this._gun.dispose();
        this._tutorialUI.dispose();
        this._target.dispose();
    }

    /**
     * Get the name of the tutorial
     * @returns The name of the tutorial
     */
    public getName(): String {
        return 'Tutorial 2';
    }

    /**
     * Fire the gun
     * @param force The force of the shot
     */
    public fire(force: number): void {
        this._gun.fire(force);
    }

    /**
     * Animate the tutorial
     * @param deltaTime The delta time
     */
    public animate(deltaTime: number): void {
        this._gun.animate(deltaTime);

        if (!this._success) {
            this.checkTutorialStatus();
        }

        this._target.animate(deltaTime);
    }

    /**
     * Pause the tutorial
     */
    public pause() {}

    /**
     * Resume the tutorial
     */
    public resume() {}
}
