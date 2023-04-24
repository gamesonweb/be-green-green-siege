import { animations } from './AnimationController';
import starManager from './StarManager';

export class TimeControl {
    private static _timeScale: number = 1;

    public static setTimeScale(timeScale: number) {
        this._timeScale = timeScale;
        animations.setSpeedRatio(timeScale);
        starManager.setTimeSpeedFactor(timeScale);
    }

    public static getTimeScale(): number {
        return this._timeScale;
    }
}
