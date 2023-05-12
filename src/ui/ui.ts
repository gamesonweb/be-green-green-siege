import { TransformNode } from 'babylonjs';
import { StateUIEnum } from './stateUI';

export default interface UI {
    anchor: TransformNode;

    load(state: StateUIEnum, levelNumber: number): void;
    dispose(): void;
}
