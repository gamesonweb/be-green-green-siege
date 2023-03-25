import { Scene, Mesh, int, MeshBuilder, Vector3, Matrix, Quaternion } from "babylonjs";

export class Ennemy {

    private mesh: Mesh;

    private movementSpeed: number;

    public constructor(scene: Scene, separation_distance: int, speed: int) {
        // set mesh
        this.mesh = MeshBuilder.CreateBox("ennemy", { size: 2 }, scene);
        // set the ennemy position (to a distance of separation_distance value)
        this.setPosition(separation_distance);
        // set movement radius
        this.movementSpeed = speed;
    }

    private setPosition(separation_distance: int): void {
        // Set the initial position of the enemy mesh to a random point on a sphere with a radius of 30
        const randomX = Math.random() * 2 - 1; // Random value between -1 and 1
        const randomY = Math.random() * 2 - 1; // Random value between -1 and 1
        const randomZ = Math.random() * 2 - 1; // Random value between -1 and 1
        const randomPosition = new Vector3(randomX, randomY, randomZ).normalize().scale(separation_distance);
        randomPosition.y = Math.max(Math.random() * separation_distance, 0); // Random height between 0 and 30
        this.mesh.position.copyFrom(randomPosition);
    }

    public update(deltaTime: number): void {
        // Move the enemy randomly
        const randomDirection = new Vector3(
            Math.random() * 2 - 1, // Random value between -1 and 1
            0, // Don't move up or down
            Math.random() * 2 - 1 // Random value between -1 and 1
        );
        randomDirection.normalize();
        this.mesh.position.addInPlace(randomDirection.scale(deltaTime * this.movementSpeed));

        // Calculate the distance from the enemy to the origin
        const distanceFromOrigin = this.mesh.position.length();

        // If the distance is greater than 30, move the enemy back to the nearest point on the circle
        if (distanceFromOrigin > 30) {
            const directionToOrigin = this.mesh.position.negate().normalize();
            const nearestPointOnCircle = directionToOrigin.scale(30);
            this.mesh.position.copyFrom(nearestPointOnCircle);
        }

        // Rotate the enemy towards the player
        const directionToPlayer = this.mesh.position.subtract(this.mesh.position);
        directionToPlayer.y = 0; // Don't rotate up or down
        this.mesh.lookAt(this.mesh.position.add(directionToPlayer));
    }

}
