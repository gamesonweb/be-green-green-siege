import * as BABYLON from 'babylonjs';
import { Targetable } from './targetable';

export class TutoTarget extends Targetable {
    private _scene: BABYLON.Scene;
    private _targetModel: BABYLON.Mesh;
    private _material: BABYLON.StandardMaterial;

    private _isTouched: boolean = false;

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
        (this._targetModel.material as BABYLON.StandardMaterial).diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
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
        this.dispose();
        this._isTouched = true;
    }

    /**
     * Get informations about if the target is touched
     * @returns true if the target is touched
     */
    public get isTouched(): boolean {
        return this._isTouched;
    }
}
