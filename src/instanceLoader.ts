import * as BABYLON from 'babylonjs';

export class InstanceLoader {
    private _scene: BABYLON.Scene;
    private _botRef: BABYLON.Mesh;
    private _instanceCounter: number;

    constructor(scene: BABYLON.Scene) {
        this._scene = scene;
        this._botRef = this._scene.getMeshByName('Robot') as BABYLON.Mesh;
        this.hideMeshWithChildren(this._botRef);
        this._instanceCounter = 0;
    }

    private hideMeshWithChildren(mesh: BABYLON.AbstractMesh) {
        mesh.isVisible = false;
        mesh.getChildren().forEach((child) => {
            if (child instanceof BABYLON.AbstractMesh) {
                this.hideMeshWithChildren(child);
            }
        });
    }

    private createMeshInstanceWithChildren(mesh, newInstanceName, uniqueSuffix, metadata) {
        const newInstance = mesh.createInstance(newInstanceName);

        // Add a unique identifier to the robot instance
        const completedMetaData = Object.assign({ instanceId: uniqueSuffix }, metadata);
        newInstance.metadata = completedMetaData;

        mesh.getChildren().forEach((child) => {
            if (child instanceof BABYLON.AbstractMesh) {
                const childInstance = this.createMeshInstanceWithChildren(child, `instance_${child.name}_${uniqueSuffix}`, uniqueSuffix, metadata);
                childInstance.parent = newInstance;
            }
        });

        return newInstance;
    }

    public getBot(newInstanceName: string, metadata: object) {
        // Generate a unique identifier based on the instance counter
        const uniqueSuffix = this._instanceCounter++;
        const bot = this.createMeshInstanceWithChildren(this._botRef, newInstanceName, uniqueSuffix, metadata);
        return bot;
    }

    public findInstanceSubMeshByName(instanceMesh: BABYLON.AbstractMesh, subMeshName: string): BABYLON.AbstractMesh {
        if (instanceMesh.metadata && instanceMesh.metadata.instanceId !== undefined) {
            const instanceId = instanceMesh.metadata.instanceId;

            return this.recursiveFindInstanceSubMeshByName(instanceMesh, instanceId, subMeshName);
        }

        return null;
    }

    private recursiveFindInstanceSubMeshByName(mesh: BABYLON.AbstractMesh, instanceId: number, subMeshName: string) {
        if (mesh.metadata && mesh.metadata.instanceId === instanceId && mesh.name === `instance_${subMeshName}_${instanceId}`) {
            return mesh;
        }

        for (let child of mesh.getChildren()) {
            if (child instanceof BABYLON.AbstractMesh) {
                const result = this.recursiveFindInstanceSubMeshByName(child, instanceId, subMeshName);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }
}
