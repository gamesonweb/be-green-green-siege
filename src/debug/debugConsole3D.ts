import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export default class Debug3D {
    public log: String;

    private _plane: BABYLON.Mesh;
    private _debugPanel: GUI.TextBlock;
    private _scene: BABYLON.Scene;

    constructor(scene: BABYLON.Scene) {
        this._scene = scene;
        this.log = '';
        this.initDebugPanel();
    }

    private initDebugPanel(): void {
        this._plane = BABYLON.MeshBuilder.CreatePlane('debugPanel', { width: 1, height: 0.25 }, this._scene);
        this._plane.isVisible = false;

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

    public update(fps: string): void {
        this._debugPanel.text = `Debug Info\n${fps}\n\n ${this.log}`;

        // Update the position of the debug panel
        const camera = this._scene.activeCamera;
        const cameraPosition = camera.position;
        const forward = new BABYLON.Vector3(0, -0.2, 1);
        this._plane.position = cameraPosition.add(camera.getDirection(forward).scale(2));

        // Rotate the debug panel to face the camera
        this._plane.lookAt(cameraPosition);
        this._plane.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
    }

    public toggleDebug() {
        this._plane.isVisible = !this._plane.isVisible;
    }
}
