import * as BABYLON from 'babylonjs';

export class Ennemy {

    private _mesh: BABYLON.Mesh;
    private _origin: BABYLON.Vector3;
    private _movementSpeed: number;

    public constructor(scene: BABYLON.Scene, origin: BABYLON.Vector3, separation_distance: number, speed: number) {
        // set mesh
        this._mesh = BABYLON.MeshBuilder.CreateBox("ennemy", { size: 2 }, scene);
        // set the ennemy position (to a distance of separation_distance value)
        this.setPosition(separation_distance);
        // set movement radius
        this._movementSpeed = speed;
        this._origin = origin;
    }

    private setPosition(separation_distance: number): void {
        const randomX = Math.random() * 2 - 1; // Random value between -1 and 1
        const randomY = Math.random() * 2 - 1; // Random value between -1 and 1
        const randomZ = Math.random() * 2 - 1; // Random value between -1 and 1
        const randomPosition = new BABYLON.Vector3(randomX, randomY, randomZ).normalize().scale(separation_distance);
        randomPosition.y = Math.max(Math.random() * separation_distance, 0);
        this._mesh.position.copyFrom(randomPosition);
    }

    public update(deltaTime: number): void {
        // Move the enemy randomly
        const randomDirection = new BABYLON.Vector3(
            Math.random() * 2 - 1, // Random value between -1 and 1
            0, // Don't move up or down
            Math.random() * 2 - 1 // Random value between -1 and 1
        );
        randomDirection.normalize();
        this._mesh.position.addInPlace(randomDirection.scale(deltaTime * this._movementSpeed));

        // Calculate the distance from the enemy to the origin
        const distanceFromOrigin = this._origin.length();

        // If the distance is greater than 30, move the enemy back to the nearest point on the circle
        if (distanceFromOrigin > 30) {
            const directionToOrigin = this._origin.negate().normalize();
            const nearestPointOnCircle = directionToOrigin.scale(30);
            this._origin.copyFrom(nearestPointOnCircle);
        }

        // Rotate the enemy towards the player
        const directionToPlayer = this._mesh.position.subtract(this._origin);
        directionToPlayer.y = 0; // Don't rotate up or down
        this._mesh.lookAt(this._mesh.position.add(directionToPlayer));
    }

    public getMesh(): BABYLON.Mesh {
        return this._mesh;
    }

}
