import { animations } from './AnimationController';
import starManager from './StarManager';

/**
 * Class responsible for controlling the simulation time.
 * This class allows pausing, resuming, and applying slow motion effects to the simulation.
 */
class TimeControl {
    private readonly _normalTime: number = 1;

    private _paused: boolean = false;
    private readonly _pausedTime: number = 0;

    private _slowPower: boolean = false;
    private _slowPowerTime: number;

    private _slowDanger: boolean = false;
    private _slowDangerTime: number;

    /**
     * Activates the pause state of the simulation.
     */
    public pause(): void {
        if (!this._paused) {
            this._paused = true;
            this.update();
        }
    }

    /**
     * Disables the pause state of the simulation.
     */
    public resume(): void {
        if (this._paused) {
            this._paused = false;
            this.update();
        }
    }

    /**
     * Checks if input is valid.
     * @param input - The input to be checked.
     * @returns {boolean} - True if the input is valid, false otherwise.
     */
    private validInput(input: number): boolean {
        if (input < 0) {
            console.error('The time scale factor cannot be negative.');
            return false;
        } else if (input > 1) {
            console.error('The time scale factor cannot be greater than 1.');
            return false;
        } else if (input === 1) {
            console.warn('The time scale factor cannot be equal to 1. Use disableSlowDanger() instead.');
            return false;
        }
        return true;
    }

    /**
     * Activates slow motion for power-related events.
     * @param {number} force - The time scale factor for the slow motion effect.
     */
    public activeSlowPower(force: number): void {
        if (this.validInput(force) && !this._slowPower && this._slowPowerTime !== force) {
            this._slowPower = true;
            this._slowPowerTime = force;
            this.update();
        }
    }

    /**
     * Activates slow motion for danger-related events.
     * @param {number} force - The time scale factor for the slow motion effect.
     */
    public activeSlowDanger(force: number): void {
        if (this.validInput(force) && !this._slowDanger && this._slowDangerTime !== force) {
            this._slowDanger = true;
            this._slowDangerTime = force;
            this.update();
        }
    }

    /**
     * Disables slow motion for power-related events.
     */
    public disableSlowPower(): void {
        if (this._slowPower) {
            this._slowPower = false;
            this.update();
        }

        // reset the slow power time to undefined to allow the slow power to be activated again
        this._slowPowerTime = undefined;
    }

    /**
     * Disables slow motion for danger-related events.
     */
    public disableSlowDanger(): void {
        if (this._slowDanger) {
            this._slowDanger = false;
            this.update();
        }

        // reset the slow danger time to undefined to allow the slow danger to be activated again
        this._slowDangerTime = undefined;
    }

    /**
     * Updates the speed ratio of the animations and the star manager based on the current state.
     */
    private update(): void {
        if (this._paused) {
            animations.updateSpeedRatio(this._pausedTime);
            starManager.updateSpeedRatio(this._pausedTime);
        } else if (this._slowDanger) {
            animations.updateSpeedRatio(this._slowDangerTime);
            starManager.updateSpeedRatio(this._slowDangerTime);
        } else if (this._slowPower) {
            animations.updateSpeedRatio(this._slowPowerTime);
            starManager.updateSpeedRatio(this._slowPowerTime);
        } else {
            animations.updateSpeedRatio(this._normalTime);
            starManager.updateSpeedRatio(this._normalTime);
        }
    }

    /**
     * Gets the current time scale factor.
     * @returns {number} - The current time scale factor.
     */
    public getTimeScale(): number {
        if (this._paused) {
            return this._pausedTime;
        } else if (this._slowDanger) {
            return this._slowDangerTime;
        } else if (this._slowPower) {
            return this._slowPowerTime;
        } else {
            return this._normalTime;
        }
    }

    /**
     * Checks if the simulation is paused.
     * @returns {boolean} - True if the simulation is paused, false otherwise.
     */
    public isPaused(): boolean {
        return this._paused;
    }

    /**
     * Checks if slow motion for danger-related events is active.
     * @returns {boolean} - True if slow motion for danger-related events is active, false otherwise.
     *  */
    public isSlowDanger(): boolean {
        return this._slowDanger;
    }

    /**
     * Checks if slow motion for power-related events is active.
     * @returns {boolean} - True if slow motion for power-related events is active, false otherwise.
     * */
    public isSlowPower(): boolean {
        return this._slowPower;
    }
}

const timeControl = new TimeControl();
export default timeControl;
