// import { Color4, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, VertexBuffer, int } from "babylonjs";
import * as BABYLON from 'babylonjs';
import { Ennemy } from './ennemy';

export class EnnemiesSpace {

    public zone: BABYLON.Mesh;
    private _min: BABYLON.Vector3;
    private _max: BABYLON.Vector3;
    private _navigationPlugin: BABYLON.RecastJSPlugin;
    private _crowd: BABYLON.ICrowd;
    private _scene: BABYLON.Scene;
    private _nEnnemie: number;
    private _staticMesh: BABYLON.Mesh;
    private _ennemies: Ennemy[];
    private _agents;

    constructor(min: BABYLON.Vector3, max: BABYLON.Vector3, nEnnemie: number, scene: BABYLON.Scene) {
        this._min = min;
        this._max = max;
        this._scene = scene;
        this._nEnnemie = nEnnemie;
        this._ennemies = [];
        this._agents = [];
        this.zone = this.setupZone();
        this._staticMesh = this.zone;
    }

    public launch(): void {
        // setup navigation mesh using worker
        this.setupNavigationPlugin().then(() => {
            this.activateNavmesh();
        });
    }

    public getMin(): BABYLON.Vector3 {
        return this._min;
    }

    public getMax(): BABYLON.Vector3 {
        return this._max;
    }

    private setupZone(): BABYLON.Mesh {
        let zone = BABYLON.MeshBuilder.CreateBox("invisibleZone",
            {
                width: this._max.x - this._min.x,
                height: this._max.y - this._min.y,
                depth: this._max.z - this._min.z,
            }, this._scene);
        zone.material = new BABYLON.StandardMaterial("material_e_space", this._scene);
        zone.material.alpha = 0.1;
        // zone.isVisible = false;
        zone.position = this._min;
        //
        let axes = new BABYLON.AxesViewer(this._scene, 10);
        axes.xAxis.parent = this._scene.getMeshByName('Platform');
        axes.yAxis.parent = this._scene.getMeshByName('Platform');
        axes.zAxis.parent = this._scene.getMeshByName('Platform');
        //
        console.log("Position zone: ", zone.position);
        return zone;
    }

    public debug() {
        let navmeshdebug = this._navigationPlugin.createDebugNavMesh(this._scene);
        const matdebug = new BABYLON.StandardMaterial("matdebug", this._scene);
        matdebug.diffuseColor = new BABYLON.Color3(0.1, 0.2, 3);
        matdebug.alpha = 0.75;
        navmeshdebug.material = matdebug;
    }

    private async setupRecast() {
        await require("recast-detour")();
    }

    private async setupNavigationPlugin() {
        await this.setupRecast().then(() => {
            this._navigationPlugin = new BABYLON.RecastJSPlugin();
            // https://github.com/BabylonJS/Babylon.js/tree/master/packages/tools/playground/workers/navMeshWorker.js
            this._navigationPlugin.setWorkerURL("./workers/navMeshWorker.js");
        });
    }

    private activateNavmesh() {
        this._navigationPlugin.createNavMesh([this._staticMesh], this.getParameters(), (navmeshData) => {
            console.log("got worker data", navmeshData);
            this._navigationPlugin.buildFromNavmeshData(navmeshData);
            //
            this.debug();
            //
            this._crowd = this._navigationPlugin.createCrowd(this._nEnnemie, 2, this._scene);
            this._ennemies.forEach((agent) => {
                let target = BABYLON.MeshBuilder.CreateBox("target", {size: 1}, this._scene);
                target.isVisible = true;
                let transform: BABYLON.TransformNode = new BABYLON.TransformNode("transform_agent");
                // console.log('debug, pos: ', agent.getMesh().position);
                // agent.mesh.parent = transform;
                let idx: number = this._crowd.addAgent(agent.mesh.position, agent.getAgentParams(), transform);
                console.log("idx: ", idx);
                this._agents.push({idx:idx, trf:transform, mesh:agent.mesh, target:target});
            });
            this._crowd.getAgents().forEach((agent) => {
                console.log('agent: ', agent);
            });
            //
            this._scene.onBeforeRenderObservable.add(() => {
                // a random point into our space
                let randPoint = new BABYLON.Vector3(-50,20,40);
                let cube = BABYLON.MeshBuilder.CreateBox("debug_dest", {size: 1}, this._scene);
                cube.material = new BABYLON.StandardMaterial("debug_mat", this._scene);
                cube.position = randPoint;
                //
                this._crowd.agentGoto(0, this._navigationPlugin.getClosestPoint(randPoint));
                //
                this._agents.forEach((ag) => {
                    console.log('agent °', ag.idx);
                    ag.mesh.position = this._crowd.getAgentPosition(ag.idx);
                    console.log("pos ag.mesh= ", ag.mesh.position);
                    this._crowd.getAgentNextTargetPathToRef(ag.idx, ag.target.position);
                    console.log("pos ag.target= ", ag.target.position);
                });
            //
            });
        });
    }

    private getParameters(): BABYLON.INavMeshParameters {
        return {
            cs: 0.2,
            ch: 0.2,
            walkableSlopeAngle: 90,
            walkableHeight: 1,
            walkableClimb: 1,
            walkableRadius: 1,
            maxEdgeLen: 12,
            maxSimplificationError: 1.3,
            minRegionArea: 8,
            mergeRegionArea: 20,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 1,
        };
    }

    public addEnnemy(ennemie: Ennemy) {
        this._ennemies.push(ennemie);
    }

}