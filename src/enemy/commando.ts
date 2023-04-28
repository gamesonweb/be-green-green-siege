import * as BABYLON from 'babylonjs';
import { Enemy } from './Enemy';
import { Zone } from './zone';

export class Commando {
    private _enemies: Enemy[];
    private _destination: BABYLON.Vector3;
    private _zone: Zone;

    constructor(nb: number, caracteristics: any, scene: BABYLON.Scene, zone: Zone, spawnPoint: BABYLON.Vector3) {
        this._enemies = [];
        this._zone = zone;
        this._destination = this._zone.getRandomPoint();
        for (let i = 0; i < nb; i++) {
            // add random on spawnPoint position to avoid all enemies to be at the same position (create bug on pathfinding)
            const spanwPointRandom = new BABYLON.Vector3(
                spawnPoint.x + BABYLON.Scalar.RandomRange(-1, 1),
                spawnPoint.y + BABYLON.Scalar.RandomRange(-1, 1),
                spawnPoint.z + BABYLON.Scalar.RandomRange(-1, 1)
            );
            let enemy = new Enemy(scene, spanwPointRandom, caracteristics);
            enemy.setDestination(this._destination);
            this._enemies.push(enemy);
        }
    }

    public getEnemies(): Enemy[] {
        return this._enemies;
    }

    public removeEnemy(enemy: Enemy) {
        this._enemies.splice(this._enemies.indexOf(enemy), 1);
    }

    public animate(deltaTime: number, positions: BABYLON.Vector3[]) {
        this._enemies.forEach((enemy) => {
            enemy.animate(deltaTime, positions);
            // moove and share the same destination
            if (enemy.getDistanceFromDestination() < 10) {
                // Just for a test ... @todo: remove
                // enemy.takeDamage(1);
                // console.log("touch !");
                // this._destination.dispose();
                this._destination = this._zone.getRandomPoint();
                this._enemies.forEach((enemy) => {
                    enemy.setDestination(this._destination);
                });
            }
        });
    }
}
