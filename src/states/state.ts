import { StatesEnum } from "./stateManager";

export interface State {
    shieldSize: number;
    type: StatesEnum;
    load(): void;
    dispose(): void;
    getName(): String;
    fire(force: number): void;
    animate(deltaTime: number): void;
    pause();
    resume();
}
