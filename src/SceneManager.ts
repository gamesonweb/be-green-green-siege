import * as BABYLON from 'babylonjs';
import { animations } from './AnimationController';

export default class SceneManager {
    static configureLights(scene: BABYLON.Scene) {
        let upperLight = scene.getLightByName('UpperSun');
        let underLight = scene.getLightByName('DownSun');
        upperLight.intensity = 1;
        underLight.intensity = 1;

        let lightTest = new BABYLON.HemisphericLight('lightTest', new BABYLON.Vector3(0, 1, 0), scene);
        lightTest.direction = new BABYLON.Vector3(0, 1, 0);
        lightTest.intensity = 0.5;
    }

    static configureMaterials(scene: BABYLON.Scene) {
        let mat = ['m1.002', 'm10.002', 'm3.002', 'm2.003', 'm14'];
        mat.forEach((materialName) => {
            let material = scene.getMaterialByName(materialName) as BABYLON.PBRMaterial;
            material.metallicF0Factor = 0;
        });
    }

    static initPlatform(tasks: BABYLON.MeshAssetTask): void {
        tasks.onSuccess = (task) => {
            task.loadedMeshes.forEach((mesh) => {
                if (mesh.name.includes('HitBox')) {
                    mesh.visibility = 0;
                }
            });

            task.loadedAnimationGroups.forEach((animationGroup) => {
                console.log(animationGroup.name);
                animationGroup.loopAnimation = true;
                animationGroup.start();
                animationGroup.speedRatio = 0.1;
            });
        };
    }

    static initShield(tasks: BABYLON.MeshAssetTask): void {
        tasks.onSuccess = (task) => {
            task.loadedMeshes.forEach((mesh) => {
                if (mesh.name == '__root__') {
                    mesh.name = 'ShieldGrip';
                }
            });
        };
    }

    static initGun(tasks: BABYLON.MeshAssetTask): void {
        tasks.onSuccess = (task) => {
            task.loadedMeshes.forEach((mesh) => {
                if (mesh.name == '__root__') {
                    mesh.name = 'GunParent';
                } else if (mesh.name == 'GunLaser' || mesh.name == 'GunBack') {
                    mesh.visibility = 0;
                }
            });

            task.loadedAnimationGroups.forEach((animationGroup) => {
                console.log(animationGroup.name);

                if (animationGroup.name == 'BarelShot') {
                    animationGroup.loopAnimation = false;
                    animationGroup.stop();
                    animations.BarelShot = animationGroup;
                } else if (animationGroup.name == 'OverHeatBack') {
                    animationGroup.loopAnimation = false;
                    animationGroup.stop();
                    animations.overHeatBack = animationGroup;
                } else if (animationGroup.name == 'OverHeatFront') {
                    animationGroup.loopAnimation = false;
                    animationGroup.stop();
                    animations.overHeatFront = animationGroup;
                } else if (animationGroup.name == 'GunIdle') {
                    console.log('GunEnergyAction');

                    animationGroup.loopAnimation = true;
                    animationGroup.play(true);
                    animations.gunIdle = animationGroup;
                }
            });
        };
    }

    static initRobot(tasks: BABYLON.MeshAssetTask): void {
        tasks.onSuccess = (task) => {
            task.loadedMeshes.forEach((mesh) => {
                console.log(mesh.name);
                if (mesh.name == 'Robot') {
                    mesh.parent = null;
                }
                if (mesh.name == 'HitBox') {
                    mesh.isVisible = false;
                    mesh.visibility = 0;
                }
            });
        };
    }
}
