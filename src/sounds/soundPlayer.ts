import * as BABYLON from 'babylonjs';
import data from '../assets/sound/sounds.json';
import { Game } from '../game';

export class SoundPlayer {
    private _id: string;
    private _mesh: BABYLON.Mesh;
    private _sound: BABYLON.Sound;

    private _curentTime: number = 0;

    public constructor(name: string, scene: BABYLON.Scene, mesh?: BABYLON.Mesh) {
        this._id = name + '_' + Math.random() * 1000000;
        this._sound = new BABYLON.Sound(this._id, data[name].file, scene, null);
        this._sound.spatialSound = data[name].spatialized;
        this._sound.setVolume(data[name].volume);
        // init sound
        if (mesh !== undefined) {
            this._mesh = mesh;
            this._sound.attachToMesh(this._mesh);
        }
        BABYLON.Engine.audioEngine.audioContext?.resume();
        Game.sounds.push(this);
    }

    public setPosition(position: BABYLON.Vector3) {
        this._sound.setPosition(position);
    }

    public setAutoplay(bool: boolean) {
        this._sound.autoplay = bool;
    }

    public setVolume(volume: number, time?: number) {
        if (time !== undefined) {
            this._sound.setVolume(volume, time);
        } else {
            this._sound.setVolume(volume);
        }
    }

    public play(ignoreIsPlaying: boolean = false): void {
        if (this._sound.isPaused) {
            this._sound.setPlaybackRate(1);
            this._sound.play(0, this._curentTime);
        } else if (ignoreIsPlaying) {
            this._sound.play();
        } else if (!this._sound.isPlaying) {
            this._sound.play();
        }
    }

    public setPitch(rate: number) {
        this._sound.setPlaybackRate(rate);
    }

    public pause(): void {
        this._sound.pause();
        this._curentTime = this._sound.currentTime;
    }

    public setLoop(bool: boolean): void {
        this._sound.loop = bool;
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

    public getVolume(): number {
        return this._sound.getVolume();
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
