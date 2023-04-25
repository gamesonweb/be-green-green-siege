import { animations } from './AnimationController';
import starManager from './StarManager';

/**
 * Class that controls the simulation time.
 */
class TimeControl {
    private _timeScale: number = 1;
    private _paused: boolean = false;

    /**
     * Modifies the time scale, checking if the simulation is paused.
     * @param timeScale - The new time scale.
     */
    public setTimeScale(timeScale: number): void {
        if (!this._paused) {
            this.updateTimeScale(timeScale);
        }
    }

    /**
     * Modifies the time scale without checking if the simulation is paused.
     * @param timeScale - The new time scale.
     * @private
     */
    private updateTimeScale(timeScale: number): void {
        if (timeScale >= 0) {
            this._timeScale = timeScale;
            animations.updateSpeedRatio(timeScale);
            starManager.setTimeSpeedFactor(timeScale);
        } else {
            console.error('The time scale factor cannot be negative.');
        }
    }

    /**
     * Checks if the simulation is paused.
     * @returns {boolean} - Whether the simulation is paused.
     */
    public isPaused(): boolean {
        return this._paused;
    }

    /**
     * Gets the current time scale.
     * @returns {number} - The current time scale.
     */
    public getTimeScale(): number {
        return this._timeScale;
    }

    /**
     * Toggles the simulation between paused and running.
     */
    public togglePause(): void {
        this._paused = !this._paused;
        this.updateTimeScale(this._paused ? 0 : this._timeScale);
    }
}

const timeControl = new TimeControl();
export default timeControl;
