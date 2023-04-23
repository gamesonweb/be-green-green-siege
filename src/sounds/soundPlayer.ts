import * as BABYLON from 'babylonjs';
import * as fs from 'fs';
import {SoundsBank} from './soundsBank';

export class SoundPlayer {

    private sound: BABYLON.Sound;

    public constructor(name: string, volume: number, scene: BABYLON.Scene, source?: BABYLON.Mesh) {
        // init sound 
        if(source !== undefined) {
            let random = source.toString();
            console.log(random);
            this.sound = new BABYLON.Sound(name + random, SoundsBank.getPathByName(name), scene, null, {
                spatialSound: true
            });
            this.sound.attachToMesh(source);
            this.sound.setVolume(volume / (1 + BABYLON.Vector3.Distance(source.position, scene.activeCamera.position)));
        } else {
            this.sound = new BABYLON.Sound(name, SoundsBank.getPathByName(name), scene, null, {
                spatialSound: true
            });
            this.sound.setVolume(volume);
        }
    }

    public play(randomDelay: boolean): void {
        if(randomDelay === true) {
            this.sound.play(Math.random() * 10);
        } else {
            this.sound.play();
        }
    }

    public stop(): void {
        this.sound.stop();
    }

    public playWithRepeater(second: number) {
        setInterval(() => {
            this.sound.play(Math.random() * 10);
        }, second * 1000);
    }

}
