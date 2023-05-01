import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import score from '../Score';

class ScoreUI {
    /**
     * Add a score label to the given panel
     * @param panel
     * @param levelNumber
     */
    public async addScoreLabel(panel: GUI.StackPanel3D, levelNumber: number) {
        let scoreButton = new GUI.HolographicButton('scoreButton');
        await score.loadTopScores(levelNumber);
        const rank = score.getRank();
        scoreButton.text = `Score: ${score.getCurrentScore()} (Rank: ${rank})`;
        scoreButton.scaling = new BABYLON.Vector3(2, 2, 2);
        panel.addControl(scoreButton);
    }

    /**
     * Add a score label to the given panel
     * @param panel
     * @param levelNumber
     */
    public async displayTopScores(panel: GUI.StackPanel3D, levelNumber: number, top: number = 1) {
        await score.loadTopScores(levelNumber);
        const topScores = score.getTopScores(top);

        topScores.forEach((score, index) => {
            let scoreButton = new GUI.HolographicButton(`topScore${index}`);
            scoreButton.text = `${index + 1}. ${score.score} (${new Date(score.timestamp).toLocaleString()})`;
            console.log(scoreButton.text);
            scoreButton.scaling = new BABYLON.Vector3(2, 2, 2);
            panel.addControl(scoreButton);
        });
    }
}

const scoreUI = new ScoreUI();
export default scoreUI;
