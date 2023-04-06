import * as BABYLON from 'babylonjs';
import { EnnemiesSpace } from './ennemies-space';
// import Recast from 'recast-detour';
// npm install recast-detour

export class Ennemy {
    public mesh: BABYLON.AbstractMesh;
    private _scene: BABYLON.Scene;
    private _id: number;
    private _assetManager: BABYLON.AssetsManager;
    private _enemiesSpace: EnnemiesSpace;

    public constructor(scene: BABYLON.Scene, assetManager: BABYLON.AssetsManager, ennemiesSpace: EnnemiesSpace, id: number, pos: BABYLON.Vector3) {
        this._scene = scene;
        this._assetManager = assetManager;
        // set mesh
        // this._mesh = BABYLON.MeshBuilder.CreateBox("ennemy", { size: 2 }, scene);
        // set the ennemy position (to a distance of separation_distance value)
        // this._mesh.position = new BABYLON.Vector3(30,3,3);
        // set movement radius
        this._id = id;
        this._enemiesSpace = ennemiesSpace;
        this.create(pos);
    }

    public async create(pos: BABYLON.Vector3) {
        // set mesh
        this.setupMesh();
        this._assetManager.load();
        this._scene.executeWhenReady(async () => {
            this.mesh.position = pos;
            // this.setPosition(20,10,5);
            // this.setupNavigationPlugin().then(() => {
            this.animate();
            // });
        });
    }

    // private rotateEnnemy(distance, alpha): void {
    //     // let angle = deltaTime * rotationSpeed;
    //     this._mesh.position = new BABYLON.Vector3(
    //         distance * Math.cos(alpha),
    //         Math.sin(10 * alpha),
    //         distance * Math.sin(alpha)
    //     );
    // }

    public setupMesh() {
        let task = this._assetManager.addMeshTask('ennemy_' + this._id, '', './assets/', 'robotAnimated.glb');
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
            this.mesh = this._scene.getMeshByName('Robot');
            console.log('Ennemy created: this name is ', this.mesh.name);
        };
    }

    // public getAgentParams(): BABYLON.IAgentParameters {
    //     return {
    //         radius: 0.1,
    //         height: 0.2,
    //         maxAcceleration: 4,
    //         maxSpeed: 1,
    //         collisionQueryRange: 0.5,
    //         pathOptimizationRange: 0.0,
    //         separationWeight: 1.0
    //     }
    // }

    private lookAtMe(biais: number) {
        let origin: BABYLON.Vector3 = this._scene.getCameraByName('Camera').position;
        this.mesh.lookAt(new BABYLON.Vector3(origin.x + biais, origin.y, origin.z));
    }

    // private nextDestination(): BABYLON.Vector3 {
    //     let min = this._enemiesSpace.getMin();
    //     let max = this._enemiesSpace.getMax();
    //     let newDest = new BABYLON.Vector3(
    //         BABYLON.Scalar.RandomRange(min.x, max.x),
    //         BABYLON.Scalar.RandomRange(min.y, max.y),
    //         BABYLON.Scalar.RandomRange(min.z, max.z)
    //     );
    //     // while(BABYLON.Vector3.Distance(newDest, this.mesh.position) < 10 && BABYLON.Vector3.Distance(newDest, this.mesh.position) < 30) {
    //     //     console.log("compute new dest ...");
    //     //     this.nextDestination();
    //     // }
    //     return newDest;
    // }

    private moove(destination: BABYLON.Vector3, speed: number): number {
        let distance = BABYLON.Vector3.Distance(this.mesh.position, destination);
        let direction = destination.subtract(this.mesh.position).normalize();
        let delta = direction.scale(speed);
        this.mesh.position = this.mesh.position.add(delta);
        distance = BABYLON.Vector3.Distance(this.mesh.position, destination);
        // console.log("position: " + this.mesh.position);
        // console.log("distance: ", distance);
        // return distance
        return distance;
    }

    private animate(): void {
        let vibration = 0;
        let destination = this._enemiesSpace.getRandomPoint();
        this._scene.registerBeforeRender(() => {
            // animate face
            vibration += 0.2;
            // the enemy look at player ... for ever !
            this.lookAtMe(Math.sin(vibration));
            // moove !
            // console.log("destination: ", destination);
            if (this.moove(destination, 0.09) < 3) {
                destination = this._enemiesSpace.getRandomPoint();
            }
            // this.moove();
        });
    }
}
