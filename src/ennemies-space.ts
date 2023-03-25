import { Color4, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, VertexBuffer, int } from "babylonjs";

export class EnnemiesSpace {

    private scene: Scene;

    private distances: int[];

    public constructor(n_layers: int, min_distance: int, scene: Scene) { 
        scene = this.scene;
        this.distances = [];
        // manage layers
        for(let i=1; i<=n_layers; i++) {
            // debug
            this.showCylinder(i, scene);
            let padding = min_distance * i;
            // push differents distances where ennemies will move
            this.distances.push(padding);
        }
    }

    public getDistances(): int[] {
        return this.distances;
    }

    private showCylinder(i: int, scene: Scene): void {
        let d = 30+15*i;
        let rand_col = 0.5*i;
        let colors = [
            new Color4(0.4, 0.3+rand_col, 0, 0.1),
            new Color4(0.4, 0.3+rand_col, 0, 0.1),
            new Color4(0.4, 0.3+rand_col, 0, 0.1)
        ];
        let cylinder: Mesh = MeshBuilder.CreateCylinder("cylinder_"+i, {height: 15, diameter: d, faceColors: colors}, scene);
        cylinder.material = new StandardMaterial("mat", scene);
        cylinder.material.wireframe = true;
        cylinder.setAbsolutePosition(new Vector3(0, 0, 0));
    }

    /**
     * Called on the node is being initialized.
     * This function is called immediatly after the constructor has been called.
     */
    public onInitialize(): void {
        // ...
    }

    /**
     * Called on the node has been fully initialized and is ready.
     */
    public onInitialized(): void {
        // ...
    }

    /**
     * Called on the scene starts.
     */
    public onStart(): void {
        // ...
    }

    /**
     * Called each frame.
     */
    public onUpdate(entity: Mesh): void {
        // ...
    }

    /**
     * Called on the object has been disposed.
     * Object can be disposed manually or when the editor stops running the scene.
     */
    public onStop(): void {
        // ...
    }

    /**
     * Called on a message has been received and sent from a graph.
     * @param name defines the name of the message sent from the graph.
     * @param data defines the data sent in the message.
     * @param sender defines the reference to the graph class that sent the message.
     */
    public onMessage(name: string, data: any, sender: any): void {
        // ...
    }
}