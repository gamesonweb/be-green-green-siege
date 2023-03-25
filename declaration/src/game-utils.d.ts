import * as BABYLON from 'babylonjs';
import * as MATERIAL from 'babylonjs-materials';
import * as GUI from 'babylonjs-gui';
import { Observable } from 'rxjs';
export declare class GameUtils {
    /**
     * Creates a basic ground
     * @param scene
     */
    static createGround(scene: BABYLON.Scene): BABYLON.Mesh;
    /**
     * Creates a second ground and adds a watermaterial to it
     * @param scene
     */
    static createWater(scene: BABYLON.Scene): MATERIAL.WaterMaterial;
    /**
     * Creates a Gui Texture
     */
    static createGUI(): any;
    /**
     * Creates a Button that tells the Shark to swim or not
     * @param guiTexture
     * @param btnText
     * @param btnClicked
     */
    static createButtonSwim(guiTexture: GUI.AdvancedDynamicTexture, btnText: string, btnClicked: (button: GUI.Button) => void): void;
    static createVerticalLine(scene: BABYLON.Scene, position: BABYLON.Vector2): void;
    /**
     *
     * @param guiTexture
     */
    static createCoordinatesText(guiTexture: GUI.AdvancedDynamicTexture): {
        txtX: GUI.TextBlock;
        txtY: GUI.TextBlock;
        txtZ: GUI.TextBlock;
    };
    /**
     * Returns Observable of mesh array, which are loaded from a file.
     * After mesh importing all meshes become given scaling, position and rotation.
     * @param fileName
     * @param scene
     * @param scaling
     * @param position
     * @param rotationQuaternion
     */
    static createMeshFromObjFile(folderName: string, fileName: string, scene: BABYLON.Scene, scaling?: BABYLON.Vector3, position?: BABYLON.Vector3, rotationQuaternion?: BABYLON.Quaternion): Observable<BABYLON.AbstractMesh[]>;
    /**
     * Creates a new skybox with the picttures under fileName.
     * @param name
     * @param fileName
     * @param scene
     */
    static createSkybox(name: string, fileName: string, scene: BABYLON.Scene): BABYLON.Mesh;
    /**
     * Creates a new WaterMaterial Object with a given name. The noiseFile descrips the noise in the water,
     * @param name
     * @param noiseFile
     * @param scene
     */
    static createWaterMaterial(name: string, noiseFile: string, scene: BABYLON.Scene): MATERIAL.WaterMaterial;
    /**
     * Loads a shark model from .obj file and adds it scene.
     * @param scene
     */
    static createShark(scene: BABYLON.Scene): Observable<BABYLON.AbstractMesh>;
}
