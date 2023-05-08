import { Scene, Vector3 } from 'babylonjs';
import xrHandler from '../../XRHandler';
import { Enemy } from '../../enemy/Enemy';
import { Commando } from '../../enemy/commando';
import { Zone } from '../../enemy/zone';
import { Game } from '../../game';
import { Shield } from '../../shield/shield';
import TutoUI from '../../ui/tutoUI';
import { State } from '../state';
import { StateManager, StatesEnum } from '../stateManager';

export default class Tutorial5 implements State {
    private _scene: Scene;

    // Level properties
    public type: StatesEnum;
    public levelNumber: number;
    private _success: boolean;
    private _stateManager: StateManager;

    // Shield
    public shieldSize: number;

    // Shield
    private _shield: Shield;

    // UI
    private _tutorialUI: TutoUI;

    // Timer
    private _timer: number;
    private _timerMax: number;

    // Enemies
    private _zone: Zone;
    private _numberOfEnemies: number;

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
        this.levelNumber = 5;

        this._shield = new Shield(this._scene);
        this.shieldSize = 0;

        this._timer = 0;
        this._timerMax = 1;

        this._numberOfEnemies = 1;
    }

    /**
     * Check if the tutorial is finished
     */
    public checkTutorialStatus(): void {
        if (this._shield.getLife() <= 80) {
            this._success = true;
            this._tutorialUI.flashNextButton();
        }
    }

    /**
     * Load the tutorial
     */
    public load(): void {
        this._success = false;

        const text = `Vous avez un bouclier en plus dans la main.
        Utilisez-le pour vous protéger des tirs ennemis, mais gardez à l'esprit que le bouclier a une durée de vie limitée. Si le bouclier se brise, il faudra quelques secondes pour qu'il se recharge.
        
        Bonne chance dans votre mission de défense de l'île !`;

        this._tutorialUI.load(text, this.levelNumber);
        Game.player.resetLife();

        this.shieldSize = 0;

        xrHandler.setControllerVisibility(false, 'left');
        xrHandler.setControllerVisibility(true, 'right');

        const caracteristics = {
            shotFreq: 8,
            bulletFreq: 1,
            nbBullet: 3,
            bulletSpeed: 20,
            speed: 4,
            life: 3,
            score: 0,
            bias: 0,
        };

        const spawnPointsNames = ['Spawn2', 'Spawn3', 'Spawn4', 'Spawn5', 'Spawn6'];
        const spawnPoints = spawnPointsNames.map((name) => this._scene.getMeshByName(name).getAbsolutePosition());

        this._zone = new Zone(
            new Vector3(10, 4, -55),
            new Vector3(30, 15, -35),
            spawnPoints,
            this._scene,
            this._numberOfEnemies,
            caracteristics,
            0,
            0
        );
        this._zone.instantiate(this._numberOfEnemies);
    }

    /**
     * Dispose the tutorial
     */
    public dispose(): void {
        this._shield.dispose();
        this._tutorialUI.dispose();
        this._zone.dispose();
    }

    /**
     * Get the name of the tutorial
     * @returns The name of the tutorial
     */
    public getName(): String {
        return 'Tutorial 5';
    }

    /**
     * Fire the gun
     * @param force The force of the shot
     */
    public fire(force: number): void {}

    /**
     * Animate the tutorial
     * @param deltaTime The delta time
     */
    public animate(deltaTime: number): void {
        this._shield.animate(deltaTime, this.shieldSize);
        this._zone.animate(deltaTime);

        if (!this._success) {
            this.checkTutorialStatus();
        }

        // Change the destination of the enemies
        this._timer += deltaTime;
        if (this._timer > this._timerMax) {
            this._timer = 0;
            this._zone.getCommandos().forEach((commando: Commando) => {
                const destination = this._zone.getRandomPoint();
                commando.getEnemies().forEach((enemy: Enemy) => {
                    enemy.setDestination(destination);
                });
            });
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
