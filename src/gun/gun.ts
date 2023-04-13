export interface Gun {
    fire(): void;
    animate(deltaTime: number): void;
    dispose(): void;
}
