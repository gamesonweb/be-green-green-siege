import { Mesh, PhysicsImpostor, Ray } from "@babylonjs/core";
import { visibleInInspector } from "../decorators";

/**
 * This represents a script that is attached to a node in the editor.
 * Available nodes are:
 *      - Meshes
 *      - Lights
 *      - Cameras
 *      - Transform nodes
 * 
 * You can extend the desired class according to the node type.
 * Example:
 *      export default class MyMesh extends Mesh {
 *          public onUpdate(): void {
 *              this.rotation.y += 0.04;
 *          }
 *      }
 * The function "onInitialize" is called immediately after the constructor is called.
 * The functions "onStart" and "onUpdate" are called automatically.
 */
export default class laser extends Mesh {

    @visibleInInspector("number", "Laser Speed", 0.2)
    private _laserSpeed: number = 0.2;

    @visibleInInspector("number", "Distance Dispawn", 30)
    private _distanceDispawn: number = 30;

    /**
     * Override constructor.
     * @warn do not fill.
     */
    // @ts-ignore ignoring the super call as we don't want to re-init
    protected constructor() { }

    /**
     * Called on the node is being initialized.
     * This function is called immediatly after the constructor has been called.
     */
    public onInitialize(): void {

        // this.physicsImpostor.unregisterOnPhysicsCollide()
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
    public onUpdate(): void {

        this.instances.forEach((instance) => {

            // create physics impostor
            if (!instance.physicsImpostor) {
                instance.physicsImpostor = new PhysicsImpostor(instance, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 }, this.getScene());
            }

            // move laser forward
            instance.position.addInPlace(instance.up.scale(this._laserSpeed));

            // laser to far of camera, destroy it
            if (instance.position.subtract(this.getScene().activeCamera.position).length() > this._distanceDispawn) {
                instance.dispose();
            } else {

                // check for collisions with other meshes
                let pickResult = this.getScene().pickWithRay(new Ray(instance.position, instance.up, 0.4), (mesh) => {
                    return mesh != instance;
                });

                // if a collision occurred, destroy the laser
                if (pickResult.hit) {
                    instance.dispose();
                }

            }

        });
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
        switch (name) {
            case "message":
                break;
        }
    }
}
