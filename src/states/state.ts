export interface State {
    shieldSize: number;
    load(): void;
    dispose(): void;
    getName(): String;
    fire(force: number): void;
    animate(deltaTime: number): void;
}
