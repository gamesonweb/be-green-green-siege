import * as BABYLON from 'babylonjs';
import { EnnemiesSpace } from './ennemies-space';
import { Movement } from '../movement/movement';
// import Recast from 'recast-detour';
// npm install recast-detour

export class Enemy {

    public mesh: BABYLON.Mesh;
    private _scene: BABYLON.Scene;
    private _assetManager: BABYLON.AssetsManager;
    private _enemiesSpace: EnnemiesSpace;
    private _ready: boolean;
    private _vibration: number;
    // movement
    private _movement: Movement;
    private _destination: BABYLON.Mesh;
    private _speed: number;
    public force: BABYLON.Vector3;
    public velocity: BABYLON.Vector3;

    public constructor(scene: BABYLON.Scene, assetManager: BABYLON.AssetsManager, ennemiesSpace: EnnemiesSpace, pos: BABYLON.Vector3, movement: Movement, speed: number) {
        this._scene = scene;
        this._assetManager = assetManager;
        this._enemiesSpace = ennemiesSpace;
        this._movement = movement;
        this._speed = speed;
        this.force = BABYLON.Vector3.Zero();
        this.velocity = BABYLON.Vector3.Zero();
        this.create(pos, movement);
    }

    public async create(pos: BABYLON.Vector3, movement: Movement) {
        // set mesh
        this.setupMesh();
        this._assetManager.load();
        this._scene.executeWhenReady(async () => {
            this.mesh.position = pos;
            this._vibration = 0;
            this._destination = this._enemiesSpace.getRandomPoint();
            this._ready = true;
            // this.setPosition(20,10,5);
            // this.setupNavigationPlugin().then(() => {
            // this.animate();
            // });
        });
    }

    public setupMesh() {
        let task = this._assetManager.addMeshTask('ennemy', '', './assets/', 'robotAnimated.glb');
        task.onSuccess = (task) => {
            console.log('Loading ennemy');
            task.loadedAnimationGroups.forEach((anim) => {
                console.log(anim.name);
            });
            let leftLaserShot = task.loadedAnimationGroups[0];
            let leftLaserShot2 = task.loadedAnimationGroups[1];
            let rightLaserShot = task.loadedAnimationGroups[2];
            let rightLaserShot2 = task.loadedAnimationGroups[3];
            //
            rightLaserShot.stop();
            leftLaserShot.stop();
            rightLaserShot2.stop();
            leftLaserShot2.stop();
            //
            rightLaserShot.reset();
            leftLaserShot.reset();
            rightLaserShot2.reset();
            leftLaserShot2.reset();
            //
            rightLaserShot.play(true);
            leftLaserShot.play(true);
            // rightLaserShot2.play(true);
            // leftLaserShot2.play(true);
            // voir doc on peut les stop les resets loops etc.
            //
            // this.mesh = this._scene.getMeshByName('Robot');
            // console.log("Ennemy created: this name is ", this.mesh.name);
            // debug
            this.mesh = BABYLON.MeshBuilder.CreateBox('box', { size: 3 }, this._scene);
        };
    }

    private lookAtMe(biais: number) {
        let origin: BABYLON.Vector3 = this._scene.getCameraByName('Camera').position;
        this.mesh.lookAt(new BABYLON.Vector3(origin.x + biais, origin.y, origin.z));
    }

    public animate(deltaTime: number): void {
        if (!this._ready) {
            return;
        }
        // animate face
        this._vibration += 0.2;
        // the enemy look at player ... for ever !
        this.lookAtMe(Math.sin(this._vibration));
        // moove 
        if (Math.abs(this._movement.moove(this, this._destination.position, this._speed, deltaTime)) < 10) {
            this._destination.dispose();
            this._destination = this._enemiesSpace.getRandomPoint();
        }
    }
}
