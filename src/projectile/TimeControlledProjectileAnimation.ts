import timeControl from '../TimeControl';

/**
 * This class is used to animate projectiles with time control.
 * It allows to slow down the animation when the player is in danger.
 * We need a class because we need to know if we need to slow down the animation at the end of the animation loop.
 * We need to regroup all the projectiles information in one place to avoid each projectile instance concern about the time control.
 */
class TimeControlledProjectileAnimation {
    private _needSlowTime: boolean = false;
    private _slowTimeFactor: number = Infinity;

    /**
     * Ask for slow time if the current slow time factor is greater than the given one.
     * @param slowTimeFactor the slow time factor to ask for
     */
    public askSlowTime(slowTimeFactor): void {
        if (!this._needSlowTime && slowTimeFactor < this._slowTimeFactor) {
            this._needSlowTime = true;
            this._slowTimeFactor = slowTimeFactor;
        }
    }

    /**
     * Animate the slow time if needed.
     * This method should be called at the end of the animation loop.
     */
    public animate(): void {
        if (this._needSlowTime) {
            timeControl.activeSlowDanger(this._slowTimeFactor);
        } else {
            timeControl.disableSlowDanger();
        }

        this._needSlowTime = false;
        this._slowTimeFactor = Infinity;
    }
}

export default new TimeControlledProjectileAnimation();
