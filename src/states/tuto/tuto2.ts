import { Scene, Vector3 } from 'babylonjs';
import xrHandler from '../../XRHandler';
import { Game } from '../../game';
import { LaserGun } from '../../gun/laserGun';
import { Player } from '../../player/player';
import { Laser } from '../../projectile/laser';
import { TutoHotTarget } from '../../target/tutoHotTarget';
import TutoUI from '../../ui/tutoUI';
import { State } from '../state';
import { StateManager, StatesEnum } from '../stateManager';

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
    private _gun: any;

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
        this.levelNumber = 1;
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

        const text = `Face à vous se trouve une cible verte.
        Maintenez le bouton de tir enfoncé pour tirer rapidement dessus, mais attention à ne pas trop tirer d'affilée, car votre arme va surchauffer et se bloquer temporairement pour se refroidir.
        
        Apprendre à maîtriser la surchauffe de votre arme est crucial.
        Soyez stratégique dans vos tirs pour éviter de la faire surchauffer et optimiser son potentiel`;

        this._tutorialUI.load(text, this.levelNumber);
        this._gun = new LaserGun(this._scene, new Laser(this._scene));
        Game.player = new Player(this._scene);
        this._gun.heatPerShot = 5;

        // Targets
        this._target = new TutoHotTarget(this._scene, new Vector3(19, 4, -50));

        xrHandler.setControllerVisibility(false, 'left');
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
        return 'Tutorial 1';
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
