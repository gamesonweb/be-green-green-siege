import * as BABYLON from 'babylonjs';

class XRHandler {
    xr: BABYLON.WebXRDefaultExperience;

    isControllerVisible(visible: boolean) {
        this.xr.input.controllers.forEach((controller) => {
            controller.motionController!.rootMesh.getChildMeshes().forEach((mesh) => {
                mesh.isVisible = visible;
            });
        })
    }

    async initXR(scene: BABYLON.Scene): Promise<void> {
        // Get platform
        let platform = scene.getMeshByName('n1b14');
        this.xr = await scene.createDefaultXRExperienceAsync({ floorMeshes: [platform] });
    }
}

const xrHandler = new XRHandler();

export default xrHandler;