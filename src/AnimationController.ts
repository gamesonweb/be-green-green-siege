import * as BABYLON from 'babylonjs';

class AnimationController {

    BarelShot: BABYLON.AnimationGroup;
    GunShot: BABYLON.AnimationGroup;
    overHeatBack: BABYLON.AnimationGroup;
    overHeatFront: BABYLON.AnimationGroup;


    public playAnimation(animation: BABYLON.AnimationGroup, loop: boolean = false, speedRatio: number = 1): void {
        animation.reset();
        animation.start(loop, speedRatio);
    }
    
}

const animations = new AnimationController();

export {animations}