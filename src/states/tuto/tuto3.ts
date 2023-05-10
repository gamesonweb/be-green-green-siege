import { Scene, Vector3 } from 'babylonjs';
import xrHandler from '../../XRHandler';
import { Enemy } from '../../enemy/Enemy';
import { Commando } from '../../enemy/commando';
import { Zone } from '../../enemy/zone';
import { Game } from '../../game';
import { LaserGun } from '../../gun/laserGun';
import { Laser } from '../../projectile/laser';
import TutoUI from '../../ui/tutoUI';
import { State } from '../state';
import { StateManager, StatesEnum } from '../stateManager';
import dialog from '../../ui/dialog';

export default class Tutorial3 implements State {
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
        this.levelNumber = 3;

        this._timer = 0;
        this._timerMax = 3;

        this._numberOfEnemies = 4;
    }

    /**
     * Check if the tutorial is finished
     */
    public checkTutorialStatus(): void {
        if (this._zone.getNbEnemies() === 0) {
            this._success = true;
            this._tutorialUI.flashNextButton();
        }
    }

    /**
     * Load the tutorial
     */
    public load(): void {
        this._success = false;

        const text = dialog.getTuto("tuto3");

        this._tutorialUI.load(text, this.levelNumber);
        this._gun = new LaserGun(this._scene, new Laser(this._scene));
        Game.player.resetLife();
        this._gun.heatPerShot = 5;

        xrHandler.setControllerVisibility(true, 'left');
        xrHandler.setControllerVisibility(false, 'right');

        const caracteristics = {
            shotFreq: 0,
            bulletFreq: 0,
            nbBullet: 0,
            bulletSpeed: 0,
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
        this._gun.dispose();
        this._tutorialUI.dispose();
        this._zone.dispose();
    }

    /**
     * Get the name of the tutorial
     * @returns The name of the tutorial
     */
    public getName(): String {
        return 'Tutorial 3';
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
