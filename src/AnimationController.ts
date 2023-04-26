import * as BABYLON from 'babylonjs';
import timeControl from './TimeControl';

interface AnimationConfig {
    name: AnimationName;
    loop: boolean;
    speedRatio: number;
}

export enum AnimationName {
    BarelShot = 'BarelShot',
    OverHeatBack = 'OverHeatBack',
    OverHeatFront = 'OverHeatFront',
    GunIdle = 'GunIdle',
    ObservatoirRotation = 'n2b2Action.001',
}

class AnimationController {
    private readonly ANIMATION_CONFIGS: AnimationConfig[] = [
        { name: AnimationName.BarelShot, loop: false, speedRatio: 2.3 },
        { name: AnimationName.OverHeatBack, loop: false, speedRatio: 1.8 },
        { name: AnimationName.OverHeatFront, loop: false, speedRatio: 1.8 },
        { name: AnimationName.GunIdle, loop: true, speedRatio: 1 },
        { name: AnimationName.ObservatoirRotation, loop: true, speedRatio: 0.1 },
    ];

    private _animations: Map<AnimationName, BABYLON.AnimationGroup> = new Map();

    public addAnimation(animation: BABYLON.AnimationGroup): void {
        const config = this.ANIMATION_CONFIGS.find((cfg) => cfg.name === animation.name);
        if (config) {
            animation.loopAnimation = config.loop;
            animation.speedRatio = config.speedRatio;
            this._animations.set(config.name, animation);
        } else {
            console.warn(`Animation configuration not found for "${animation.name}"`);
        }
    }

    public playAnimation(name: AnimationName, playInReverse: boolean = false): void {
        const animation = this._animations.get(name);
        const config = this.ANIMATION_CONFIGS.find((cfg) => cfg.name === name);
        if (animation && config) {
            let speedRatio = (playInReverse ? -config.speedRatio : config.speedRatio) * timeControl.getTimeScale();

            // There is a bug in BabylonJS that causes an issue with the animation when the speed ratio is exactly 0.
            // To work around this bug, we set the speed ratio to a very low value.
            // This allows us to bypass the problem without significantly affecting the animation speed.
            if (speedRatio === 0) {
                speedRatio = playInReverse ? 1e-100 : -1e-100;
            }

            animation.start(animation.loopAnimation, speedRatio);
        } else {
            console.warn(`Animation "${name}" not found or configuration not found for "${name}."`);
        }
    }

    public updateSpeedRatio(timeScale: number): void {
        for (const animation of Array.from(this._animations.values())) {
            const config = this.ANIMATION_CONFIGS.find((cfg) => cfg.name === animation.name);
            if (config) {
                const currentSpeed = animation.speedRatio;
                let updatedSpeed = (currentSpeed > 0 ? config.speedRatio : -config.speedRatio) * timeScale;

                // There is a bug in BabylonJS that causes an issue with the animation when the speed ratio is exactly 0.
                // To work around this bug, we set the speed ratio to a very low value.
                // This allows us to bypass the problem without significantly affecting the animation speed.
                if (updatedSpeed === 0) {
                    updatedSpeed = currentSpeed > 0 ? 1e-100 : -1e-100;
                }

                animation.speedRatio = updatedSpeed;
            } else {
                console.warn(`Animation configuration not found for "${animation.name}"`);
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
