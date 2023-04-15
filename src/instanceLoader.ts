import * as BABYLON from 'babylonjs';

export class InstanceLoader {
    private _scene: BABYLON.Scene;

    private _botRef: BABYLON.Mesh;

    constructor(scene: BABYLON.Scene) {
        this._scene = scene;
        this._botRef = this._scene.getMeshByName('Robot') as BABYLON.Mesh;
        this.hideMeshWithChildren(this._botRef);
    }

    private hideMeshWithChildren(mesh: BABYLON.AbstractMesh) {
        mesh.isVisible = false;
        mesh.getChildren().forEach((child) => {
            if (child instanceof BABYLON.AbstractMesh) {
                this.hideMeshWithChildren(child);
            }
        });
    }

    private createMeshInstanceWithChildren(mesh, newInstanceName) {
        const newInstance = mesh.createInstance(newInstanceName);

        mesh.getChildren().forEach((child, index) => {
            if (child instanceof BABYLON.AbstractMesh) {
                const childInstance = this.createMeshInstanceWithChildren(child, `${newInstanceName}_child_${index}`);
                childInstance.parent = newInstance;
            }
        });

        return newInstance;
    }

    public getBot(newInstanceName: string) {
        const bot = this.createMeshInstanceWithChildren(this._botRef, newInstanceName);
        return bot;
    }
}
