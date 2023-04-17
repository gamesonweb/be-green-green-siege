import * as BABYLON from 'babylonjs';
import { Targetable } from './targetable';

export class TestTarget extends Targetable {
    private _scene: BABYLON.Scene;

    private _targetModel: BABYLON.Mesh;

    private readonly _RESET_TOUCHE_TIME: number = 1;
    private _secondCounter: number;

    private _isTouched: boolean = false;

    private _touchedColor: BABYLON.Color3;
    private _untouchedColor: BABYLON.Color3;

    private _currentColor: BABYLON.Color3;

    public constructor(scene: BABYLON.Scene, position: BABYLON.Vector3) {
        super();
        this._scene = scene;

        this._touchedColor = new BABYLON.Color3(1, 0, 0);
        this._untouchedColor = new BABYLON.Color3(0, 1, 0);

        this._secondCounter = this._RESET_TOUCHE_TIME;

        this._targetModel = BABYLON.MeshBuilder.CreateBox('target', { size: 2 }, this._scene);
        this._targetModel.position = position;
        this._targetModel.metadata = { parentClass: this };

        const material = new BABYLON.StandardMaterial('targetMaterial', this._scene);
        this._targetModel.material = material;

        this._currentColor = this._untouchedColor.clone();
        (this._targetModel.material as BABYLON.StandardMaterial).diffuseColor = this._currentColor;
    }

    animate(deltaTime: number): void {
        if (this._isTouched) {
            this._secondCounter -= deltaTime;
            if (this._secondCounter <= 0) {
                this._secondCounter = this._RESET_TOUCHE_TIME;
                this._isTouched = false;
            }

            // Calculez la proportion du temps écoulé
            const lerpAmount = 1 - this._secondCounter / this._RESET_TOUCHE_TIME;

            if (lerpAmount === 0) {
                this._currentColor = this._untouchedColor.clone();
            } else {
                // Interpolez entre les deux couleurs
                this._currentColor = BABYLON.Color3.Lerp(this._touchedColor, this._untouchedColor, lerpAmount);

                // Mettez à jour la couleur de la matière
                (this._targetModel.material as BABYLON.StandardMaterial).diffuseColor = this._currentColor;
            }
        }
    }

    dispose(): void {
        this._targetModel.dispose();
    }

    public touch(): void {
        this._isTouched = true;
    }
}
