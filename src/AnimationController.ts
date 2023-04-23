import * as BABYLON from 'babylonjs';

class AnimationController {
    public BarelShot: BABYLON.AnimationGroup;
    public overHeatBack: BABYLON.AnimationGroup;
    public overHeatFront: BABYLON.AnimationGroup;
    public gunIdle: BABYLON.AnimationGroup;

    public playAnimation(animation: BABYLON.AnimationGroup, loop: boolean = false, speedRatio: number = 1): void {
        animation.reset();
        animation.start(loop, speedRatio);
    }

    public setSpeedRatio(speedRatio: number): void {
        this.BarelShot.speedRatio = speedRatio;
        this.overHeatBack.speedRatio = speedRatio;
        this.overHeatFront.speedRatio = speedRatio;
        this.gunIdle.speedRatio = speedRatio;
    }
}

const animations = new AnimationController();

export { animations };
