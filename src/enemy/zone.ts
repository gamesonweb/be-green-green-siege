// import { Color4, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, VertexBuffer, int } from "babylonjs";
import * as BABYLON from 'babylonjs';
import { Enemy } from './Enemy';
import { Commando } from './commando';

export class Zone {


    // private _zone: BABYLON.Mesh;

    private _minDistance: number;
    private _min: BABYLON.Vector3;
    private _max: BABYLON.Vector3;

    private _spawnPoints: BABYLON.Vector3[];
    private _caracteristics: any;

    private _scene: BABYLON.Scene;
    private _enemies: Enemy[];
    private _commandos: Commando[];
    private _positions: BABYLON.Vector3[];

    public currentCoolDown: number;
    public nbRobots: number;
    public tresholdEnemy: number;
    public cooldown: number;

    constructor(min: BABYLON.Vector3, max: BABYLON.Vector3, spawnPoint: BABYLON.Vector3[], scene: BABYLON.Scene, nbRobots: number, caracteristics: any, cooldown: number, tresholdEnemy: number) {
        this._min = min;
        this._max = max;
        this._scene = scene;

        this._commandos = [];
        this._enemies = [];
        this._positions = [];
        this._minDistance = 15;

        this.nbRobots = nbRobots;
        this._spawnPoints = spawnPoint;
        this.tresholdEnemy = tresholdEnemy;
        this.cooldown = cooldown;
        this._caracteristics = caracteristics;

        this.currentCoolDown = 0;
    }

    public getNbEnemies(): number {
        let nb = 0;
        for (let commando of this._commandos) {
            nb += commando.getEnemies().length;
        }
        return nb;
    }


    public getRandomPoint(): BABYLON.Vector3 {
        return new BABYLON.Vector3(
            BABYLON.Scalar.RandomRange(this._min.x, this._max.x),
            BABYLON.Scalar.RandomRange(this._min.y, this._max.y),
            BABYLON.Scalar.RandomRange(this._min.z, this._max.z)
        );
    }

    public instantiate(nb: number) {
        let spawnPoint = this._spawnPoints[Math.floor(Math.random() * this._spawnPoints.length)]
        let commando = new Commando(nb, this._caracteristics, this._scene, this, spawnPoint);
        // let newPos = new BABYLON.Vector3(lastPos.x + space, lastPos.y + space, lastPos.z + space); //.addInPlace(enemy.mesh.position);
        this._commandos.push(commando);
        this._commandos.forEach((commando) => {
            commando.getEnemies().forEach((enemy) => {
                this._enemies.push(enemy);
            });
        });
    }

    // private setupZone(): BABYLON.Mesh {
    //     let zone = BABYLON.MeshBuilder.CreateBox(
    //         'invisibleZone',
    //         {
    //             width: this._max.x - this._min.x,
    //             height: this._max.y - this._min.y,
    //             depth: this._max.z - this._min.z,
    //         },
    //         this._scene
    //     );
    //     zone.material = new BABYLON.StandardMaterial('material_e_space', this._scene);
    //     zone.material.alpha = 0.1;
    //     // zone.isVisible = false;
    //     zone.position = this._min;
    //     return zone;
    // }

    public addCommando(commando: Commando) {
        this._commandos.push(commando);
    }

    public getMin(): BABYLON.Vector3 {
        return this._min;
    }

    public getMax(): BABYLON.Vector3 {
        return this._max;
    }

    private getPositions() {
        this._commandos.forEach((commando) => {
            commando.getEnemies().forEach((enemy) => {
                if(!enemy.isDeath()) {
                    this._positions.push(enemy.getPosition());
                } else {
                    commando.removeEnemy(enemy);
                }
            });
        });
    }

    public animate(deltaTime: number) {
        this.getPositions();
        // ennemies from commando
        this._commandos.forEach((commando) => {
            commando.animate(deltaTime, this._positions);
        });
        this._positions = [];
    }

    public dispose() {
        this._commandos.forEach((commando) => {
            commando.getEnemies().forEach((enemy) => {
                enemy.die();
            });
        });
    }
}
