export interface Gun {
    fire(force: number): void;
    animate(deltaTime: number): void;
    dispose(): void;
}
