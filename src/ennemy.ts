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

    public setupMesh() {
        let task = this._assetManager.addMeshTask('ennemy_'+this._id, '', './assets/', 'robotAnimated.glb');
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
            this.mesh = BABYLON.MeshBuilder.CreateBox('box', {size: 3}, this._scene);
        };
    }

    private lookAtMe(biais: number) {
        let origin: BABYLON.Vector3 = this._scene.getCameraByName("Camera").position;
        this.mesh.lookAt(new BABYLON.Vector3(
            origin.x + biais,
            origin.y,
            origin.z
        ));
    }

    private moove(destination: BABYLON.Mesh, speed: number): number {
        let frequency = 0.0005;
        let direction = destination.position.subtract(this.mesh.position).normalize();
        let distance = BABYLON.Vector3.Distance(this.mesh.position, destination.position);
        let moveDistance = Math.min(distance, speed);

        this.mesh.translate(direction, moveDistance, BABYLON.Space.WORLD);
        this.mesh.position = BABYLON.Vector3.Lerp(this.mesh.position, destination.position, speed);
        // sinusoidale
        this.mesh.position.y += 0.1 * Math.sin(frequency * Date.now());
        return BABYLON.Vector3.Distance(destination.position, this.mesh.position);
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
            console.log("destination: ", destination.position);
            // this.moove(destination, 0.1);
            if(Math.abs(this.moove(destination, 0.01)) < 5) {
                destination.dispose();
                destination = this._enemiesSpace.getRandomPoint();
            }
        });
    }

}
