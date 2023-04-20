export interface State {
    shieldSize: number;
    load(): void;
    dispose(): void;
    getName(): String;
    fire(): void;
    animate(deltaTime: number): void;
}
