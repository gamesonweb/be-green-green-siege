import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { StateManager, StatesEnum } from '../states/stateManager';
import UtilsUI from './utilsUI';

export default class TutoUI {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _manager: GUI.GUI3DManager;

    private _anchor: BABYLON.TransformNode;

    private _stateManager: StateManager;

    private _mainPanel: GUI.StackPanel3D;
    private _topPanel: GUI.StackPanel3D;
    private _leftPanel: GUI.StackPanel3D;
    private _middlePanel: GUI.StackPanel3D;
    private _rightPanel: GUI.StackPanel3D;

    private readonly NUMBER_OF_TUTORIALS: number = 6;

    constructor(scene: BABYLON.Scene, camera: BABYLON.Camera, stateManager: StateManager) {
        this._scene = scene;
        this._camera = camera;
        this._stateManager = stateManager;
    }

    getNextTutorial(tutorialNumber): StatesEnum {
        switch (tutorialNumber) {
            case 1:
                return StatesEnum.TUTO1;
            case 2:
                return StatesEnum.TUTO2;
            case 3:
                return StatesEnum.TUTO3;
            case 4:
                return StatesEnum.TUTO4;
            case 5:
                return StatesEnum.TUTO5;
            case 6:
                return StatesEnum.TUTO6;
            default:
                return StatesEnum.TUTO1;
        }
    }

    private _initAnchor(): void {
        // Create anchor transform node
        this._anchor = new BABYLON.TransformNode('anchorTuto');
        this._anchor.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
        this._anchor.position = this._camera.position.clone();
        this._anchor.position.z -= 4;
        this._anchor.position.y = 1;
        this._mainPanel.linkToTransformNode(this._anchor);
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
    }

    public load(tutorialText: string, tutorialNumber: number): void {
        // Create manager
        this._manager = new GUI.GUI3DManager(this._scene);

        // Create a main panel that will contain 3D UI
        this._mainPanel = new GUI.StackPanel3D();
        this._manager.addControl(this._mainPanel);

        // Create anchor transform node
        this._initAnchor();

        // Create panels
        this._initSubPanels();

        ////////////////////
        // Create buttons //
        ////////////////////

        // Tutorial text
        UtilsUI.createActionButton(tutorialText, this._topPanel, new BABYLON.Vector3(4, 0.4, 1), 24, () => {});

        // Return to menu button
        UtilsUI.createActionButton('Return to menu', this._leftPanel, new BABYLON.Vector3(1, 0.25, 1), 24, () => {
            this.dispose();
            this._stateManager.switchState(StatesEnum.MAINMENU);
        });

        // Restart button
        UtilsUI.createActionButton('Restart', this._middlePanel, new BABYLON.Vector3(1, 0.25, 1), 24, () => {
            this.dispose();
            this._stateManager.switchState(this.getNextTutorial(tutorialNumber));
        });

        // Next tutorial button
        if (tutorialNumber <= this.NUMBER_OF_TUTORIALS) {
            UtilsUI.createActionButton('Next Tutorial', this._rightPanel, new BABYLON.Vector3(1, 0.25, 1), 24, () => {
                this.dispose();
                this._stateManager.switchState(this.getNextTutorial(tutorialNumber + 1));
            });
        } else {
            UtilsUI.createActionButton(
                'Restart Tutorials',
                this._rightPanel,
                new BABYLON.Vector3(0.5, 0.5, 0.5),
                24,
                () => {
                    this.dispose();
                    this._stateManager.switchState(StatesEnum.TUTO1);
                }
            );
        }
    }

    dispose(): void {
        this._manager.dispose();
        this._anchor.dispose();
    }
}
