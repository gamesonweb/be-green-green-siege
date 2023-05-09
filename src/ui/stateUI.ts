import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import timeControl from '../TimeControl';
import xrHandler from '../XRHandler';
import { Game } from '../game';
import { StateManager, StatesEnum } from '../states/stateManager';
import UI from './ui';
import UtilsUI from './utilsUI';

export enum StateUIEnum {
    PAUSE = 0,
    WIN = 1,
    LOSE = 2,
}

export default class StateUI implements UI {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _manager: GUI.GUI3DManager;

    private _cylinder: BABYLON.Mesh;

    public anchor: BABYLON.TransformNode;

    private _upperSunIntensity: number;
    private _downSunIntensity: number;

    private _stateManager: StateManager;

    private _mainPanel: GUI.StackPanel3D;
    private _topPanel: GUI.StackPanel3D;
    private _bottomPanel: GUI.StackPanel3D;
    private _leftPanel: GUI.StackPanel3D;
    private _middlePanel: GUI.StackPanel3D;
    private _rightPanel: GUI.StackPanel3D;
    private _extraRightPanel: GUI.StackPanel3D;

    constructor(scene: BABYLON.Scene, camera: BABYLON.Camera, stateManager: StateManager) {
        this._scene = scene;
        this._camera = camera;
        this._stateManager = stateManager;
    }

    private loadPauseMenu(levelNumber: number) {
        // Return to menu button
        UtilsUI.createActionButton('Return to menu', this._leftPanel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            this.dispose();
            this._stateManager.switchState(StatesEnum.MAINMENU);
            timeControl.resume();
        });

        // Restart button
        UtilsUI.createActionButton('Restart', this._middlePanel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            this.dispose();
            this._stateManager.switchState(StatesEnum.LEVEL, levelNumber);
            timeControl.resume();
        });

        // Resume button
        UtilsUI.createActionButton('Resume', this._rightPanel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            timeControl.resume();
            this.dispose();
            this._stateManager.getCurrentState().resume();
        });

        // Score
        UtilsUI.createCurrentScoreTextZone(this._bottomPanel, this._scene, 1, 0.25, 40, levelNumber);

        // Top scores
        UtilsUI.createTopScoresTextZone(this._extraRightPanel, this._scene, 1.4, 0.25, 40, levelNumber, 5);
    }

    private loadWinMenu(levelNumber: number) {
        // Return to menu button
        UtilsUI.createActionButton('Return to menu', this._leftPanel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            this.dispose();
            this._stateManager.switchState(StatesEnum.MAINMENU);
            timeControl.resume();
        });

        // Restart button
        UtilsUI.createActionButton('Restart', this._middlePanel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            this.dispose();
            this._stateManager.switchState(StatesEnum.LEVEL, levelNumber);
            timeControl.resume();
        });

        // Next button
        UtilsUI.createActionButton('Next Level', this._rightPanel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            this.dispose();
            timeControl.resume();
            let level = this._stateManager.getCurrentState().levelNumber;
            this._stateManager.switchState(StatesEnum.LEVEL, level++);
        });

        // Score
        UtilsUI.createCurrentScoreTextZone(this._bottomPanel, this._scene, 1, 0.25, 40, levelNumber);

        // Top scores
        UtilsUI.createTopScoresTextZone(this._extraRightPanel, this._scene, 1.4, 0.25, 40, levelNumber, 5);

        // Win text
        UtilsUI.createTextZone('You WIN !', this._topPanel, 4, 0.35, 40, this._scene);
    }

    private loadLoseMenu(levelNumber: number) {
        // Return to menu button
        UtilsUI.createActionButton('Return to menu', this._leftPanel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            this.dispose();
            this._stateManager.switchState(StatesEnum.MAINMENU);
            timeControl.resume();
        });

        // Restart button
        UtilsUI.createActionButton('Restart', this._middlePanel, new BABYLON.Vector3(1, 0.25, 1), 20, () => {
            this.dispose();
            this._stateManager.switchState(StatesEnum.LEVEL, levelNumber);
            timeControl.resume();
        });

        // Top scores
        UtilsUI.createTopScoresTextZone(this._extraRightPanel, this._scene, 1.4, 0.25, 40, levelNumber, 5);

        // Loose text
        UtilsUI.createTextZone('You LOOSE !', this._topPanel, 4, 0.35, 40, this._scene);
    }

    createActionButton(text: string, callback: () => void) {
        let button = new GUI.HolographicButton(text);
        button.text = text;
        button.scaling = new BABYLON.Vector3(2, 2, 2);
        button.onPointerClickObservable.add(callback);

        return button;
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
        this._topPanel.isVertical = false;
        this._mainPanel.addControl(this._topPanel);
        this._topPanel.position.y = 0.4;

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
        this._extraRightPanel = new GUI.StackPanel3D(true);
        this._extraRightPanel.isVertical = true;
        this._mainPanel.addControl(this._extraRightPanel);
        this._extraRightPanel.position.x = 3;

        // Create bottom sub panel
        this._bottomPanel = new GUI.StackPanel3D(true);
        this._bottomPanel.isVertical = false;
        this._mainPanel.addControl(this._bottomPanel);
        this._bottomPanel.position.y = -0.4;
    }

    private _initLights(): void {
        let upSun = this._scene.getLightByName('UpperSun');
        let downSun = this._scene.getLightByName('DownSun');
        this._upperSunIntensity = upSun.intensity;
        this._downSunIntensity = downSun.intensity;
        upSun.intensity = 0;
        downSun.intensity = 0;
    }

    private _initCylinder(): void {
        this._cylinder = BABYLON.CreateCylinder('test', { height: 10, diameter: 15 });
        this._cylinder.flipFaces(true);
        this._cylinder.position = this._camera.position.clone();

        let material = new BABYLON.StandardMaterial('Cylinder', this._scene);
        material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        material.alpha = 0.4;
        this._cylinder.material = material;
    }

    load(state: StateUIEnum, levelNumber: number): void {
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

        // Configure lights
        this._initLights();

        // Create cylinder to hide the scene
        this._initCylinder();

        switch (state) {
            case StateUIEnum.PAUSE:
                this.loadPauseMenu(levelNumber);
                break;
            case StateUIEnum.WIN:
                this.loadWinMenu(levelNumber);
                break;
            case StateUIEnum.LOSE:
                this.loadLoseMenu(levelNumber);
                break;
        }
    }

    dispose(): void {
        this._manager.dispose();
        this.anchor.dispose();

        let upSun = this._scene.getLightByName('UpperSun');
        let downSun = this._scene.getLightByName('DownSun');

        upSun.intensity = this._upperSunIntensity;
        downSun.intensity = this._downSunIntensity;

        this._cylinder.dispose();

        if (Game.vrSupported) {
            xrHandler.setControllerVisibility(false);
        }
    }
}
