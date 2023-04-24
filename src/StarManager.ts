import * as BABYLON from 'babylonjs';

/**
 * Star counts for each color.
 */
type StarCounts = {
    Y: number;
    B: number;
    W: number;
    R: number;
};

type StarColor = keyof StarCounts;

/**
 * A class to manage the stars in the background.
 */
class StarManager {
    private static _instance: StarManager;

    private _scene: BABYLON.Scene;
    private readonly _radius: number;
    private readonly _starCounts: StarCounts;
    private readonly _starSystems: Map<StarColor, BABYLON.ParticleSystem>;
    private _shootingStarSystem: BABYLON.ParticleSystem;
    private _timeSpeedFactor: number;

    private constructor(radius: number, starCounts: StarCounts) {
        this._radius = radius;
        this._starCounts = starCounts;
        this._starSystems = new Map<StarColor, BABYLON.ParticleSystem>();
        this._timeSpeedFactor = 1;
    }

    /**
     * Initializes the star manager.
     * @param scene The scene.
     */
    public init(scene: BABYLON.Scene): void {
        this._scene = scene;
        this._shootingStarSystem = this.createShootingStar();
        this._shootingStarSystem.start();

        for (const color in this._starCounts) {
            const starSystem = this.createStarSystem(color as StarColor);
            this._starSystems.set(color as StarColor, starSystem);
        }
    }

    /**
     * Returns the instance of the star manager.
     * @param radius radius of the sphere
     * @param starCounts star counts for each color
     * @returns the instance of the star manager
     */
    public static getInstance(radius: number, starCounts: StarCounts): StarManager {
        if (!StarManager._instance) {
            StarManager._instance = new StarManager(radius, starCounts);
        }
        return StarManager._instance;
    }

    /**
     * Creates a particle system for the given color.
     * @param color color of the stars to create
     * @returns the created particle system
     */
    private createStarSystem(color: StarColor): BABYLON.ParticleSystem {
        const numberOfStars = this._starCounts[color];
        const starSystem = new BABYLON.ParticleSystem(`stars_${color}`, numberOfStars, this._scene);

        starSystem.particleTexture = new BABYLON.Texture(`./assets/flare/flare${color}.png`, this._scene);
        starSystem.emitter = BABYLON.Vector3.Zero();
        starSystem.minSize = 0.5;
        starSystem.maxSize = 1.5;
        starSystem.minLifeTime = 1;
        starSystem.maxLifeTime = 2e7;
        starSystem.minEmitPower = starSystem.maxEmitPower = 0;
        starSystem.updateSpeed = 160 * this._timeSpeedFactor;

        starSystem.startPositionFunction = (worldMatrix, positionToUpdate) => {
            const position = this.randomSpherePoint();
            BABYLON.Vector3.TransformCoordinatesToRef(position, worldMatrix, positionToUpdate);
        };

        starSystem.start();
        return starSystem;
    }

    /**
     * Returns a random point on a sphere.
     * @returns a random point on a sphere
     */
    private randomSpherePoint(): BABYLON.Vector3 {
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        const sinPhi = Math.sin(phi);
        const x = this._radius * sinPhi * Math.cos(theta);
        const y = this._radius * sinPhi * Math.sin(theta);
        const z = this._radius * Math.cos(phi);

        // Limit the space where the stars can be created to avoid them being hidden by the ground and the tree
        if (y < -this._radius / 4 || z > this._radius - 10) {
            return this.randomSpherePoint();
        }

        return new BABYLON.Vector3(x, y, z);
    }

    /**
     * Creates the particle system for the shooting star.
     * @returns the created particle system
     */
    private createShootingStar(): BABYLON.ParticleSystem {
        const shootingStarSystem = new BABYLON.ParticleSystem('shooting_star', 1, this._scene);

        shootingStarSystem.particleTexture = new BABYLON.Texture('./assets/flare/flareW.png', this._scene);
        shootingStarSystem.emitter = BABYLON.Vector3.Zero();
        shootingStarSystem.minSize = 0.5;
        shootingStarSystem.maxSize = 2;
        shootingStarSystem.minLifeTime = 0.5;
        shootingStarSystem.maxLifeTime = 3;
        shootingStarSystem.minEmitPower = 20;
        shootingStarSystem.maxEmitPower = 30;
        shootingStarSystem.updateSpeed = 0.04 * this._timeSpeedFactor;

        shootingStarSystem.startPositionFunction = (worldMatrix, positionToUpdate) => {
            const position = this.randomSpherePoint();
            BABYLON.Vector3.TransformCoordinatesToRef(position, worldMatrix, positionToUpdate);
        };

        shootingStarSystem.direction1 = new BABYLON.Vector3(-5, 0, 5);
        shootingStarSystem.direction2 = new BABYLON.Vector3(5, 0, 5);

        return shootingStarSystem;
    }

    /**
     * Gets the particle system for the given color.
     * @param color color of the star system to get
     * @returns the particle system for the given color
     */
    public getStarSystem(color: StarColor): BABYLON.ParticleSystem | undefined {
        return this._starSystems.get(color);
    }

    /**
     * Sets the time speed factor.
     * @param factor time speed factor
     */
    public setTimeSpeedFactor(factor: number): void {
        this._timeSpeedFactor = factor;
        const starSystemsArray = Array.from(this._starSystems.values());
        for (const starSystem of starSystemsArray) {
            starSystem.updateSpeed = 160 * this._timeSpeedFactor;
        }
        this._shootingStarSystem.updateSpeed = 0.04 * this._timeSpeedFactor;
    }

    /**
     * Disposes the star manager.
     */
    public dispose(): void {
        const starSystemsArray = Array.from(this._starSystems.values());
        for (const starSystem of starSystemsArray) {
            starSystem.dispose();
        }
        this._starSystems.clear();
        this._shootingStarSystem.dispose();
    }
}

const starManager = StarManager.getInstance(400, { Y: 266, W: 1066, B: 66, R: 66 });
export default starManager;
