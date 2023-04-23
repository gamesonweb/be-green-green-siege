import 'babylonjs-loaders';
import { Game } from './game';

let game: Game;

window.addEventListener('DOMContentLoaded', () => {
    // Set global variable for cannonjs physics engine
    game = new Game('renderCanvas');
    game.createScene();
});

export { game };
