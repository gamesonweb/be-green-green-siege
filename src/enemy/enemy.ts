import * as BABYLON from 'babylonjs';
import { Movement } from '../movement/movement';
import { EnemiesSpace } from './enemies-space';
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
    // health
    private readonly _MAX_LIFE_POINT: number = 3;
    private readonly _MAX_PARTICLES: number = 10;
    private _lifePoint: number;
    // particles
    private _smokeParticles: BABYLON.ParticleSystemSet;
    private _created = false;

    public constructor(scene: BABYLON.Scene, enemiesSpace: EnemiesSpace, pos: BABYLON.Vector3, movement: Movement, speed: number, destination) {
        this.scene = scene;
        this.enemiesSpace = enemiesSpace;
        this.movement = movement;
        this.speed = speed;
        this.force = BABYLON.Vector3.Zero();
        this.velocity = BABYLON.Vector3.Zero();
        this.createV2(pos);
        this._lifePoint = this._MAX_LIFE_POINT;
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

    public takeDamage(val: number): void {
        this._lifePoint -= val;
    }

    private _launchSmokeParticles(): void {
        BABYLON.ParticleHelper.CreateAsync('smoke', this.scene, true).then((set) => {
            this._smokeParticles = set;
            this._smokeParticles.systems.forEach((system) => {
                system.emitRate = 1;
                system.minLifeTime = 1;
                system.maxLifeTime = 1;
                system.disposeOnStop = true;
                // system.emitter = new BABYLON.Vector3(0, 0, 0); // Position de l'émetteur
                // system.minEmitBox = new BABYLON.Vector3(-1, 0, -1); // Zone d'émission minimale
                // system.maxEmitBox = new BABYLON.Vector3(1, 0, 1); // Zone d'émission maximale
                // system.emitRate = intensitySlider.value * 100; // Taux d'émission initial
                // system.start()
            });
            set.start(this.mesh);
        });
    }

    private _checkHealth(): void {
        if (this._lifePoint != this._MAX_LIFE_POINT) {
            if (!this._created) {
                this._launchSmokeParticles();
                this._created = true;
            }
            // }
            // this._smokeParticles.systems.forEach((system) => {
            //     setInterval(() => {
            //         smokeParticleSystemSet.systems.forEach((system) => {
            //             system.emit();
            //         });
            //     }, 10000);
            //     system.start();
            // });
            // this._smokeParticles.then((set) => {
            //     set.systems.forEach((system) => {
            //         system.emitRate = Math.floor(this._MAX_PARTICLES / this._lifePoint);
            //         // system.maxLifeTime = 2;
            //         // system.disposeOnStop = true;
            //     });
            //     // set.start(this.mesh);
            //     if(this._lifePoint === 0) {
            //         set.dispose();
            //         BABYLON.ParticleHelper.CreateAsync("explosion", this.scene, true).then((set) => {
            //             // set.systems.forEach((system) => {
            //             //     system.disposeOnStop = true;
            //             // });
            //             set.start();
            //         });
            //     }
            // });
        }
    }

    private _die(): void {}

    public animate(deltaTime: number, positions: BABYLON.Vector3[]): void {
        if (!this.ready) {
            return;
        }
        // update health
        // this._checkHealth();
        // animate face
        this._vibration += 0.2;
        // the enemy look at player ... for ever !
        this.lookAtMe(Math.sin(this._vibration));
        // moove
        if (Math.abs(this.movement.moove(this, positions, this._destination.position, this.speed, deltaTime)) < 10) {
            // tmp
            // this._takeDamage(1);
            this._destination.dispose();
            this._destination = this.enemiesSpace.getRandomPoint();
        }
    }

    public checkCollision(positions: BABYLON.Vector3[]): BABYLON.Vector3 {
        let offset = BABYLON.Vector3.Zero();
        positions.forEach((position) => {
            let distance = BABYLON.Vector3.Distance(this.mesh.position, position);
            if (distance != 0) {
                // let pos = this.mesh.position;
                offset.addInPlace(
                    this.mesh.position
                        .subtract(position)
                        .normalize()
                        .scale(50 / distance)
                );
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
        // this._checkHealth();
        // moove
        // if (Math.abs(this.movement.moove(this, destination.position, this.speed, deltaTime)) < 10) {
        // this._destination.dispose();
        // this._destination = this.enemiesSpace.getRandomPoint();
        // }
    }
}
