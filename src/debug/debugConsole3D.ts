import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export default class Debug3D {
    public log: String;

    private _plane: BABYLON.Mesh;
    private _debugPanel: GUI.TextBlock;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;

    constructor(scene: BABYLON.Scene, camera: BABYLON.FreeCamera) {
        this._scene = scene;
        this._camera = camera;
        this.log = '';
        this.initDebugPanel();
    }

    private initDebugPanel(): void {
        this._plane = BABYLON.MeshBuilder.CreatePlane('debugPanel', { width: 1, height: 0.25 }, this._scene);
        this._plane.parent = this._camera;
        this._plane.isVisible = false;

        const forward = new BABYLON.Vector3(0, -0.2, 1);
        this._plane.position = this._camera.getDirection(forward).scale(2);

        const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(this._plane, 1024, 256, true);

        const debugPanel = new GUI.Rectangle('debugPanel');
        debugPanel.width = 0.5;
        debugPanel.height = '200px';
        debugPanel.color = 'white';
        debugPanel.thickness = 4;
        debugPanel.background = 'black';
        debugPanel.alpha = 0.5;
        debugPanel.isHitTestVisible = false;
        advancedTexture.addControl(debugPanel);

        this._debugPanel = new GUI.TextBlock();
        this._debugPanel.color = 'white';
        this._debugPanel.fontSize = 24;
        debugPanel.addControl(this._debugPanel);
    }

    public updateFps(fps: string): void {
        this._debugPanel.text = `Debug Info\n${fps}\n\n ${this.log}`;
    }

    public toggleDebug() {
        this._plane.isVisible = !this._plane.isVisible;
    }
}
