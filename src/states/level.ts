import * as BABYLON from 'babylonjs';
import { Zone } from '../enemy/zone';
import { LaserGun } from '../gun/laserGun';
import { Player } from '../player/player';
import { Laser } from '../projectile/laser';
import { Shield } from '../shield/shield';
import { State } from './state';

import level1 from '../assets/levels/level1.json';

export default class Level implements State {
    private _scene: BABYLON.Scene;
    private _level: any;

    private _player: Player;

    private _gun: any;
    private _shield: Shield;
    private _zones: Zone[];

    private currentScore: number;
    private currentWave: number;

    private _win: boolean;
    private _lose: boolean;

    shieldSize: number;

    constructor(scene: BABYLON.Scene, levelNumber: number) {
        this._scene = scene;
        this._level = this.getLevelByNumber(levelNumber);
        this.shieldSize = 0;
    }

    private getLevelByNumber(levelNumber: number): any {
        switch (levelNumber) {
            case 1:
                return level1;
            default:
                throw new Error('Level not found');
        }
    }

    private updateLevel(deltaTime: number): void {
        if (this._player.getCurrentLife() <= 0) {
            this._lose = true;
            return;
        }
        let finishedZones = [];
        for (let zone of this._zones) {
            zone.currentCoolDown += deltaTime;
            // console.log(zone.tresholdEnemy);

            if (zone.currentCoolDown >= zone.cooldown && zone.nbRobots > 0 && zone.getNbEnemies() < zone.tresholdEnemy) {
                // console.log("NEW ENEMY");

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
                return;
            }
            this.beginWave();
        }
    }

    private beginWave(): void {
        for (let zone of this._level.waves[this.currentWave].zones) {
            let minVec = new BABYLON.Vector3(zone.min.x, zone.min.y, zone.min.z);
            let maxVec = new BABYLON.Vector3(zone.max.x, zone.max.y, zone.max.z);

            let spawnPoints = zone.spawnPoints.map((name) => this._scene.getMeshByName(name).position);

            this._zones.push(new Zone(minVec, maxVec, spawnPoints, this._scene, zone.nbRobots, zone.robotCaracteristics, zone.cooldown, zone.tresholdEnemy));
        }
    }

    public fire(force: number): void {
        this._gun.fire(force);
    }

    public getName() {
        return this._level.name;
    }

    public load(): void {
        if (this._level === undefined) throw new Error('Level data not loaded');

        this._gun = new LaserGun(this._scene, new Laser(this._scene));
        this._shield = new Shield(this._scene);
        this._zones = [];
        this._player = new Player(this._scene);
        this.currentScore = 0;
        this.currentWave = 0;

        this.beginWave();
    }

    public dispose(): void {
        this._gun.dispose();
        this._shield.dispose();
        for (let zone of this._zones) {
            zone.dispose();
        }
    }

    // This function is called at each image rendering
    // You must use this function to animate all the things in this level
    public animate(deltaTime: number): void {
        this._gun.animate(deltaTime);
        this._shield.animate(deltaTime, this.shieldSize);
        if (this._lose) {
            console.log('LOSE');
            return;
        }
        if (this._win) {
            console.log('WIN');
            return;
        }
        for (let zone of this._zones) {
            zone.animate(deltaTime);
        }
        this.updateLevel(deltaTime);
    }
}
