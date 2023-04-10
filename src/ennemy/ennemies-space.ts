// import { Color4, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, VertexBuffer, int } from "babylonjs";
import * as BABYLON from 'babylonjs';
import { Ennemy } from './ennemy';

export class EnnemiesSpace {
    private _zone: BABYLON.Mesh;

    private _min: BABYLON.Vector3;
    private _max: BABYLON.Vector3;

    private _width: number;
    private _height: number;
    private _depth: number;
    // private _navigationPlugin: BABYLON.RecastJSPlugin;
    // private _crowd: BABYLON.ICrowd;
    private _scene: BABYLON.Scene;
    // private _nEnnemie: number;
    // private _staticMesh: BABYLON.Mesh;
    private _ennemies: Ennemy[];
    // private _agents;

    constructor(min: BABYLON.Vector3, max: BABYLON.Vector3, nEnnemie: number, scene: BABYLON.Scene) {
        this._min = min;
        this._max = max;
        this._width = max.x - min.x;
        this._height = max.y - min.y;
        this._depth = max.z - min.z;
        this._scene = scene;
        // this._nEnnemie = nEnnemie;
        this._ennemies = [];
        // this._agents = [];
        this._zone = this.setupZone();
        // this._staticMesh = this.zone;
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

    public addEnnemy(ennemie: Ennemy) {
        this._ennemies.push(ennemie);
    }

    public logDim() {
        console.log('dim_Min: (x:', this._min.x, ', y:', this._min.y, ', z:', this._min.z, ')');
        console.log('dim_Max: (x:', this._max.x, ', y:', this._max.y, ', z:', this._max.z, ')');
    }

    public getVectorsWorld(): BABYLON.Vector3[] {
        return this._zone.getBoundingInfo().boundingBox.vectorsWorld;
    }

    public animate() {
        this._ennemies.forEach((ennemy) => {
            ennemy.animate();
        });
    }
}
