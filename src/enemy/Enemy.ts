import * as BABYLON from 'babylonjs';
import { AnimationName, animations } from '../AnimationController';
import score from '../Score';
import { Game } from '../game';
import { Laser } from '../projectile/laser';
import { SoundPlayer } from '../sounds/soundPlayer';
import { SoundsBank } from '../sounds/soundsBank';
import { Targetable } from '../target/targetable';
import { IEnemy } from './IEnemy';

export class Enemy extends Targetable implements IEnemy {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _canBeDisposed: boolean;

    // Mesh
    private _mesh: BABYLON.Mesh;

    // Head Rotation
    private readonly HEAD_ROTATION_SPEED: number = 4;

    // Health
    private readonly _INITIAL_LIFE_POINT: number;
    private dead: boolean = false;
    private _lifePoint: number;

    // Movement
    private readonly _SPEED: number = 4;
    private _speedVector: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _destination: BABYLON.Vector3;
    private _FRICTIONCOEFFICIENT: number = 0.25;

    // Colision
    private readonly _MINTARGETDISTANCETARGET: number = 5;
    private readonly _MINDISTANCEENEMY: number = 3;

    // Shooting
    private _laser: Laser;
    private _rightLaserSpawn: BABYLON.Vector3;
    private _leftLaserSpawn: BABYLON.Vector3;
    private _shotFreq: number = 10;
    private _nbBullet: number = 3;
    private _bulletFreq: number = 1;
    private _AIMBIAS: number = 0.02;
    private _lastShotLeft: boolean = false;
    private _timeSinceLastFire: number = Infinity;

    // Score
    private _score: number = 0;

    // Smoke effect
    private _smokeParticles: BABYLON.ParticleSystem;

    // Vibraion effect
    private _vibration: number = 0;

    // sounds effect
    private _sound_bip_bip: SoundPlayer;
    private _sound_explosion: SoundPlayer;
    private _sound_fuckin: SoundPlayer;
    private _sound_touched: SoundPlayer;
    private _sound_shoot: SoundPlayer;

    // explosion
    private _explosion: BABYLON.ParticleSystem;

    constructor(scene: BABYLON.Scene, spawnPosition: BABYLON.Vector3, caracteristics: any) {
        super();
        this._scene = scene;

        // Read caracteristics
        this._shotFreq = caracteristics.shotFreq;
        this._bulletFreq = caracteristics.bulletFreq;
        this._nbBullet = caracteristics.nbBullet;
        const bulletSpeed = caracteristics.bulletSpeed;
        this._SPEED = caracteristics.speed;
        this._INITIAL_LIFE_POINT = caracteristics.life;
        this._score = caracteristics.score;
        this._AIMBIAS = caracteristics.bias;

        // Camera
        if (Game.vrSupported) {
            this._camera = this._scene.activeCamera;
        } else {
            this._camera = this._scene.getCameraByName('PlayerNoVRCamera');
        }

        // Mesh
        this._mesh = Game.instanceLoader.getBot('robot', { parentClass: this });
        this._mesh.position = spawnPosition;

        // Health
        this._lifePoint = this._INITIAL_LIFE_POINT;

        // Shooting
        this._laser = new Laser(this._scene, { speed: bulletSpeed, dispowerDistance: 60, collisionDistance: 10 });
        const rightLaserPoint = Game.instanceLoader.findInstanceSubMeshByName(
            this._mesh,
            'RightLaserPoint'
        ) as BABYLON.Mesh;
        const leftLaserPoint = Game.instanceLoader.findInstanceSubMeshByName(
            this._mesh,
            'LeftLaserPoint'
        ) as BABYLON.Mesh;
        this._rightLaserSpawn = rightLaserPoint.getAbsolutePosition();
        this._leftLaserSpawn = leftLaserPoint.getAbsolutePosition();

        // Smoke effect
        this._smokeParticles = new BABYLON.ParticleSystem('smoke', 30, this._scene);
        this._smokeParticles.particleTexture = new BABYLON.Texture('./assets/cloud.png', this._scene);
        this._smokeParticles.emitter = this._mesh;
        this._smokeParticles.color1 = new BABYLON.Color4(0.1, 0.1, 0.1, 1);
        this._smokeParticles.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 0);
        this._smokeParticles.minSize = 0.1;

        // sounds
        this._sound_bip_bip = new SoundPlayer(SoundsBank.ENEMY_BIP_BIP, scene, this._mesh);
        this._sound_bip_bip.playWithRepeater(10 + 10 * Math.random());
        this._sound_explosion = new SoundPlayer(SoundsBank.ENEMY_EXPLOSION, this._scene, this._mesh);
        this._sound_fuckin = new SoundPlayer(SoundsBank.ENEMY_FUCKIN, this._scene, this._mesh);
        this._sound_touched = new SoundPlayer(SoundsBank.ENEMY_TOUCHED, this._scene, this._mesh);
        this._sound_shoot = new SoundPlayer(SoundsBank.ENEMY_SHOOT, this._scene, this._mesh);

        // explosion init
        this.createExplosion();
    }

    private fire(deltaTime: number): void {
        // animate laser
        this._laser.animate(deltaTime);

        if (this.isDeath()) {
            return;
        }

        // fire
        this._timeSinceLastFire += deltaTime;

        if (this._timeSinceLastFire >= this._shotFreq) {
            this._timeSinceLastFire = 0;

            for (let i = 0; i < this._nbBullet; i++) {
                setTimeout(() => {
                    this._lastShotLeft = !this._lastShotLeft;
                    if (this._lastShotLeft) {
                        this.shoot(this._leftLaserSpawn);
                        animations.playAnimation(this._mesh, AnimationName.LeftLaserBack);
                    } else {
                        this.shoot(this._rightLaserSpawn);
                        animations.playAnimation(this._mesh, AnimationName.RightLaserBack);
                    }
                }, i * this._bulletFreq * 1000);
            }
        }
    }

    private shoot(origin: BABYLON.Vector3) {
        // if the enemy is dead, don't shoot
        if (this.isDeath()) {
            return;
        }

        // choose target
        let targetPos;
        if (Math.random() < 0.5) {
            targetPos = Game.player.getBodyPosition();
        } else {
            targetPos = Game.player.getHeadPosition();
        }

        // fire
        const laserDirection = targetPos.subtract(origin).normalize();

        // Add random bias to the laser direction
        const randomBias = new BABYLON.Vector3(
            (Math.random() - 0.5) * this._AIMBIAS,
            (Math.random() - 0.5) * this._AIMBIAS,
            (Math.random() - 0.5) * this._AIMBIAS
        );
        const biasedLaserDirection = laserDirection.add(randomBias).normalize();

        this._laser.fire(origin, biasedLaserDirection);
        this._sound_shoot.play();
    }

    public getPosition(): BABYLON.Vector3 {
        return this._mesh.getAbsolutePosition();
    }

    public setDestination(destination: BABYLON.Vector3) {
        this._destination = destination;
    }

    public isDeath(): boolean {
        return this.dead;
    }

    public canBeDisposed(): boolean {
        return this._canBeDisposed;
    }

    private rotation(deltaTime: number) {
        // Calculate the target direction
        const targetDirection = this._camera.position.subtract(this._mesh.position).normalize();

        // Calculate the horizontal rotation (left/right)
        const horizontalAngle = Math.atan2(targetDirection.z, targetDirection.x) - Math.PI / 2;
        const horizontalRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Down(), horizontalAngle);

        // Calculate the vertical rotation (up/down)
        const verticalAngle = Math.asin(targetDirection.y);
        const verticalRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Left(), verticalAngle);

        // combine horizontal and vertical rotation
        const targetRotation = horizontalRotation.multiply(verticalRotation);

        // Add vibration effect
        const vibrationRotation = BABYLON.Quaternion.RotationAxis(
            BABYLON.Vector3.Down(),
            Math.sin(Date.now() * this._vibration) * this._vibration
        );

        // combine target rotation and vibration rotation
        const combinedRotation = targetRotation.multiply(vibrationRotation);

        // Spherical interpolation between current and combined rotation
        this._mesh.rotationQuaternion = BABYLON.Quaternion.Slerp(
            this._mesh.rotationQuaternion,
            combinedRotation,
            this.HEAD_ROTATION_SPEED * deltaTime
        );
    }

    private checkHealth() {
        if (this._lifePoint <= 0) {
            this.dead = true;
            this.die();
        }
    }

    public die() {
        this._sound_bip_bip.stopAndDispose();
        this._sound_fuckin.play();
        this._smokeParticles.dispose();
        setTimeout(() => {
            this._explosion.start();
            // this._sound_explosion.setPosition(this._mesh.position);
            this._sound_explosion.play();
            setTimeout(() => {
                this._explosion.stop();
            }, 1000);
            //
            setTimeout(() => {
                this._explosion.dispose();
                this._mesh.dispose();
            }, 2000);
            //
            this._laser.waitAndDispose(() => {
                this._canBeDisposed = true;
                this.dispose();
            });
        }, 1000);

        //
    }

    private move(deltaTime: number, enemiesPositions: BABYLON.Vector3[]) {
        if (!this._destination) {
            return;
        }

        const currentPosition = this.getPosition();

        ////////////////////////////////////
        // Calculate the target direction //
        ////////////////////////////////////
        const destinationVector = BABYLON.Vector3.Zero();
        const destinationDirection = this._destination.subtract(currentPosition).normalize();

        // Check if the robot is close to the destination
        const destinationDistance = BABYLON.Vector3.Distance(currentPosition, this._destination);

        // Apply a slight repulsion effect if the robot is close to the destination
        if (destinationDistance < this._MINTARGETDISTANCETARGET) {
            const repulsionForce =
                (this._MINTARGETDISTANCETARGET - destinationDistance) / this._MINTARGETDISTANCETARGET;
            const repulsionVector = destinationDirection.scale(-repulsionForce * 0.5);
            destinationVector.addInPlace(repulsionVector);
        } else {
            destinationVector.addInPlace(destinationDirection);
        }

        ////////////////////////////////////////
        // Avoid collision with other enemies //
        ////////////////////////////////////////
        const collisionRobotVector = BABYLON.Vector3.Zero();
        for (let i = 0; i < enemiesPositions.length; i++) {
            const distance = BABYLON.Vector3.Distance(currentPosition, enemiesPositions[i]);

            // Don't take into account the enemy itself
            if (distance === 0) {
                continue;
            }
            // Calculate the repulsion force based on distance
            else if (distance < this._MINDISTANCEENEMY) {
                const direction = currentPosition.subtract(enemiesPositions[i]).normalize();
                const repulsionForce = (this._MINDISTANCEENEMY - distance) / this._MINDISTANCEENEMY; // Inverse proportionality
                const repulsionVector = direction.scale(repulsionForce);

                // Add the repulsion vector to the next speed
                collisionRobotVector.addInPlace(repulsionVector);
            }
        }

        ////////////////////////////////
        // Avoid collision with walls //
        ////////////////////////////////
        const collisionWallVector = BABYLON.Vector3.Zero();

        Game.avoidSpheres.forEach((sphere) => {
            const distance = BABYLON.Vector3.Distance(currentPosition, sphere.position);
            const direction = currentPosition.subtract(sphere.position).normalize();

            // Calculate the repulsion force based on distance
            const radius = sphere.radius + 1;
            if (distance < radius) {
                const repulsionForce = (radius - distance) / radius;
                const repulsionVector = direction.scale(repulsionForce);

                // Add the repulsion vector to the next speed
                collisionWallVector.addInPlace(repulsionVector);
            }
        });

        // Calculate the new acceleration vector
        const newAcceleration = BABYLON.Vector3.Zero();
        newAcceleration.addInPlace(destinationVector.scale(destinationDistance / 10));
        newAcceleration.addInPlace(collisionRobotVector);
        newAcceleration.addInPlace(collisionWallVector.scale(20 * (destinationDistance / 20)));

        // Add the friction force
        const frictionVector = this._speedVector.scale(-1).scale(this._FRICTIONCOEFFICIENT);
        newAcceleration.addInPlace(frictionVector);

        // Update the speed vector with acceleration
        this._speedVector.addInPlace(newAcceleration.scale(deltaTime));

        /////////////////////////////////////////////////////////////////
        // Adjust the speed based on the distance from the destination //
        /////////////////////////////////////////////////////////////////
        const speedMultiplier = destinationDistance / 10;
        const targetSpeed = this._SPEED * speedMultiplier;

        // Adjust the speed vector towards the target speed
        if (this._speedVector.length() < targetSpeed) {
            this._speedVector.addInPlace(newAcceleration.scale(deltaTime));
        } else {
            this._speedVector.scaleInPlace(targetSpeed / this._speedVector.length());
        }

        // Update the position
        this._mesh.position.addInPlace(this._speedVector.scale(deltaTime));
    }

    private smoke(deltaTime: number) {
        if (this._lifePoint < this._INITIAL_LIFE_POINT) {
            if (!this._smokeParticles.isStarted()) {
                this._smokeParticles.start();
            }

            this._smokeParticles.maxSize = 2 * (1 - this._lifePoint / this._INITIAL_LIFE_POINT);
            this._smokeParticles.updateSpeed = 1 * deltaTime;
        }
    }

    private updateVibration() {
        if (this._lifePoint < this._INITIAL_LIFE_POINT) {
            this._vibration = 1 - this._lifePoint / this._INITIAL_LIFE_POINT;
        }
    }

    public animate(deltaTime: number, enemiesPositions: BABYLON.Vector3[]): void {
        this.rotation(deltaTime);
        this.checkHealth();
        this.move(deltaTime, enemiesPositions);
        this.fire(deltaTime);
        this.smoke(deltaTime);
        this.updateVibration();
        this._explosion.updateSpeed = 1 * deltaTime;
    }

    public touch(): void {
        this._lifePoint -= 1;
        // Calculate distance whith player
        const playerDistance = BABYLON.Vector3.Distance(this._mesh.position, Game.player.getHeadPosition());
        score.playerHitRobot(playerDistance);
        if (this._lifePoint == 0) {
            this._sound_touched.stopAndDispose();
        } else {
            this._sound_touched.play();
        }
    }

    public getDistanceFromDestination(): number {
        return BABYLON.Vector3.Distance(this._destination, this._mesh.position);
    }

    private createExplosion() {
        // Create a particle system
        this._explosion = new BABYLON.ParticleSystem('explosion', 200, this._scene);
        // Load the texture for the particles
        this._explosion.particleTexture = new BABYLON.Texture('assets/cloud.png', this._scene);
        // Set the position of the particles
        this._explosion.emitter = this._mesh.position;
        this._explosion.minEmitBox = new BABYLON.Vector3(-2.5, -2.5, -2.5);
        this._explosion.maxEmitBox = new BABYLON.Vector3(2.5, 2.5, 2.5);
        // Set the size of the particles
        this._explosion.minSize = 0.5;
        this._explosion.maxSize = 2;
        // Set the speed of the particles
        this._explosion.minLifeTime = 0.01;
        this._explosion.maxLifeTime = 0.15;
        this._explosion.emitRate = 200;
        // Set the direction of the particles
        this._explosion.direction1 = new BABYLON.Vector3(-1, 1, -1);
        this._explosion.direction2 = new BABYLON.Vector3(1, 1, 1);
        // Set the angular speed of the particles
        this._explosion.minAngularSpeed = 0;
        this._explosion.maxAngularSpeed = Math.PI;
    }

    public dispose() {
        this._mesh.dispose();
        this._sound_bip_bip.stopAndDispose();
        this._smokeParticles.dispose();
        this._laser.dispose();
    }
}
