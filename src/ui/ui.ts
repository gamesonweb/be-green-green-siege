import { TransformNode } from "babylonjs";
import { StateUIEnum } from "./stateUI";

export default interface UI {
    anchor: TransformNode;
    
    load(state: StateUIEnum): void;
    dispose(): void;
}