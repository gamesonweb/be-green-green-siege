import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { StateManager, StatesEnum } from '../states/stateManager';
import scoreUI from './scoreUI';
import UI from './ui';

export default class MainGUI implements UI {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _manager: GUI.GUI3DManager;
    private _stateManager: StateManager;

    public anchor: BABYLON.TransformNode;

    constructor(scene: BABYLON.Scene, camera: BABYLON.Camera, _stateManager: StateManager) {
        this._scene = scene;
        this._camera = camera;
        this._stateManager = _stateManager;
    }

    private createLevelButton(text: string, levelenum: StatesEnum, levelNumber: number = undefined) {
        let button = new GUI.HolographicButton('button');
        button.text = text;
        button.onPointerClickObservable.add(() => {
            this._stateManager.switchState(levelenum, levelNumber);
        });

        return button;
    }

    async load() {
        // this._scene.debugLayer.show();
        this._manager = new GUI.GUI3DManager(this._scene);

        this.anchor = new BABYLON.TransformNode('anchorPanel');
        this.anchor.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);

        let panel = new GUI.StackPanel3D();

        this._manager.addControl(panel);
        panel.linkToTransformNode(this.anchor);
        this.anchor.position = this._camera.position.clone();
        this.anchor.position.z -= 5;

        let leftPanel = new GUI.StackPanel3D(true);
        leftPanel.isVertical = true;
        panel.addControl(leftPanel);
        leftPanel.position.x = -1.5; // Position to the left of center

        let rightPanel = new GUI.StackPanel3D(true);
        rightPanel.isVertical = true;
        panel.addControl(rightPanel);
        rightPanel.position.x = 1.5; // Position to the right of center

        let middlePanel = new GUI.StackPanel3D(true);
        middlePanel.isVertical = true;
        panel.addControl(middlePanel);
        middlePanel.position.x = 0; // Position in the center

        // Add controls to left panel
        let button2 = this.createLevelButton('Level 2', StatesEnum.LEVEL, 2);
        leftPanel.addControl(button2);

        // Add controls to left panel
        let button1 = this.createLevelButton('Level 1', StatesEnum.LEVEL, 1);
        leftPanel.addControl(button1);

        // Add score to right panel
        await scoreUI.displayTopScores(rightPanel, 1);
        await scoreUI.displayTopScores(rightPanel, 2);

        // Add controls to middle panel
        let button5 = this.createLevelButton('Test', StatesEnum.LEVELTEST);
        middlePanel.addControl(button5);

        let tutorials = this.createLevelButton('Tutorials', StatesEnum.TUTO1);
        middlePanel.addControl(tutorials);
    }

    dispose() {
        this._manager.dispose();
        this.anchor.dispose();
    }
}
