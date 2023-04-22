import * as BABYLON from 'babylonjs';

/**
 * Star counts for each color.
 */
export interface StarCounts {
    Y: number;
    B: number;
    W: number;
    R: number;
}

/**
 * A class to manage the stars in the background.
 */
export class StarManager {
    private readonly _scene: BABYLON.Scene;
    private readonly _radius: number;
    private readonly _starCounts: StarCounts;
    private readonly _starSystems: Map<string, BABYLON.ParticleSystem>;

    /**
     * Creates a new star manager.
     * @param scene scene to create the stars in
     * @param radius radius of the sphere to create the stars on
     * @param starCounts number of stars to create for each color
     */
    constructor(scene: BABYLON.Scene, radius: number, starCounts: StarCounts) {
        this._scene = scene;
        this._radius = radius;
        this._starCounts = starCounts;
        this._starSystems = new Map();

        // Create particle systems for each color
        for (const color of Object.keys(starCounts) as ('Y' | 'W' | 'B' | 'R')[]) {
            const starSystem = this.createStarSystem(color);
            this._starSystems.set(color, starSystem);
        }
    }

    /**
     * Creates a particle system for the given color.
     * @param color color of the stars to create
     * @returns the created particle system
     */
    private createStarSystem(color: 'Y' | 'W' | 'B' | 'R'): BABYLON.ParticleSystem {
        const numberOfStars = this._starCounts[color];
        const starSystem = new BABYLON.ParticleSystem(`stars_${color}`, numberOfStars, this._scene);

        starSystem.particleTexture = new BABYLON.Texture(`./assets/flare/flare${color}.png`, this._scene);
        starSystem.emitter = new BABYLON.Vector3(0, 0, 0);
        starSystem.minSize = 0.5;
        starSystem.maxSize = 1.5;
        starSystem.maxLifeTime = 20000000;
        starSystem.minLifeTime = 1;
        starSystem.minEmitPower = 0;
        starSystem.maxEmitPower = 0;
        starSystem.updateSpeed = 160;

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
        const x = this._radius * Math.sin(phi) * Math.cos(theta);
        const y = this._radius * Math.sin(phi) * Math.sin(theta);
        const z = this._radius * Math.cos(phi);

        // Modification ici pour limiter les étoiles aux deux tiers supérieurs de la sphère
        if (y < -this._radius / 4 || z > this._radius - 10) {
            return this.randomSpherePoint();
        }

        return new BABYLON.Vector3(x, y, z);
    }

    /**
     * Gets the particle system for the given color.
     * @param color color of the star system to get
     * @returns the particle system for the given color
     */
    public getStarSystem(color: 'Y' | 'W' | 'B' | 'R'): BABYLON.ParticleSystem | undefined {
        return this._starSystems.get(color);
    }

    /**
     * Disposes the star manager.
     */
    public dispose() {
        const starSystemsArray = Array.from(this._starSystems.values());
        for (const starSystem of starSystemsArray) {
            starSystem.dispose();
        }
        this._starSystems.clear();
    }
}
