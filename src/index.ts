import 'babylonjs-loaders';
import { Game } from './game';
import CANNON = require('cannon');

let game;

window.addEventListener('DOMContentLoaded', () => {
  // Set global variable for cannonjs physics engine
  window.CANNON = CANNON;
  game = new Game('renderCanvas');
  game.createScene();
  game.animate();
});

export { game };