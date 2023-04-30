import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import timeControl from '../TimeControl';
import xrHandler from '../XRHandler';
import { Game } from '../game';
import { StateManager, StatesEnum } from '../states/stateManager';
import UI from './ui';

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

    private _middlePanel: GUI.StackPanel3D;
    private _rightPanel: GUI.StackPanel3D;
    private _leftPanel: GUI.StackPanel3D;

    constructor(scene: BABYLON.Scene, camera: BABYLON.Camera, stateManager: StateManager) {
        this._scene = scene;
        this._camera = camera;
        this._stateManager = stateManager;
    }

    private loadPauseMenu() {
        let textButton = this.createActionButton('Paused', () => {});
        this._middlePanel.addControl(textButton);

        let resumeButton = this.createActionButton('Resume', () => {
            timeControl.resume();
            this.dispose();
            this._stateManager.getCurrentState().resume(); // resume the current level
        });
        this._leftPanel.addControl(resumeButton);

        let mainMenuButton = this.createActionButton('Return to menu', () => {
            this.dispose();
            timeControl.resume();
            this._stateManager.switchState(StatesEnum.MAINMENU);
        });
        this._rightPanel.addControl(mainMenuButton);
    }

    private loadWinMenu() {
        let textButton = this.createActionButton('You WIN !', () => {});
        this._middlePanel.addControl(textButton);

        let mainMenuButton = this.createActionButton('Return to menu', () => {
            this.dispose();
            timeControl.resume();
            this._stateManager.switchState(StatesEnum.MAINMENU);
        });
        this._leftPanel.addControl(mainMenuButton);

        let restart = this.createActionButton('Restart', () => {
            this.dispose();
            timeControl.resume();
            let level = this._stateManager.getCurrentState().levelNumber;
            this._stateManager.switchState(StatesEnum.LEVEL, level);
        });
        this._rightPanel.addControl(restart);

        let next = this.createActionButton('Next', () => {
            this.dispose();
            timeControl.resume();
            let level = this._stateManager.getCurrentState().levelNumber;
            this._stateManager.switchState(StatesEnum.LEVEL, level++);
        });
        this._rightPanel.addControl(next);
    }

    private loadLoseMenu() {
        let textButton = this.createActionButton('You LOSE !', () => {});
        this._middlePanel.addControl(textButton);

        let mainMenuButton = this.createActionButton('Return to menu', () => {
            this.dispose();
            timeControl.resume();
            this._stateManager.switchState(StatesEnum.MAINMENU);
        });
        this._leftPanel.addControl(mainMenuButton);

        let restart = this.createActionButton('Restart', () => {
            this.dispose();
            timeControl.resume();
            let level = this._stateManager.getCurrentState().levelNumber;
            this._stateManager.switchState(StatesEnum.LEVEL, level);
        });
        this._rightPanel.addControl(restart);
    }

    createActionButton(text: string, callback: () => void) {
        let button = new GUI.HolographicButton(text);
        button.text = text;
        button.scaling = new BABYLON.Vector3(2, 2, 2);
        button.onPointerClickObservable.add(callback);

        return button;
    }

    load(state: StateUIEnum): void {
        this._manager = new GUI.GUI3DManager(this._scene);
        this._cylinder = BABYLON.CreateCylinder('test', { height: 10, diameter: 15 });
        this._cylinder.flipFaces(true);

        let material = new BABYLON.StandardMaterial('Cylinder', this._scene);
        material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        material.alpha = 0.4;

        let upSun = this._scene.getLightByName('UpperSun');
        let downSun = this._scene.getLightByName('DownSun');
        this._upperSunIntensity = upSun.intensity;
        this._downSunIntensity = downSun.intensity;
        upSun.intensity = 0;
        downSun.intensity = 0;

        this._cylinder.material = material;

        if (Game.vrSupported) {
            xrHandler.setControllerVisibility(true);
        }

        this.anchor = new BABYLON.TransformNode('anchorPause ');
        this.anchor.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
        this.anchor.position = this._camera.position.clone();
        this.anchor.position.z -= 5;

        this._cylinder.position = this._camera.position.clone();

        let panel = new GUI.StackPanel3D();

        this._manager.addControl(panel);
        panel.linkToTransformNode(this.anchor);
        this.anchor.position = this._camera.position.clone();
        this.anchor.position.z -= 5;

        this._leftPanel = new GUI.StackPanel3D(true);
        this._leftPanel.isVertical = true;
        panel.addControl(this._leftPanel);
        this._leftPanel.position.x = -1.5; // Position to the left of center

        this._rightPanel = new GUI.StackPanel3D(true);
        this._rightPanel.isVertical = true;
        panel.addControl(this._rightPanel);
        this._rightPanel.position.x = 1.5; // Position to the right of center

        this._middlePanel = new GUI.StackPanel3D(true);
        this._middlePanel.isVertical = true;
        panel.addControl(this._middlePanel);
        this._middlePanel.position.x = 0; // Position in the center

        switch (state) {
            case StateUIEnum.PAUSE:
                this.loadPauseMenu();
                break;
            case StateUIEnum.WIN:
                this.loadWinMenu();
                break;
            case StateUIEnum.LOSE:
                this.loadLoseMenu();
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
