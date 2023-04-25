import * as BABYLON from 'babylonjs';
import { AnimationName, animations } from './AnimationController';

export default class SceneManager {
    static configureLights(scene: BABYLON.Scene) {
        let upperLight = scene.getLightByName('UpperSun');
        let underLight = scene.getLightByName('DownSun');
        upperLight.intensity = 1;
        underLight.intensity = 1;

        let hemisphericTreeIsland = new BABYLON.HemisphericLight('hemisphericTreeIsland', new BABYLON.Vector3(0, 1, 0), scene);
        hemisphericTreeIsland.direction = new BABYLON.Vector3(0, 1, 0);
        hemisphericTreeIsland.intensity = 0.5;
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
                animations.addAnimation(animationGroup);
            });
            animations.playAnimation(AnimationName.ObservatoirRotation);
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
                animations.addAnimation(animationGroup);
            });
            animations.playAnimation(AnimationName.GunIdle);
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
