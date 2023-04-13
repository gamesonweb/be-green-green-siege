// import { Color4, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, VertexBuffer, int } from "babylonjs";
import * as BABYLON from 'babylonjs';
import { Enemy } from './enemy';
import { Commando } from './commando';

export class EnemiesSpace {

    private _zone: BABYLON.Mesh;

    private _min: BABYLON.Vector3;
    private _max: BABYLON.Vector3;

    private _minDistance: number;

    private _width: number;
    private _height: number;
    private _depth: number;
    private _scene: BABYLON.Scene;
    private _classicEnemies: Enemy[];
    private _commandos: Commando[];
    private _positions: BABYLON.Vector3[];

    constructor(min: BABYLON.Vector3, max: BABYLON.Vector3, scene: BABYLON.Scene) {
        this._min = min;
        this._max = max;
        this._width = max.x - min.x;
        this._height = max.y - min.y;
        this._depth = max.z - min.z;
        this._scene = scene;
        this._classicEnemies = [];
        this._commandos = [];
        this._positions = [];
        this._minDistance = 15;
        this._zone = this.setupZone();
    }

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
                width: this._width,
                height: this._height,
                depth: this._depth,
            },
            this._scene
        );
        zone.material = new BABYLON.StandardMaterial('material_e_space', this._scene);
        zone.material.alpha = 0.1;
        // zone.isVisible = false;
        zone.position = this._min;
        return zone;
    }

    public addEnnemy(enemy: Enemy) {
        this._classicEnemies.push(enemy);
        // this._enemies.push(enemy)
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

    // public logDim() {
    //     console.log('dim_Min: (x:', this._min.x, ', y:', this._min.y, ', z:', this._min.z, ')');
    //     console.log('dim_Max: (x:', this._max.x, ', y:', this._max.y, ', z:', this._max.z, ')');
    // }

    // public getVectorsWorld(): BABYLON.Vector3[] {
    //     return this._zone.getBoundingInfo().boundingBox.vectorsWorld;
    // }

    private getPositions() {
        this._classicEnemies.forEach((enemy) => {
            this._positions.push(enemy.mesh.position);
        });
        this._commandos.forEach((commando) => {
            commando.getEnemies().forEach((enemy) => {
                this._positions.push(enemy.mesh.position);
            });
        });
    }

    public animate(deltaTime: number) {
        this.getPositions();
        // ennemies
        this._classicEnemies.forEach((enemy) => {
            enemy.animate(deltaTime, this._positions);
        });
        // ennemies from commando
        this._commandos.forEach((commando) => {
            commando.animate(deltaTime, this._positions);
        });
        // // collisions
        // this._allEnemies.forEach((enemy) => {
        //     let current = enemy;
        //     this._allEnemies.forEach((another) => {
        //         let distance = BABYLON.Vector3.Distance(current.mesh.position, another.mesh.position);
        //         if (distance < this._minDistance) {
        //             // Éviter la collision
        //             var direction = current.mesh.position.subtract(another.mesh.position).normalize();
        //             current.mesh.position.addInPlace(direction.scale(0.1));
        //         }
        //     });
        // });
        this._positions = [];
    }
}
