import { Link } from "react-router-dom";
import { sampleGameData } from "../../components/Game/SampleGameData";
import GamePlayer from "../../components/Game/GamePlayer";

function GameMenu() {
    return (
        <div>
            <GamePlayer 
                gameData={sampleGameData}
                initialLevel="intro"
                onComplete={(gameId, levelId) => {
                    console.log(`Completed level ${levelId}`);
                }}
            />
        </div>
    )
}

export default GameMenu;