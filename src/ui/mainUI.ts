import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import xrHandler from '../XRHandler';
import { Game } from '../game';
import { StateManager, StatesEnum } from '../states/stateManager';
import dialog from './dialog';
import UI from './ui';
import UtilsUI from './utilsUI';

export default class MainGUI implements UI {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _manager: GUI.GUI3DManager;
    private _stateManager: StateManager;

    public anchor: BABYLON.TransformNode;

    private _mainPanel: GUI.StackPanel3D;
    private _topPanel: GUI.StackPanel3D;
    private _bottomPanel: GUI.StackPanel3D;
    private _leftPanel: GUI.StackPanel3D;
    private _middlePanel: GUI.StackPanel3D;
    private _rightPanel: GUI.StackPanel3D;
    private _extraRightPanel: GUI.StackPanel3D;

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

    private _createEmptySpace(panel: GUI.StackPanel3D, height: number) {
        // Create an invisible button
        const button = UtilsUI.createTextZone('', panel, 0, height, 0, this._scene);
        button.isVisible = false;
    }

    private _initSubpanelsExtraRight(): void {
        // Create extra right sub panel
        this._extraRightPanel = new GUI.StackPanel3D(true);
        this._extraRightPanel.isVertical = true;
        this._mainPanel.addControl(this._extraRightPanel);
        this._extraRightPanel.position.x = 3;
        this._extraRightPanel.position.y = -0.5;
    }

    private _initSubPanels(): void {
        // Create top sub panel
        this._topPanel = new GUI.StackPanel3D(true);
        this._topPanel.isVertical = false;
        this._mainPanel.addControl(this._topPanel);
        this._topPanel.position.y = 0.9;

        // Create left sub panel
        this._leftPanel = new GUI.StackPanel3D(true);
        this._leftPanel.isVertical = true;
        this._mainPanel.addControl(this._leftPanel);
        this._leftPanel.position.x = -1.5;

        // Create middle sub panel
        this._middlePanel = new GUI.StackPanel3D(true);
        this._middlePanel.isVertical = true;
        this._mainPanel.addControl(this._middlePanel);
        this._middlePanel.position.x = 0;

        // Create right sub panel
        this._rightPanel = new GUI.StackPanel3D(true);
        this._rightPanel.isVertical = true;
        this._mainPanel.addControl(this._rightPanel);
        this._rightPanel.position.x = 1.5;

        // Create extra right sub panel
        this._initSubpanelsExtraRight();

        // Create bottom sub panel
        this._bottomPanel = new GUI.StackPanel3D(true);
        this._bottomPanel.isVertical = false;
        this._mainPanel.addControl(this._bottomPanel);
        this._bottomPanel.position.y = -0.4;
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

        // Title
        // UtilsUI.createTextZone('Green Siege', this._topPanel, 4, 0.35, 80, this._scene);
        UtilsUI.createImageZone('assets/logo.png', this._topPanel, 4, 1, this._scene);

        // Levels
        this.createLevelButton(dialog.get('level') + ' 3', StatesEnum.LEVEL, this._leftPanel, 3);
        this.createLevelButton(dialog.get('level') + ' 2', StatesEnum.LEVEL, this._leftPanel, 2);
        this.createLevelButton(dialog.get('level') + ' 1', StatesEnum.LEVEL, this._leftPanel, 1);
        this.createLevelButton(dialog.get('tuto'), StatesEnum.TUTO1, this._leftPanel);
        // this.createLevelButton('7', StatesEnum.LEVEL, this._middlePanel, 7);
        this.createLevelButton(dialog.get('level') + ' 6', StatesEnum.LEVEL, this._middlePanel, 6);
        this.createLevelButton(dialog.get('level') + ' 5', StatesEnum.LEVEL, this._middlePanel, 5);
        this.createLevelButton(dialog.get('level') + ' 4', StatesEnum.LEVEL, this._middlePanel, 4);
        this._createEmptySpace(this._middlePanel, 0.3);
        
        this.createNavigateButton("Controls", StatesEnum.CONTROLS, this._rightPanel);
        this.createNavigateButton("Credits", StatesEnum.CREDIT, this._rightPanel);
        this.createLangButton(dialog.get('lang'), this._rightPanel);

        // add empty spaces
        this._createEmptySpace(this._leftPanel, 1);
        this._createEmptySpace(this._middlePanel, 1);
        this._createEmptySpace(this._rightPanel, 1);
        this._createEmptySpace(this._extraRightPanel, 1);
    }

    private createNavigateButton(
        text: string,
        levelenum: StatesEnum,
        panel: GUI.StackPanel3D,
        levelNumber: number = undefined
    ) {
        return UtilsUI.createActionButton(text, panel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            this._stateManager.switchState(levelenum, levelNumber);
        });
    }

    private createLangButton(text: string, panel: GUI.StackPanel3D) {
        return UtilsUI.createActionButton(text, panel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            dialog.changeLang();
            this._stateManager.switchState(StatesEnum.MAINMENU);
        });
    }

    private createLevelButton(
        text: string,
        levelenum: StatesEnum,
        panel: GUI.StackPanel3D,
        levelNumber: number = undefined
    ) {
        const hoverCallback = {
            in: () => {
                this._extraRightPanel.dispose();

                // Create extra right sub panel
                this._initSubpanelsExtraRight();

                // Add top scores
                if (levelNumber !== undefined) {
                    UtilsUI.createTopScoresTextZone(this._extraRightPanel, this._scene, 1.4, 0.25, 40, levelNumber, 5);
                }
            },
            out: () => {},
        };

        return UtilsUI.createActionButton(
            text,
            panel,
            new BABYLON.Vector3(1, 0.25, 1),
            20,
            () => {
                this._stateManager.switchState(levelenum, levelNumber);
            },
            hoverCallback
        );
    }

    dispose() {
        this._manager.dispose();
        this.anchor.dispose();
        this._mainPanel.dispose();
        this._topPanel.dispose();
        this._leftPanel.dispose();
        this._middlePanel.dispose();
        this._rightPanel.dispose();
        this._bottomPanel.dispose();
        this._extraRightPanel.dispose();
    }
}
