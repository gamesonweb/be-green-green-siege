// import { Color4, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, VertexBuffer, int } from "babylonjs";
import * as BABYLON from 'babylonjs';
import { Enemy } from './enemy';
import { Commando } from './commando';

export class Zone {

    private _zone: BABYLON.Mesh;

    private _min: BABYLON.Vector3;
    private _max: BABYLON.Vector3;

    private _minDistance: number;

    // private _width: number;
    // private _height: number;
    // private _depth: number;
    private _scene: BABYLON.Scene;
    // private _classicEnemies: Enemy[];
    private _commandos: Commando[];
    private _positions: BABYLON.Vector3[];

    private _spawnPoints: BABYLON.Vector3[];
    private robotCaracteristics: any;
    
    public currentCoolDown: number;
    public nbRobots: number;
    public trehsholdEnnemy: number;
    public cooldown: number;

    constructor(min: BABYLON.Vector3, max: BABYLON.Vector3, spawnPoint: BABYLON.Vector3[], scene: BABYLON.Scene, nbRobots: number, caracteristics: any, cooldown: number, trehsholdEnnemy: number) {
        this._min = min;
        this._max = max;
        this._scene = scene;
        // this._classicEnemies = [];
        this._commandos = [];
        this._positions = [];
        this._minDistance = 15;
        this._zone = this.setupZone();

        this.nbRobots = nbRobots;
        this._spawnPoints = spawnPoint;
        this.trehsholdEnnemy = trehsholdEnnemy;
        this.cooldown = cooldown;
        this.robotCaracteristics = caracteristics;

        this.currentCoolDown = 0;
    }
    
    public getNbEnemies(): number {
        let nb = 0;
        for (let commando of this._commandos) {
            nb += commando.getEnemies().length;
        }
        return nb;
    }


    public instantite(nb: number) {}

    public getRandomPoint(): BABYLON.Mesh {
        let pos: BABYLON.Vector3 = new BABYLON.Vector3(
            BABYLON.Scalar.RandomRange(this._min.x, this._max.x),
            BABYLON.Scalar.RandomRange(this._min.y, this._max.y),
            BABYLON.Scalar.RandomRange(this._min.z, this._max.z)
        );
        // debug
        let cube = BABYLON.MeshBuilder.CreateBox('debug_dest', { size: 1 }, this._scene);
        cube.material = new BABYLON.StandardMaterial('debug_mat', this._scene);
        cube.position = pos;
        return cube;
    }

    private setupZone(): BABYLON.Mesh {
        let zone = BABYLON.MeshBuilder.CreateBox(
            'invisibleZone',
            {
                width: this._max.x - this._min.x,
                height: this._max.y - this._min.y,
                depth: this._max.z - this._min.z,
            },
            this._scene
        );
        zone.material = new BABYLON.StandardMaterial('material_e_space', this._scene);
        zone.material.alpha = 0.1;
        // zone.isVisible = false;
        zone.position = this._min;
        return zone;
    }

    public addCommando(commando: Commando) {
        this._commandos.push(commando);
        // commando.getEnemies().forEach((enemy) => {
        //     this._enemies.push(enemy)
        // });
        // this._ennemies.push(enemy)
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
                if(!enemy.isDeath) {
                    this._positions.push(enemy.mesh.position);
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
        this._zone.dispose();
        this._commandos.forEach((commando) => {
            commando.getEnemies().forEach((enemy) => {
                enemy.die();
            });
        });
    }
}
