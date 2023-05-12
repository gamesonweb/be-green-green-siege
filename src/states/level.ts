import * as BABYLON from 'babylonjs';
import { Zone } from '../enemy/zone';
import { LaserGun } from '../gun/laserGun';
import { Laser } from '../projectile/laser';
import { Shield } from '../shield/shield';
import { State } from './state';

import score from '../Score';
import timeControl from '../TimeControl';
import xrHandler from '../XRHandler';
import level1 from '../assets/levels/level1.json';
import level2 from '../assets/levels/level2.json';
import level3 from '../assets/levels/level3.json';
import level4 from '../assets/levels/level4.json';
import level5 from '../assets/levels/level5.json';
import level6 from '../assets/levels/level6.json';
import { Game } from '../game';
import { SoundPlayer } from '../sounds/soundPlayer';
import { SoundsBank } from '../sounds/soundsBank';
import PlayerUI from '../ui/playerUI';
import StateUI, { StateUIEnum } from '../ui/stateUI';
import { StateManager, StatesEnum } from './stateManager';

export default class Level implements State {
    private _scene: BABYLON.Scene;
    private _level: any;

    private _gun: LaserGun;
    private _shield: Shield;
    private _zones: Zone[];

    private currentWave: number;

    private _win: boolean;
    private _lose: boolean;

    private _paused: boolean;

    private _stateUI: StateUI;

    private _stateManager: StateManager;

    private _music_level: SoundPlayer;

    private _playerUI: PlayerUI;

    private _previousScore: number;
    private _previousLife: number;
    private _previousLifeShield: number;

    shieldDeploymentPercentage: number;
    type: StatesEnum;
    levelNumber: number;

    constructor(scene: BABYLON.Scene, levelNumber: number, type: StatesEnum, stateManager: StateManager) {
        this._scene = scene;
        this._level = this.getLevelByNumber(levelNumber);
        this.levelNumber = levelNumber;
        this.type = type;
        this._stateManager = stateManager;
        this._stateUI = new StateUI(this._scene, this._scene.activeCamera, this._stateManager);
        this._playerUI = new PlayerUI(this._scene);
        this.shieldDeploymentPercentage = 0;
        Game.music_green_siege.pause();
        this._music_level = new SoundPlayer(SoundsBank.MUSIC_LEVEL, this._scene);
        this._music_level.setPosition(Game.player.getBodyPosition());
        this._music_level.setAutoplay(true);
        this._music_level.setLoop(true);
    }

    canbePaused(): boolean {
        return !this._win && !this._lose;
    }

    private getLevelByNumber(levelNumber: number): any {
        switch (levelNumber) {
            case 1:
                return level1;
            case 2:
                return level2;
            case 3:
                return level3;
            case 4:
                return level4;
            case 5:
                return level5;
            case 6:
                return level6;
            default:
                throw new Error('Level ' + levelNumber + ' not found');
        }
    }

    private updateLevel(deltaTime: number): void {
        if (this._paused || this._win || this._lose) return;

        if (Game.player.getCurrentLife() <= 0) {
            this._lose = true;
            Game.debug3D.log = 'LOSE';
            timeControl.pause();
            this._stateUI.load(StateUIEnum.LOSE, this.levelNumber);
            return;
        }
        let finishedZones = [];
        for (let zone of this._zones) {
            zone.currentCoolDown += deltaTime;

            if (
                zone.currentCoolDown >= zone.cooldown &&
                zone.nbRobots > 0 &&
                zone.getNbEnemies() < zone.tresholdEnemy
            ) {
                zone.currentCoolDown = 0;
                let nbRobots = Math.min(zone.nbRobots, zone.tresholdEnemy - zone.getNbEnemies());
                zone.nbRobots -= nbRobots;
                zone.instantiate(nbRobots);
            } else if (zone.nbRobots <= 0 && zone.getNbEnemies() <= 0) {
                finishedZones.push(zone);
            }
        }

        this._zones = this._zones.filter((zone) => !finishedZones.includes(zone));

        if (this._zones.length === 0) {
            this.currentWave++;
            if (this.currentWave >= this._level.waves.length) {
                this._win = true;
                score.saveTopScore(this.levelNumber);
                Game.debug3D.log = 'WIN';
                timeControl.pause();
                this._stateUI.load(StateUIEnum.WIN, this.levelNumber);
                return;
            }
            this.beginWave();
        }
    }

    private updatePlayerUI(): void {
        let update = false;

        let newScore = score.getCurrentScore();
        if (newScore !== this._previousScore) {
            this._playerUI.updateScore(newScore);
            this._previousScore = newScore;
            update = true;
        }
        let newLife = Game.player.getCurrentLife();
        if (newLife !== this._previousLife) {
            this._playerUI.updateLife(newLife);
            this._previousLife = newLife;
            update = true;
        }
        let newLifeShield = this._shield.getLife();
        if (newLifeShield !== this._previousLifeShield) {
            this._playerUI.updateShieldLife(newLifeShield);
            this._previousLifeShield = newLifeShield;
            update = true;
        }

        if (update) {
            this._playerUI.updateText();
        }
    }

    private beginWave(): void {
        for (let zone of this._level.waves[this.currentWave].zones) {
            let minVec = new BABYLON.Vector3(zone.min.x, zone.min.y, zone.min.z);
            let maxVec = new BABYLON.Vector3(zone.max.x, zone.max.y, zone.max.z);

            let spawnPoints = zone.spawnPoints.map((name) => this._scene.getMeshByName(name).getAbsolutePosition());

            this._zones.push(
                new Zone(
                    minVec,
                    maxVec,
                    spawnPoints,
                    this._scene,
                    zone.nbRobots,
                    zone.robotCaracteristics,
                    zone.cooldown,
                    zone.tresholdEnemy
                )
            );
        }
    }

    public fire(force: number): void {
        this._gun.fire(force);
    }

    public getName() {
        return this._level.name;
    }

    public load(): void {
        score.reset();
        if (this._level === undefined) throw new Error('Level data not loaded');

        if (Game.vrSupported) {
            xrHandler.setControllerVisibility(false);
        }

        this._paused = false;
        this._gun = new LaserGun(this._scene, new Laser(this._scene));
        this._shield = new Shield(this._scene);
        this._zones = [];
        Game.player.resetLife();
        this.currentWave = 0;
        this._playerUI.load();

        this.beginWave();
    }

    public dispose(): void {
        this._gun.dispose();
        this._shield.dispose();
        this._stateUI.dispose();
        this._music_level.stopAndDispose();
        for (let zone of this._zones) {
            zone.dispose();
        }
        this._playerUI.dispose();
    }

    // This function is called at each image rendering
    // You must use this function to animate all the things in this level
    public animate(deltaTime: number): void {
        this._gun.animate(deltaTime);
        this._shield.animate(deltaTime, this.shieldDeploymentPercentage);
        Game.sounds.forEach((sound) => {
            sound.setPitch(timeControl.getTimeScale());
        });
        for (let zone of this._zones) {
            zone.animate(deltaTime);
        }
        this.updatePlayerUI();
        this.updateLevel(deltaTime);
    }

    public pause() {
        this._paused = true;
        this._stateUI.load(StateUIEnum.PAUSE, this.levelNumber);
    }

    public resume() {
        this._paused = false;
        this._stateUI.dispose();
    }
}
