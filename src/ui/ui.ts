import { TransformNode } from "babylonjs";

export default interface UI {
    anchor: TransformNode;
    
    load(): void;
    dispose(): void;
}