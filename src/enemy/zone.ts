import { Scalar, Scene, Vector3 } from 'babylonjs';
import { Enemy } from './Enemy';
import { Commando } from './commando';

export class Zone {
    private readonly _minDistance: number;
    private readonly _min: Vector3;
    private readonly _max: Vector3;
    private readonly _spawnPoints: Vector3[];
    private readonly _caracteristics: any;
    private readonly _scene: Scene;
    private readonly _commandos: Commando[];
    private _enemies: Enemy[];
    private _positions: Vector3[] = [];

    public currentCoolDown: number;
    public nbRobots: number;
    public tresholdEnemy: number;
    public cooldown: number;

    constructor(
        min: Vector3,
        max: Vector3,
        spawnPoint: Vector3[],
        scene: Scene,
        nbRobots: number,
        caracteristics: any,
        cooldown: number,
        tresholdEnemy: number
    ) {
        this._min = min;
        this._max = max;
        this._scene = scene;
        this._commandos = [];
        this._enemies = [];
        this._minDistance = 15;
        this.nbRobots = nbRobots;
        this._spawnPoints = spawnPoint;
        this.tresholdEnemy = tresholdEnemy;
        this.cooldown = cooldown;
        this._caracteristics = caracteristics;
        this.currentCoolDown = 0;
    }

    public getNbEnemies(): number {
        return this._commandos.reduce((total, commando) => total + commando.getEnemies().length, 0);
    }

    public getRandomPoint(): Vector3 {
        return new Vector3(
            Scalar.RandomRange(this._min.x, this._max.x),
            Scalar.RandomRange(this._min.y, this._max.y),
            Scalar.RandomRange(this._min.z, this._max.z)
        );
    }

    public instantiate(nb: number) {
        const spawnPoint = this._spawnPoints[Math.floor(Math.random() * this._spawnPoints.length)];
        const commando = new Commando(nb, this._caracteristics, this._scene, this, spawnPoint);
        this._commandos.push(commando);
        this._enemies = this._commandos.map((commando) => commando.getEnemies()).flat();
    }

    public addCommando(commando: Commando) {
        this._commandos.push(commando);
    }

    public getCommandos(): Commando[] {
        return this._commandos;
    }

    public getMin(): Vector3 {
        return this._min;
    }

    public getMax(): Vector3 {
        return this._max;
    }

    private updateAliveEnemyPositions() {
        this._positions = [];

        this._commandos.forEach((commando) => {
            commando.getEnemies().forEach((enemy) => {
                if (!enemy.isDeath()) {
                    this._positions.push(enemy.getPosition());
                }
            });
        });
    }

    private removeDeadEnemies() {
        this._commandos.forEach((commando) => {
            commando.getEnemies().forEach((enemy) => {
                if (enemy.isDeath() && enemy.canBeDisposed()) {
                    commando.removeEnemy(enemy);
                }
            });
        });
    }

    public animate(deltaTime: number) {
        this.removeDeadEnemies();
        this.updateAliveEnemyPositions();

        this._commandos.forEach((commando) => {
            commando.animate(deltaTime, this._positions);
        });
    }

    public dispose() {
        this._commandos.forEach((commando) => {
            commando.getEnemies().forEach((enemy) => {
                enemy.dispose();
            });
        });
    }
}
