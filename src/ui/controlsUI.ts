import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import xrHandler from '../XRHandler';
import { Game } from '../game';
import { StateManager, StatesEnum } from '../states/stateManager';
import dialog from './dialog';
import UI from './ui';
import UtilsUI from './utilsUI';

export default class ControlsUI implements UI {
    private _scene: BABYLON.Scene;
    private _stateManager: StateManager;
    private _camera: BABYLON.Camera;

    private _manager: GUI.GUI3DManager;

    public anchor: BABYLON.TransformNode;

    private _mainPanel: GUI.StackPanel3D;
    private _topPanel: GUI.StackPanel3D;

    constructor(scene: BABYLON.Scene, camera: BABYLON.Camera, _stateManager: StateManager) {
        this._scene = scene;
        this._camera = camera;
        this._stateManager = _stateManager;
    }

    private _initAnchor(): void {
        // Create anchor transform node
        this.anchor = new BABYLON.TransformNode('anchorTuto');
        this.anchor.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
        this.anchor.position = this._camera.position.clone();
        this.anchor.position.z -= 5;
        this.anchor.position.y = 2;
        this._mainPanel.linkToTransformNode(this.anchor);
    }

    private _initSubPanels(): void {
        // Create top sub panel
        this._topPanel = new GUI.StackPanel3D(true);
        this._topPanel.isVertical = true;
        this._mainPanel.addControl(this._topPanel);
        this._topPanel.position.y = 0.4;
    }

    async load() {
        // Create manager
        this._manager = new GUI.GUI3DManager(this._scene);

        // Create a main panel that will contain 3D UI
        this._mainPanel = new GUI.StackPanel3D();
        this._manager.addControl(this._mainPanel);

        // Create anchor transform node
        this._initAnchor();

        // Create panels
        this._initSubPanels();

        // Show the controller
        if (Game.vrSupported) {
            xrHandler.setControllerVisibility(true);
        }

        ////////////////////
        // Create buttons //
        ////////////////////

        this.createReturnButton(dialog.get('return_menu'), this._topPanel);

        // Message
        UtilsUI.createImageZone('assets/controls.png', this._topPanel, 4, 1, this._scene);

        // Title
        // UtilsUI.createTextZone('Green Siege', this._topPanel, 4, 0.35, 80, this._scene);
        UtilsUI.createImageZone('assets/logo.png', this._topPanel, 4, 1, this._scene);
    }

    private createReturnButton(text: string, panel: GUI.StackPanel3D) {
        return UtilsUI.createActionButton(text, panel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            this._stateManager.switchState(StatesEnum.MAINMENU);
        });
    }

    private createLevelButton(
        text: string,
        levelenum: StatesEnum,
        panel: GUI.StackPanel3D,
        levelNumber: number = undefined
    ) {
        return UtilsUI.createActionButton(text, panel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            this._stateManager.switchState(levelenum, levelNumber);
        });
    }

    dispose() {
        this._manager.dispose();
        this.anchor.dispose();
        this._mainPanel.dispose();
        this._topPanel.dispose();
    }
}
