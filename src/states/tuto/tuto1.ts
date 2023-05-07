import { Scene, Vector3 } from 'babylonjs';
import xrHandler from '../../XRHandler';
import { Game } from '../../game';
import { LaserGun } from '../../gun/laserGun';
import { Player } from '../../player/player';
import { Laser } from '../../projectile/laser';
import { TutoTarget } from '../../target/tutoTarget';
import TutoUI from '../../ui/tutoUI';
import { State } from '../state';
import { StateManager, StatesEnum } from '../stateManager';

export default class Tutorial1 implements State {
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
    private _targets: TutoTarget[] = [];

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
        if (this._targets.map((target) => target.isTouched).every((isTouched) => isTouched)) {
            this._success = true;
            this._tutorialUI.flashNextButton();
        }
    }

    /**
     * Load the tutorial
     */
    public load(): void {
        this._success = false;

        const text = `Bienvenue dans Green Siege !

        Dans ce tutoriel, vous allez apprendre à utiliser votre arme pour tirer sur les ennemis qui approchent.
        Utilisez le bouton "trigger" à l'arrière de votre manette Oculus Touch pour tirer sur les cibles devant vous.
        
        Votre objectif est de défendre votre île contre les robots envahisseurs, alors soyez prêt à les affronter à tout moment.
        Bonne chance !`;

        this._tutorialUI.load(text, this.levelNumber);
        this._gun = new LaserGun(this._scene, new Laser(this._scene));
        Game.player = new Player(this._scene);
        this._gun.heatPerShot = 0; // No heat

        // Targets
        this._targets.push(new TutoTarget(this._scene, new Vector3(24, 4, -50)));
        this._targets.push(new TutoTarget(this._scene, new Vector3(19, 8, -45)));
        this._targets.push(new TutoTarget(this._scene, new Vector3(10, 3, -49)));

        xrHandler.setControllerVisibility(false, 'left');
        xrHandler.setControllerVisibility(true, 'right');
    }

    /**
     * Dispose the tutorial
     */
    public dispose(): void {
        this._gun.dispose();
        this._tutorialUI.dispose();
        this._targets.forEach((target) => target.dispose());
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
