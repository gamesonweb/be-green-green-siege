import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

class UtilsUI {
    public static colorSaumon = new BABYLON.Color3(1, 0.512, 0.456);

    public static createActionButton(
        text: string,
        panel: GUI.StackPanel3D,
        scale: BABYLON.Vector3,
        fontSize: number,
        callback: () => void,
        albedoColor?: BABYLON.Color3,
        innerGlowColorIntensity?: number
    ): GUI.HolographicButton {
        const button = new GUI.HolographicButton(text);
        button.onPointerClickObservable.add(callback);
        panel.addControl(button);
        button.scaling = scale;

        button.backMaterial.innerGlowColorIntensity = innerGlowColorIntensity || 0.5;
        button.backMaterial.albedoColor = albedoColor || UtilsUI.colorSaumon;

        const buttonText = new GUI.TextBlock();
        buttonText.text = text;
        // buttonText.fontWeight = 'bold';
        buttonText.color = 'white';
        buttonText.fontSize = fontSize;
        buttonText.scaleX = 1 / scale.x;
        buttonText.scaleY = 1 / scale.y;
        // buttonText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER; // Center the text horizontally
        // buttonText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER; // Center the text vertically
        button.content = buttonText;

        return button;
    }

    public static createTextZone(
        text: string,
        panel: GUI.StackPanel3D,
        width: number,
        height: number,
        fontSize: number,
        scene: BABYLON.Scene
    ): GUI.MeshButton3D {
        
        // Create a plane mesh
        const planeMesh = BABYLON.MeshBuilder.CreatePlane(
            'textZonePlane',
            {
                width: width,
                height: height,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            },
            scene
        );

        // Create an advanced dynamic texture for the plane mesh
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
            planeMesh,
            Math.round(width * 512),
            Math.round(height * 512)
        );

        // Create a 2D rectangle container for the text block
        const textZone = new GUI.Rectangle('textZone');
        textZone.thickness = 3;
        textZone.background = 'rgba(0, 0, 0, 0.5)';
        advancedTexture.addControl(textZone);

        // Create a text block inside the rectangle
        const textBlock = new GUI.TextBlock();
        textBlock.text = text;
        textBlock.color = 'white';
        textBlock.fontSize = fontSize;
        // textBlock.fontWeight = 'bold';
        textBlock.textWrapping = true; // Enable text wrapping
        textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        textZone.addControl(textBlock);

        // Create a standard material and set the advanced dynamic texture as its diffuse texture
        const material = new BABYLON.StandardMaterial('textZoneMaterial', scene);
        material.diffuseTexture = advancedTexture;
        material.opacityTexture = material.diffuseTexture;
        material.emissiveColor = BABYLON.Color3.White();
        material.disableLighting = true;
        planeMesh.material = material;

        // Create a MeshButton3D using the plane mesh
        const meshButton = new GUI.MeshButton3D(planeMesh);
        meshButton.scaling.x = width;
        meshButton.scaling.y = height;

        // Disable scaling effect on pointer enter and exit
        meshButton.pointerEnterAnimation = () => {};
        meshButton.pointerOutAnimation = () => {};

        // Add the mesh button to the 3D stack panel
        panel.addControl(meshButton);

        return meshButton;
    }
}

export default UtilsUI;

function createImageDataURI(canvas: BABYLON.ICanvas, mime: string): string {
    return canvas.toDataURL(mime);
}
