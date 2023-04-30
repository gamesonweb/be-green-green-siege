import * as BABYLON from 'babylonjs';
import timeControl from './TimeControl';

/**
 * The animation configuration.
 */
interface AnimationConfig {
    name: AnimationName;
    loop: boolean;
    speedRatio: number;
}

/**
 * The names of the animations.
 * These names are used to play animations on meshes.
 * The names are also used to identify animations in the animation controller.
 * @enum {string}
 */
export enum AnimationName {
    BarrelShot = 'BarelShot_channel0_0',
    OverHeatBack = 'OverHeatBack_channel0_0',
    OverHeatFront = 'OverHeatFront_channel0_0',
    GunIdle = 'GunIdle_channel0_0',
    ObservatoryRotation = 'n2b2Action.001_channel0_0',
    RightLaserBack = 'RightLaserAction_channel0_0',
    LeftLaserBack = 'LeftLaserAction_channel0_0',
}

/**
 * The animation controller.
 * This class is responsible for playing animations on meshes.
 */
class AnimationController {
    private _scene: BABYLON.Scene;

    private readonly ANIMATION_CONFIGS: AnimationConfig[] = [
        { name: AnimationName.BarrelShot, loop: false, speedRatio: 2.3 },
        { name: AnimationName.OverHeatBack, loop: false, speedRatio: 1.8 },
        { name: AnimationName.OverHeatFront, loop: false, speedRatio: 1.8 },
        { name: AnimationName.GunIdle, loop: true, speedRatio: 1 },
        { name: AnimationName.ObservatoryRotation, loop: true, speedRatio: 0.1 },
        { name: AnimationName.RightLaserBack, loop: false, speedRatio: 2 },
        { name: AnimationName.LeftLaserBack, loop: false, speedRatio: 2 },
    ];

    /**
     * Initializes the animation controller.
     * @param {BABYLON.Scene} scene - The scene to animate.
     */
    public init(scene: BABYLON.Scene): void {
        this._scene = scene;
    }

    private _animatables: BABYLON.Animatable[] = [];

    /**
     * Begins animation for the provided mesh and its child meshes recursively.
     *
     * @param {BABYLON.AbstractMesh} mesh - The mesh to animate.
     * @param {AnimationName} animationName - The name of the animation to play.
     * @param {boolean} loop - Whether the animation should loop.
     * @param {number} speedRatio - The speed ratio of the animation playback.
     * @returns {boolean} Whether the animation was found.
     */
    private recursiveBeginAnimation(mesh: BABYLON.AbstractMesh, animationName: AnimationName, loop: boolean, speedRatio: number): boolean {
        const animationNames = mesh.animations.map((animation) => animation.name);
        let animationFound = false;

        if (animationNames.includes(animationName)) {
            const animation = mesh.animations.find((animation) => animation.name === animationName);
            const animationFrames = animation.getHighestFrame();

            const startFrame = speedRatio >= 0 ? 0 : animationFrames;
            const endFrame = speedRatio >= 0 ? animationFrames : 0;

            const animatable = this._scene.beginAnimation(mesh, startFrame, endFrame, loop, speedRatio);
            animatable.onAnimationEnd = () => {
                const index = this._animatables.indexOf(animatable);
                if (index !== -1) {
                    this._animatables.splice(index, 1);
                }
            };
            this._animatables.push(animatable);
            animationFound = true;
        }

        mesh.getChildMeshes().forEach((childMesh) => {
            animationFound = this.recursiveBeginAnimation(childMesh, animationName, loop, speedRatio) || animationFound;
        });

        return animationFound;
    }

    /**
     * Plays the animation for the provided mesh.
     * @param {BABYLON.AbstractMesh} mesh - The mesh to animate.
     * @param {AnimationName} name - The name of the animation to play.
     * @param {boolean} playInReverse - Whether the animation should play in reverse.
     */
    public playAnimation(mesh: BABYLON.AbstractMesh, name: AnimationName, playInReverse: boolean = false): void {
        const config = this.ANIMATION_CONFIGS.find((cfg) => cfg.name === name);
        if (config) {
            let speedRatio = (playInReverse ? -config.speedRatio : config.speedRatio) * timeControl.getTimeScale();

            // There is a bug in BabylonJS that causes an issue with the animation when the speed ratio is exactly 0.
            // To work around this bug, we set the speed ratio to a very low value.
            // This allows us to bypass the problem without significantly affecting the animation speed.
            if (speedRatio === 0) {
                speedRatio = playInReverse ? 1e-100 : -1e-100;
            }

            const animationFound = this.recursiveBeginAnimation(mesh, name, config.loop, speedRatio);
            if (!animationFound) {
                console.warn(`Animation "${name}" not found on mesh "${mesh.name}".`);
            }
        } else {
            console.warn(`Animation "${name}" not found or configuration not found for "${name}."`);
        }
    }

    /**
     * Updates the speed ratio of all animations.
     * @param {number} timeScale - The time scale to apply to the animations.
     */
    public updateSpeedRatio(timeScale: number): void {
        for (const animatable of Array.from(this._animatables)) {
            const animationNames = animatable.getAnimations().map((animation) => animation.animation.name);

            for (const name of animationNames) {
                const config = this.ANIMATION_CONFIGS.find((cfg) => cfg.name === name);

                if (config) {
                    const currentSpeed = animatable.speedRatio;
                    let updatedSpeed = (currentSpeed > 0 ? config.speedRatio : -config.speedRatio) * timeScale;

                    if (updatedSpeed === 0) {
                        updatedSpeed = currentSpeed > 0 ? 1e-100 : -1e-100;
                    }
                    animatable.speedRatio = updatedSpeed;
                }
            }
        }
    }
}

const animations = new AnimationController();

// Call this function whenever the user changes the time scale.
function onTimeScaleChanged(newTimeScale: number): void {
    animations.updateSpeedRatio(newTimeScale);
}

export { animations, onTimeScaleChanged };
