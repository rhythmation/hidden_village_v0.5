import React, { useState } from "react";
import { Link } from "react-router-dom";
import Background from "../../components/Background";

function GameEditor() {
    const [height, setHeight] = useState(window.innerHeight);
    const [width, setWidth] = useState(window.innerWidth);
    const [games, setGames] = useState([
        { id: 1, name: "Math Adventure" },
        { id: 2, name: "Space Explorer" },
        { id: 3, name: "Word Wizard" },
    ]);
    const [newGameName, setNewGameName] = useState("");
    const [selectedGame, setSelectedGame] = useState(null);
    const [levels, setLevels] = useState([
        { id: 1, gameId: 1, name: "Level 1" },
        { id: 2, gameId: 1, name: "Level 2" },
        { id: 3, gameId: 2, name: "Level 1" },
    ]);
    const [newLevelName, setNewLevelName] = useState("");

    const handleSelectGame = (gameId) => {
        const game = games.find((g) => g.id === gameId);
        setSelectedGame(game);
    };

    const handleAddGame = () => {
        if (newGameName.trim()) {
            const newGame = {
                id: games.length + 1,
                name: newGameName,
            };
            setGames([...games, newGame]);
            setNewGameName("");
        }
    };

    const handleAddLevel = () => {
        if (newLevelName.trim() && selectedGame) {
            const newLevel = {
                id: levels.length + 1,
                gameId: selectedGame.id,
                name: newLevelName,
            };
            setLevels([...levels, newLevel]);
            setNewLevelName("");
        }
    };

    const handleSelectLevel = (levelId) => {
        const level = levels.find((l) => l.id === levelId);
        console.log("Selected Level:", level);
        // Add logic to edit the selected level
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <Background height={height} width={width} />
            <div style={{ 
                position: 'absolute', 
                top: 0,
                left: 0,
                right: 0,
                maxWidth: "600px", 
                margin: "0 auto", 
                padding: "1rem",
                zIndex: 1
            }}>
                <h2>Game Editor</h2>
                <div style={{ marginBottom: "2rem" }}>
                    <h3>Create a New Game</h3>
                    <input
                        type="text"
                        placeholder="New Game Name"
                        value={newGameName}
                        onChange={(e) => setNewGameName(e.target.value)}
                        style={{ marginRight: "1rem", padding: "0.5rem" }}
                    />
                    <button onClick={handleAddGame} style={{ padding: "0.5rem 1rem" }}>
                        Add Game
                    </button>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <h3>Select an Existing Game</h3>
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        {games.map((game) => (
                            <li key={game.id} style={{ marginBottom: "1rem" }}>
                                <button
                                    onClick={() => handleSelectGame(game.id)}
                                    style={{ padding: "0.5rem 1rem" }}
                                >
                                    {game.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {selectedGame && (
                    <div style={{ marginTop: "2rem" }}>
                        <h3>Editing: {selectedGame.name}</h3>
                        <div style={{ marginBottom: "2rem" }}>
                            <h4>Create a New Level</h4>
                            <input
                                type="text"
                                placeholder="New Level Name"
                                value={newLevelName}
                                onChange={(e) => setNewLevelName(e.target.value)}
                                style={{ marginRight: "1rem", padding: "0.5rem" }}
                            />
                            <button onClick={handleAddLevel} style={{ padding: "0.5rem 1rem" }}>
                                Add Level
                            </button>
                        </div>

                        <div style={{ marginBottom: "2rem" }}>
                            <h4>Select an Existing Level</h4>
                            <ul style={{ listStyleType: "none", padding: 0 }}>
                                {levels
                                    .filter((level) => level.gameId === selectedGame.id)
                                    .map((level) => (
                                        <li key={level.id} style={{ marginBottom: "1rem" }}>
                                            <button
                                                onClick={() => handleSelectLevel(level.id)}
                                                style={{ padding: "0.5rem 1rem" }}
                                            >
                                                {level.name}
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                )}

                <p style={{ marginTop: "2rem" }}>
                    <Link to="/">Back to Home</Link>
                </p>
            </div>
        </div>
    );
}

export default GameEditor;