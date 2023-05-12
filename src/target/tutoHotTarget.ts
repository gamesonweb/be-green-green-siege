import * as BABYLON from 'babylonjs';
import { Targetable } from './targetable';

export class TutoHotTarget extends Targetable {
    private _scene: BABYLON.Scene;
    private _targetModel: BABYLON.Mesh;
    private _material: BABYLON.StandardMaterial;

    private _isTouched: boolean = false;
    private _redFactor: number = 0;

    /**
     * Constructor
     * @param scene The scene
     * @param position The position
     */
    public constructor(scene: BABYLON.Scene, position: BABYLON.Vector3) {
        super();
        this._scene = scene;

        this._targetModel = BABYLON.MeshBuilder.CreateBox('targetHitBox', { size: 2 }, this._scene);
        this._targetModel.position = position;
        this._targetModel.metadata = { parentClass: this };

        this._material = new BABYLON.StandardMaterial('targetMaterial', this._scene);
        this._targetModel.material = this._material;
        (this._targetModel.material as BABYLON.StandardMaterial).diffuseColor = new BABYLON.Color3(0, 1, 0); // Initialement vert
    }

    /**
     * Dispose the target
     */
    public dispose(): void {
        this._targetModel.dispose();
        this._material.dispose();
    }

    /**
     * Touch the target
     */
    public touch(): void {
        if (!this._isTouched) {
            this._redFactor = Math.min(this._redFactor + 0.2, 1);
            this._isTouched = true;
            setTimeout(() => {
                this._isTouched = false;
            }, 100);
        }
    }

    /**
     * Animate the target
     * @param deltaTime The time since the last frame
     */
    public animate(deltaTime: number): void {
        this._redFactor = Math.max(this._redFactor - 0.5 * deltaTime, 0);
        this.animateColorChange();
    }

    /**
     * Animate color change
     */
    private animateColorChange(): void {
        const targetColor = new BABYLON.Color3(this._redFactor, 1 - this._redFactor, 0);
        (this._targetModel.material as BABYLON.StandardMaterial).diffuseColor = targetColor;
    }

    /**
     * Get informations about if the target is touched
     * @returns true if the target is touched
     */
    public get isTouched(): boolean {
        return this._isTouched;
    }
}
