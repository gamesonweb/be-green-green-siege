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
    ) {
        const button = new GUI.HolographicButton(text);
        button.onPointerClickObservable.add(callback);
        panel.addControl(button);
        button.scaling = scale;

        button.backMaterial.innerGlowColorIntensity = innerGlowColorIntensity || 0.5;
        button.backMaterial.albedoColor = albedoColor || UtilsUI.colorSaumon;

        const buttonText = new GUI.TextBlock();
        buttonText.text = text;
        buttonText.fontWeight = 'bold';
        buttonText.color = 'white';
        buttonText.fontSize = fontSize;
        buttonText.scaleX = 1 / scale.x;
        buttonText.scaleY = 1 / scale.y;
        button.content = buttonText;

        return button;
    }
}

export default UtilsUI;
