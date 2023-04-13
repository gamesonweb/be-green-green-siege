import * as BABYLON from 'babylonjs';
import { EnemiesSpace } from './enemies-space';
import { Movement } from '../movement/movement';
import { Enemy } from './enemy';

export class Commando {

    private _enemies: Enemy[];
    private _destination: BABYLON.Mesh;
    private _movement: Movement;

    constructor(size: number, scene: BABYLON.Scene, assetManager: BABYLON.AssetsManager, enemiesSpace: EnemiesSpace, pos: BABYLON.Vector3, movement: Movement, speed: number, destination: BABYLON.Mesh) {
        this._enemies = [];
        this._destination = destination;
        this._movement = movement;
        // this._enemies.push(leader);
        // setup each ennemies
        let space = 15;
        let lastPos: BABYLON.Vector3 = pos;
        for(let i=0; i<size; i++) {
            let newPos = new BABYLON.Vector3(
                lastPos.x + space,
                lastPos.y + space,
                lastPos.z + space
            );//.addInPlace(enemy.mesh.position);
            this._enemies.push(new Enemy(scene, assetManager, enemiesSpace, newPos, movement, speed, destination));
            lastPos = newPos;
        }
    }

    public getEnemies(): Enemy[] {
        return this._enemies;
    }

    public animate(deltaTime: number, positions: BABYLON.Vector3[]) {
        this._enemies.forEach((enemy) => {
            enemy.animateWithoutMoove();
            // moove and share the same destination
            if (Math.abs(this._movement.moove(enemy, positions, this._destination.position, enemy.speed, deltaTime)) < 10) {
                this._destination.dispose();
                this._destination = enemy.enemiesSpace.getRandomPoint();
            }
        });
    }
    
}
