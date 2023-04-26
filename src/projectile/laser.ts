import * as BABYLON from 'babylonjs';
import timeControl from '../TimeControl';
import { Game } from '../game';
import { Targetable } from '../target/targetable';
import TimeControlledProjectileAnimation from './TimeControlledProjectileAnimation';
import { Projectile } from './projectile';

export class Laser implements Projectile {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;
    private _laserModel: BABYLON.Mesh;
    private _laserSpeed: number = 70;
    private _dispownDistance: number = 80;
    private _collisionDistance: number = 40;
    private _slowTimeDistance: number = 6;
    private _slowTimeFactor: number = 0.1;
    private _sparkParticles: BABYLON.ParticleSystem;

    public constructor(scene: BABYLON.Scene, options?: { speed?: number; dispowerDistance?: number; collisionDistance?: number; slowTimeDistance?: number; slowTimeFactor?: number }) {
        const {
            speed = this._laserSpeed,
            dispowerDistance = this._dispownDistance,
            collisionDistance = this._collisionDistance,
            slowTimeDistance = this._slowTimeDistance,
            slowTimeFactor = this._slowTimeFactor,
        } = options || {};

        this._scene = scene;
        if (Game.vrSupported) {
            this._camera = this._scene.activeCamera;
        } else {
            this._camera = this._scene.getCameraByName('PlayerNoVRCamera');
        }
        this._laserSpeed = speed;
        this._dispownDistance = dispowerDistance;
        this._collisionDistance = collisionDistance;
        this._slowTimeDistance = slowTimeDistance;
        this._slowTimeFactor = slowTimeFactor;
        this._laserModel = this.initLaserModel();
        this._laserModel.metadata = { parentClass: this };
        this._sparkParticles = this.initSparkParticles();
    }

    private initLaserModel(): BABYLON.Mesh {
        const model = BABYLON.MeshBuilder.CreateCylinder(
            'laser',
            {
                height: 0.1,
                diameter: 0.1,
            },
            this._scene
        );

        const material = new BABYLON.StandardMaterial('red', this._scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        material.alpha = 0.5;
        model.material = material;
        model.isVisible = false;

        return model;
    }

    private initSparkParticles(): BABYLON.ParticleSystem {
        const particleSystem = new BABYLON.ParticleSystem('sparkParticles', 2000, this._scene);

        particleSystem.particleTexture = new BABYLON.Texture('./assets/spark.png', this._scene);
        particleSystem.emitter = new BABYLON.Vector3(0, 0, 0);
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.1, -0.1, -0.1);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, 0.1);
        particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 0.8);
        particleSystem.color2 = new BABYLON.Color4(1, 0, 0, 0.8);
        particleSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0);
        particleSystem.minSize = 0.01;
        particleSystem.maxSize = 0.03;
        particleSystem.minLifeTime = 0.05;
        particleSystem.maxLifeTime = 0.1;
        particleSystem.emitRate = 800;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);
        particleSystem.direction1 = new BABYLON.Vector3(-0.5, 0.5, -0.5);
        particleSystem.direction2 = new BABYLON.Vector3(0.5, 0.5, 0.5);
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        particleSystem.minEmitPower = 0.5;
        particleSystem.maxEmitPower = 1.5;
        particleSystem.updateSpeed = 0.02;

        return particleSystem;
    }

    public get laserModel(): BABYLON.Mesh {
        return this._laserModel;
    }

    public fire(origin: BABYLON.Mesh, direction: BABYLON.Vector3): void {
        const laserInstance = this.createLaserInstance(origin, direction);
        laserInstance.isVisible = true;
    }

    private createLaserInstance(origin: BABYLON.Mesh, direction: BABYLON.Vector3): BABYLON.InstancedMesh {
        const laserInstance = this._laserModel.createInstance('laserInstance');
        laserInstance.position = origin.getAbsolutePosition().clone();

        const targetPosition = origin.getAbsolutePosition().add(direction);
        laserInstance.lookAt(targetPosition);

        // Rotate the laser instance to make its forward direction become its up direction
        laserInstance.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);

        return laserInstance;
    }

    private getAllLaserInstances(): BABYLON.InstancedMesh[] {
        return this._laserModel.instances;
    }

    private checkCollision(laser: BABYLON.InstancedMesh, nextPosition: BABYLON.Vector3): void {
        const currentPosition = laser.absolutePosition;
        const direction = nextPosition.subtract(currentPosition).normalize();
        const rayLength = BABYLON.Vector3.Distance(currentPosition, nextPosition) + 0.1;

        const ray = new BABYLON.Ray(currentPosition, direction, rayLength);

        const predicate = (mesh) => {
            return mesh.name.indexOf('HitBox') !== -1;
        };

        const hitInfo = this._scene.pickWithRay(ray, predicate, true);

        if (hitInfo.hit) {
            const hitObject = hitInfo.pickedMesh;

            if (hitObject.metadata && hitObject.metadata.parentClass instanceof Targetable) {
                hitObject.metadata.parentClass.touch();
            }

            // Create spark particles at the hit point
            this._sparkParticles.emitter = hitInfo.pickedPoint;
            this._sparkParticles.start();
            setTimeout(() => {
                this._sparkParticles.stop();
            }, 90);

            laser.dispose();
        }
    }

    private predictDetectCollisionWithPlayer(laser: BABYLON.InstancedMesh): Boolean {
        const ray = new BABYLON.Ray(laser.absolutePosition, laser.up, this._slowTimeDistance);
        const predicate = (mesh) => {
            return mesh.name === 'player_head_HitBox' || mesh.name === 'player_body_HitBox' || mesh.name === 'ShieldHitBox';
        };

        const hitInfo = this._scene.pickWithRay(ray, predicate);

        if (hitInfo.hit) {
            if (hitInfo.pickedMesh.name === 'ShieldHitBox') {
                return false;
            } else {
                return true;
            }
        }

        return false;
    }

    public animate(deltaTime: number): void {
        this._sparkParticles.updateSpeed = 0.02 * timeControl.getTimeScale();

        let minDistance = Infinity;

        this.getAllLaserInstances().forEach((laser) => {
            const nextPosition = laser.position.addInPlace(laser.up.scale(this._laserSpeed * deltaTime));
            const distancePlayer = BABYLON.Vector3.Distance(nextPosition, this._camera.position);

            // Dispose if the laser is too far away from the player
            if (distancePlayer > this._dispownDistance) {
                laser.dispose();
            }

            // Check collision if the laser is close enough to the player
            if (distancePlayer < this._collisionDistance) {
                this.checkCollision(laser, nextPosition);
            }

            // Update the minimum distance between the player and the lasers
            if (distancePlayer < this._slowTimeDistance && this.predictDetectCollisionWithPlayer(laser)) {
                minDistance = Math.min(minDistance, distancePlayer);
            }
        }, this);

        if (minDistance !== Infinity) {
            TimeControlledProjectileAnimation.askSlowTime(this._slowTimeFactor);
        }
    }

    public dispose(): void {
        this.getAllLaserInstances().forEach((laser) => {
            laser.dispose();
        }, this);

        this._laserModel.dispose();
    }
}
