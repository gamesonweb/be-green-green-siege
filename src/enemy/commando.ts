import * as BABYLON from 'babylonjs';
import { Movement } from '../movement/movement';
import { Zone } from './zone';
import { Enemy } from './enemy';

export class Commando {

    private _enemies: Enemy[];
    private _destination: BABYLON.Mesh;
    private _movement: Movement;

    constructor(size: number, scene: BABYLON.Scene, zone: Zone, pos: BABYLON.Vector3, movement: Movement, speed: number, destination: BABYLON.Mesh) {
        this._enemies = [];
        this._destination = destination;
        this._movement = movement;
        // this._enemies.push(leader);
        // setup each ennemies
        let space = 15;
        let lastPos: BABYLON.Vector3 = pos;
        for (let i = 0; i < size; i++) {
            let newPos = new BABYLON.Vector3(lastPos.x + space, lastPos.y + space, lastPos.z + space); //.addInPlace(enemy.mesh.position);
            this._enemies.push(new Enemy(scene, zone, newPos, movement, speed, destination));
            lastPos = newPos;
        }
    }

    public spawnEnemies(thresholdEnemy: number) {

    }

    public getEnemies(): Enemy[] {
        return this._enemies;
    }

    public removeEnemy(enemy: Enemy) {
        this._enemies.splice(this._enemies.indexOf(enemy), 1);
    }

    public animate(deltaTime: number, positions: BABYLON.Vector3[]) {
        this._enemies.forEach((enemy) => {
            enemy.animateWithoutMoove();
            // moove and share the same destination
            if (Math.abs(this._movement.moove(enemy, positions, this._destination.position, enemy.getSpeed(), deltaTime)) < 10) {
                // Just for a test ... @todo: remove
                enemy.takeDamage(1);
                // console.log("touch !");
                this._destination.dispose();
                this._destination = enemy.zone.getRandomPoint();
            }
        });
    }
}
