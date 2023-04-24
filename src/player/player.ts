import * as BABYLON from 'babylonjs';
import Logger from '../debug/logger';
import { Game } from '../game';
import { Targetable } from '../target/targetable';

export class Player extends Targetable {
    private _scene: BABYLON.Scene;
    private _currentLife: number;
    private readonly _initialLife: number = 100;
    private _bodyMesh: BABYLON.Mesh;
    private _headMesh: BABYLON.Mesh;

    constructor(scene: BABYLON.Scene) {
        super();
        this._scene = scene;
        this._currentLife = this._initialLife;
        this._headMesh = this.initHeadPlayer(this._scene);
        this._bodyMesh = this.initBodyPlayerModel(this._scene);
    }

    private initHeadPlayer(scene: BABYLON.Scene): BABYLON.Mesh {
        const head = BABYLON.MeshBuilder.CreateBox('player_head_HitBox', { width: 0.4, height: 0.4, depth: 0.05 }, scene);
        head.metadata = { parentClass: this };
        head.isVisible = false;
        return head;
    }

    private initBodyPlayerModel(scene: BABYLON.Scene): BABYLON.Mesh {
        const body = BABYLON.MeshBuilder.CreateBox('player_body_HitBox', { width: 0.55, height: 0.6, depth: 0.3 }, scene);
        body.metadata = { parentClass: this };
        body.isVisible = false;
        return body;
    }

    public get currentLife(): number {
        return this._currentLife;
    }

    public get getBodyPosition(): BABYLON.Vector3 {
        return this._bodyMesh.position;
    }

    public get getHeadPosition(): BABYLON.Vector3 {
        return this._headMesh.position;
    }

    public touch(): void {
        this._currentLife -= 10;
        Game.hapticManager.vibrateController('all', 0.8, 60);
        Game.hapticManager.vibrateController('all', 0.8, 60, 200);
        Logger.log('Player touched');
    }

    private updatePlayerModelPosition = () => {
        let camera: BABYLON.Camera;
        if (Game.vrSupported) {
            camera = this._scene.activeCamera;
        } else {
            camera = this._scene.getCameraByName('PlayerNoVRCamera');
        }

        this._headMesh.parent = camera;
        this._headMesh.computeWorldMatrix(true);

        const headRotationQuaternion = BABYLON.Quaternion.FromRotationMatrix(this._headMesh.getWorldMatrix());
        const headYaw = headRotationQuaternion.toEulerAngles().y;
        const bodyRotation = BABYLON.Quaternion.FromEulerAngles(0, headYaw, 0);
        this._bodyMesh.rotationQuaternion = bodyRotation;

        const bodyOffset = new BABYLON.Vector3(0, -0.42, -0.1);
        const rotatedBodyOffset = bodyOffset.rotateByQuaternionAroundPointToRef(headRotationQuaternion, BABYLON.Vector3.Zero(), new BABYLON.Vector3());

        this._bodyMesh.setAbsolutePosition(this._headMesh.getAbsolutePosition().add(rotatedBodyOffset));
        this._bodyMesh.absolutePosition.y -= 10.42;
    };

    public animate(deltaTime: number) {
        this.updatePlayerModelPosition();
    }
}
