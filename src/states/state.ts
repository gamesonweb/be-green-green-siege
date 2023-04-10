export interface State {
    load(): void;
    dispose(): void;
    getName(): String;
    canFire(): boolean;
    fire(): void;
    animate(deltaTime: number): void;
}
