import * as BABYLON from 'babylonjs';
import { SoundsBank } from './soundsBank';
import { Game } from '../game';

export class SoundPlayer {
    private _id: string;
    private _mesh: BABYLON.Mesh;
    private _sound: BABYLON.Sound;
    private _volume: number;

    public constructor(name: string, volume: number, scene: BABYLON.Scene, mesh?: BABYLON.Mesh) {
        this._id = name + '_' + Math.random() * 1000000;
        this._volume = volume;
        // init sound
        if (mesh !== undefined) {
            this._mesh = mesh;

            this._sound = new BABYLON.Sound(this._id, SoundsBank.getPathByName(name), scene, null, {
                spatialSound: true,
                maxDistance: 20000,
            });

            this._sound.attachToMesh(this._mesh);
            this._sound.setLocalDirectionToMesh(scene.activeCamera.position);
            this._sound.setVolume(this._volume / (1 + BABYLON.Vector3.Distance(this._mesh.position, Game.player.getHeadPosition())));
        } else {
            this._sound = new BABYLON.Sound(this._id, SoundsBank.getPathByName(name), scene, null, {
                spatialSound: true,
                maxDistance: 20000,
            });
            this._sound.setLocalDirectionToMesh(scene.activeCamera.position);
            this._sound.setVolume(this._volume);
        }
        // console.log(this._sound.name);
        Game.sounds.push(this);
        // console.log(this._sound.getPlaybackRate());
        // console.log(name, " is ", this._mesh);
    }

    public setPosition(position: BABYLON.Vector3) {
        this._sound.setPosition(position);
    }

    public setAutoplay(bool: boolean) {
        this._sound.autoplay = bool;
    }

    public play(ignoreIsPlaying: boolean = false): void {
        // update distance
        if(this._mesh !== undefined) {
            this._sound.setVolume(this._volume / (1 + BABYLON.Vector3.Distance(this._mesh.position, Game.player.getHeadPosition())));
        }
        if(ignoreIsPlaying) {
            // e.g. laser shot
            this._sound.play();
        } else if (!this._sound.isPlaying) {
            this._sound.play();
            // console.log(this._id, "-> : tutu");
        }
    }

    public setPitch(rate: number) {
        this._sound.setPlaybackRate(rate);
    }

    public stopAndDispose(): void {
        if (this._mesh !== undefined) {
            this._sound.detachFromMesh();
        }
        this._sound.stop();
        this._sound.dispose();
        // update Game.sounds
        const index = Game.sounds.indexOf(this);
        if (index !== -1) {
            Game.sounds.splice(index, 1);
        }

    }

    public playWithRepeater(second: number) {
        setInterval(() => {
            this._sound.play();
        }, second * 1000);
    }

    public getName(): string {
        return this._id;
    }

    public isPlaying(): boolean {
        return this._sound.isPlaying;
    }
}
