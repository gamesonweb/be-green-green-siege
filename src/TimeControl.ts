import { animations } from './AnimationController';

export class TimeControl {
    private static _timeScale: number = 1;

    public static setTimeScale(timeScale: number) {
        this._timeScale = timeScale;
        animations.setSpeedRatio(timeScale);
    }

    public static getTimeScale(): number {
        return this._timeScale;
    }
}
