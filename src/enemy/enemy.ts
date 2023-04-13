import * as BABYLON from 'babylonjs';
import { EnemiesSpace } from './enemies-space';
import { Movement } from '../movement/movement';
// import Recast from 'recast-detour';
// npm install recast-detour

export class Enemy {

    public mesh: BABYLON.Mesh;
    public scene: BABYLON.Scene;
    public assetManager: BABYLON.AssetsManager;
    public enemiesSpace: EnemiesSpace;
    private ready: boolean;
    private _vibration: number;
    // movement
    public movement: Movement;
    private _destination: BABYLON.Mesh;
    public speed: number;
    public force: BABYLON.Vector3;
    public velocity: BABYLON.Vector3;

    public constructor(scene: BABYLON.Scene, assetManager: BABYLON.AssetsManager, enemiesSpace: EnemiesSpace, pos: BABYLON.Vector3, movement: Movement, speed: number, destination) {
        this.scene = scene;
        this.assetManager = assetManager;
        this.enemiesSpace = enemiesSpace;
        this.movement = movement;
        this.speed = speed;
        this.force = BABYLON.Vector3.Zero();
        this.velocity = BABYLON.Vector3.Zero();
        this.createV2(pos);
    }

    // public async create(pos: BABYLON.Vector3, movement: Movement) {
    //     // set mesh
    //     this.setupMesh();
    //     this.assetManager.load();
    //     this.scene.executeWhenReady(async () => {
    //         this.mesh.position = pos;
    //         this._vibration = 0;
    //         this._destination = this.enemiesSpace.getRandomPoint();
    //         this.ready = true;
    //         // this.setPosition(20,10,5);
    //         // this.setupNavigationPlugin().then(() => {
    //         // this.animate();
    //         // });
    //     });
    // }

    public async createV2(pos: BABYLON.Vector3) {
        // set mesh
        this.mesh = BABYLON.MeshBuilder.CreateBox('box', { size: 3 }, this.scene);
        this.assetManager.load();
        // this.scene.executeWhenReady(async () => {
        this.mesh.position = pos;
        this._vibration = 0;
        this.ready = true;
            // this.setPosition(20,10,5);
            // this.setupNavigationPlugin().then(() => {
            // this.animate();
            // });
        // });
    }

    public setupMesh() {
        let task = this.assetManager.addMeshTask('ennemy', '', './assets/', 'robotAnimated.glb');
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
            // this.mesh = this.scene.getMeshByName('Robot');
            // console.log("Ennemy created: this name is ", this.mesh.name);
            // debug
            // this.mesh = BABYLON.MeshBuilder.CreateBox('box', { size: 3 }, this.scene);
        };
    }

    private lookAtMe(biais: number) {
        let origin: BABYLON.Vector3 = this.scene.getCameraByName('Camera').position;
        this.mesh.lookAt(new BABYLON.Vector3(origin.x + biais, origin.y, origin.z));
    }

    public setDestination(destination: BABYLON.Mesh): void {
        this._destination = destination;
    }

    public animate(deltaTime: number, positions: BABYLON.Vector3[]): void {
        if (!this.ready) {
            return;
        }
        // animate face
        this._vibration += 0.2;
        // the enemy look at player ... for ever !
        this.lookAtMe(Math.sin(this._vibration));
        // moove 
        if (Math.abs(this.movement.moove(this, positions, this._destination.position, this.speed, deltaTime)) < 10) {
            this._destination.dispose();
            this._destination = this.enemiesSpace.getRandomPoint();
        }
    }

    public checkCollision(positions: BABYLON.Vector3[]): BABYLON.Vector3 {
        let offset = BABYLON.Vector3.Zero()
        positions.forEach((position) => {
            let distance = BABYLON.Vector3.Distance(this.mesh.position, position);
            if(distance != 0) {
            // let pos = this.mesh.position; 
                offset.addInPlace(this.mesh.position.subtract(position).normalize().scale(50 / distance));
            }
        });
        return offset;
    }

    public animateWithoutMoove(): void {
        if (!this.ready) {
            return;
        }
        // animate face
        this._vibration += 0.2;
        // the enemy look at player ... for ever !
        this.lookAtMe(Math.sin(this._vibration));
        // moove 
        // if (Math.abs(this.movement.moove(this, destination.position, this.speed, deltaTime)) < 10) {
            // this._destination.dispose();
            // this._destination = this.enemiesSpace.getRandomPoint();
        // }
    }
}
