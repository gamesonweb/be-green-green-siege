import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { StateManager, StatesEnum } from '../states/stateManager';


export default class TutoUI {
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.Camera;

    private _manager: GUI.GUI3DManager;

    public anchor: BABYLON.TransformNode;

    private _stateManager: StateManager;

    private _middlePanel: GUI.StackPanel3D;
    private _rightPanel: GUI.StackPanel3D;
    private _leftPanel: GUI.StackPanel3D;

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

    createActionButton(text: string, callback: () => void) {
        let button = new GUI.HolographicButton(text);
        button.text = text;
        button.scaling = new BABYLON.Vector3(2, 2, 2);
        button.onPointerClickObservable.add(callback);

        return button;
    }

    loadNext(tutorialNumber: number) {
        if (tutorialNumber <= 6) { // TODO vérifier cette condition
            let next = this.createActionButton('Next Tutorial', () => {
                this.dispose();
                this._stateManager.switchState(this.getNextTutorial(tutorialNumber));
            });
            this._rightPanel.addControl(next);
        }
        else {
            let restart = this.createActionButton('Restart Tutorials', () => {
                this.dispose();
                this._stateManager.switchState(StatesEnum.TUTO1);
            });
            this._rightPanel.addControl(restart);   
        }
    }

    load(tutorialText: string): void {
        this._scene.debugLayer.show();
        this._manager = new GUI.GUI3DManager(this._scene);

        this.anchor = new BABYLON.TransformNode('anchorTuto');
        this.anchor.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);



        let panel = new GUI.StackPanel3D();

        this._manager.addControl(panel);
        panel.linkToTransformNode(this.anchor);
        this.anchor.position = this._camera.position.clone();
        this.anchor.position.z -= 4;
        this.anchor.position.y = 1;
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

        let mainMenuButton = this.createActionButton('Return to menu', () => {
            this.dispose();
            this._stateManager.switchState(StatesEnum.MAINMENU);
        });
        this._leftPanel.addControl(mainMenuButton);

        let textButton = this.createActionButton(tutorialText, () => {});
        this._middlePanel.addControl(textButton);
    }

    dispose(): void {
        this._manager.dispose();
        this.anchor.dispose();
    }
}
