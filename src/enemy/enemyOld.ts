import * as BABYLON from 'babylonjs';
import { Game } from '../game';
import { SoundPlayer } from '../sounds/soundPlayer';
import { SoundsBank } from '../sounds/soundsBank';
import { Targetable } from '../target/targetable';
import { Zone } from './zone';
// import Recast from 'recast-detour';
// npm install recast-detour

export class EnemyOLD extends Targetable {

    public mesh: BABYLON.Mesh;
    public scene: BABYLON.Scene;
    public zone: Zone;
    private _vibration: number;
    private _spawnPoint: BABYLON.Vector3;
    // movement
    private _destination: BABYLON.Vector3;
    public force: BABYLON.Vector3;
    public velocity: BABYLON.Vector3;
    // health
    private readonly _MAX_PARTICLES: number = 30;
    public isDeath: boolean = false;
    // particles
    private _smokeParticles: BABYLON.ParticleSystem;
    private _created = false;
    // eyes effect
    private _eyes: BABYLON.AbstractMesh;
    private _t: number = 0;
    private _eyesFreq: number = 0.2;
    // caracteristics
    private _shotFreq: number;
    private _bulletFreq: number;
    private _nbBullets: number;
    private _speed: number;
    private _life: number;
    private _score: number;
    private _bulletSpeed: number;
    private _bulletDmg: number;
    // sounds effect
    private _bip_bip: SoundPlayer;
    private _explosion: SoundPlayer;

    public constructor(caracteristics: any, scene: BABYLON.Scene, zone: Zone, spawnPoint: BABYLON.Vector3, destination: BABYLON.Vector3) {
        super();
        this.scene = scene;
        // this._destination = destination;
        this.zone = zone;
        this._destination = destination;
        // caracteristics
        const json = JSON.parse(caracteristics);
        this._shotFreq = json.shotFred;
        this._bulletFreq = json.bulletFreq;
        this._nbBullets = json.nbBullets;
        this._speed = json.speed;
        this._life = json.life;
        this._score = json.score;
        this._bulletSpeed = json.bulletSpeed;
        this._bulletDmg = json.bulletDmg;
        // spawnPoint
        this._spawnPoint = spawnPoint;
        // this._speed = speed;
        this.force = BABYLON.Vector3.Zero();
        this.velocity = BABYLON.Vector3.Zero();
        this.createMesh();
        // this._lifePoint = this._MAX_LIFE_POINT;
        // sounds
        this._bip_bip = new SoundPlayer(SoundsBank.ENEMY_BIP_BIP, scene, this.mesh);
        this._bip_bip.playWithRepeater(3);
        this._explosion = new SoundPlayer(SoundsBank.ENEMY_EXPLOSION, this.scene);
    }

    public createMesh() {
        this.mesh = Game.instanceLoader.getBot("enemy", { parentClass: this });
        this.mesh.scaling = new BABYLON.Vector3(2, 2, 2);
        this.mesh.position = this._spawnPoint;
        this._eyes = Game.instanceLoader.findInstanceSubMeshByName(this.mesh, 'Eyes');
        // eyes effect
        this._vibration = 0;
    }

    private lookAtMe(biais: number) {
        let origin: BABYLON.Vector3 = this.scene.activeCamera.position;
        this.mesh.lookAt(new BABYLON.Vector3(origin.x + biais, origin.y, origin.z));
        // animate face
        this._vibration += 0.2 //+ 2 * (this._MAX_LIFE_POINT - this._lifePoint);
    }

    public setDestination(destination: BABYLON.Vector3): void {
        this._destination = destination;
    }

    public getDistanceFromDestination() {

    }

    public takeDamage(val: number): void {
        this._life -= val;
    }

    private _launchSmokeParticles() {
        this._smokeParticles = new BABYLON.ParticleSystem('smoke', this._MAX_PARTICLES, this.scene);
        this._smokeParticles.particleTexture = new BABYLON.Texture('./assets/cloud.png', this.scene);
        this._smokeParticles.color1 = new BABYLON.Color4(0.1, 0.1, 0.1, 1);
        this._smokeParticles.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 0);
        this._smokeParticles.emitter = this.mesh;
        this._smokeParticles.start();
    }

    private _checkHealth() {
        // if (this._lifePoint != 0) {
        //     this._eyes.material.alpha = (1 + Math.cos(this._t)) / 2; // * (this._MAX_LIFE_POINT - this._lifePoint);
        //     this._t += this._eyesFreq * (this._MAX_LIFE_POINT - this._lifePoint);
        //     // console.log("t= ", this._eyes.material.alpha);
        // }
        // if (this._lifePoint != this._life) {
        //     // console.log("Point: ", this._lifePoint);
        //     if (!this._created) {
        //         this._launchSmokeParticles();
        //         this._created = true;
        //     }
        //     this._smokeParticles.emitRate = this._MAX_PARTICLES / this._lifePoint;
        //     if (this._lifePoint == 0) {
        //         this._smokeParticles.stop();
        //         this._die();
        //     }
        // }
    }

    public die(): void {
        BABYLON.ParticleHelper.CreateAsync('explosion', this.scene).then((set) => {
            // console.log(set.systems.length); == 4
            set.systems.forEach((s) => {
                s.disposeOnStop = true;
            });
            // console.log('0: ', set.systems[0].emitRate);
            // console.log('1: ', set.systems[1].emitRate);
            // console.log('2: ', set.systems[2].emitRate);
            // console.log('3: ', set.systems[3].emitRate);
            set.systems[0].emitRate = 50;
            set.systems[1].emitRate = 100;
            set.systems[2].emitRate = 50;
            set.systems[3].emitRate = 25;
            set.start(this.mesh);
        });
        // sound
        // let sound = new BABYLON.Sound("explosion_"+this.mesh.toString(), "./assets/sound/explosion.mp3", this.scene, null, {
        //     autoplay: true,
        //     spatialSound: true,
        //     volume: 1 / (1 + BABYLON.Vector3.Distance(this.mesh.position, this.scene.activeCamera.position))
        // });
        // sound.setPosition(this.mesh.position);
        this._bip_bip.stopAndDispose();
        this._explosion.setPosition(this.mesh.position);
        this._explosion.play();
        // console.log(this._explosion.getName(), " is playing ? ", this._explosion.isPlaying());
        setTimeout(() => {
            this.mesh.dispose();
        }, 500);
        this.isDeath = true;
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

    // public animate(deltaTime: number, positions: BABYLON.Vector3[]): void {
    //     // console.log('pos: ', this.mesh.position);
    //     // the enemy look at player ... for ever !
    //     this.lookAtMe(Math.sin(this._vibration));
    //     // moove
    //     if (Math.abs(this.movement.moove(this, positions, this._destination.position, this._speed, deltaTime)) < 10) {
    //         // tmp
    //         // this._takeDamage(1);
    //         this._destination.dispose();
    //         this._destination = this.zone.getRandomPoint();
    //     }
    //     this._checkHealth();
    // }


    public animateWithoutMoove(): void {
        // animate face
        // this._vibration += 0.4;
        // the enemy look at player ... for ever !
        this.lookAtMe(Math.sin(this._vibration));
        this._checkHealth();
        // moove
        // if (Math.abs(this.movement.moove(this, destination.position, this.speed, deltaTime)) < 10) {
        // this._destination.dispose();
        // this._destination = this.enemiesSpace.getRandomPoint();
        // }
    }

    public setSpeed(speed: number): void {
        this._speed = speed;
    }

    public getSpeed(): number {
        return this._speed;
    }

    // public setFireFreq(fireFreq: number): void {
    //     this._fireFreq = fireFreq;
    // }

    // public getFireFreq(): number {
    //     return this._fireFreq;
    // }

    // public setNBullets(nBullets: number): void {
    //     this._nBullets = nBullets;
    // }

    // public getNBullets(): number {
    //     return this._nBullets;
    // }
}
