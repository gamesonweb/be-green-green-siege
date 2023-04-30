import { Scalar, Scene, Vector3 } from 'babylonjs';
import { Enemy } from './Enemy';
import { Zone } from './zone';

export class Commando {
    private readonly _enemies: Enemy[];
    private readonly _destination: Vector3;
    private readonly _zone: Zone;

    constructor(nb: number, characteristics: any, scene: Scene, zone: Zone, spawnPoint: Vector3) {
        this._zone = zone;
        this._destination = this._zone.getRandomPoint();
        this._enemies = Array(nb)
            .fill(null)
            .map(() => {
                const spawnPointRandom = this._getRandomSpawnPoint(spawnPoint);
                const enemy = new Enemy(scene, spawnPointRandom, characteristics);
                enemy.setDestination(this._destination);
                return enemy;
            });
    }

    private _getRandomSpawnPoint(spawnPoint: Vector3): Vector3 {
        const randomOffset = new Vector3(
            Scalar.RandomRange(-1, 1),
            Scalar.RandomRange(-1, 1),
            Scalar.RandomRange(-1, 1)
        );
        return spawnPoint.add(randomOffset);
    }

    public getEnemies(): Enemy[] {
        return this._enemies;
    }

    public removeEnemy(enemy: Enemy) {
        const index = this._enemies.indexOf(enemy);
        if (index !== -1) {
            this._enemies.splice(index, 1);
        }
    }

    public animate(deltaTime: number, positions: Vector3[]) {
        this._enemies.forEach((enemy) => {
            enemy.animate(deltaTime, positions);

            // move and share the same destination
            if (enemy.getDistanceFromDestination() < 10) {
                this._destination.copyFrom(this._zone.getRandomPoint());
                this._enemies.forEach((otherEnemy) => {
                    otherEnemy.setDestination(this._destination);
                });
            }
        });
    }
}
