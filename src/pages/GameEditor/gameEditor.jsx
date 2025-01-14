import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MoveUp, MoveDown, Trash2, Plus } from "lucide-react";
import { gameManager } from "../../components/Game/GameManager";
import "./GameEditor.css";

function GameEditor() {
    const {
        games,
        levels,
        selectedGame,
        selectedLevel,
        createGame,
        createLevel,
        selectGame,
        selectLevel,
        updateLevelData,
        spriteOperations,
        dialogueOperations
    } = gameManager();

    const [newNames, setNewNames] = useState({ game: "", level: "" });
    const [activeTab, setActiveTab] = useState("basic");

    const handleCreateGame = () => {
        createGame(newNames.game);
        setNewNames(prev => ({ ...prev, game: "" }));
    };

    const handleCreateLevel = () => {
        createLevel(newNames.level);
        setNewNames(prev => ({ ...prev, level: "" }));
    };

    return (
        <div className="game-editor-container">
            {/* Games Section */}
            <div className="game-editor-section">
                <h2 className="game-editor-title">Game Editor</h2>
                <div className="game-editor-input-group">
                    <input
                        type="text"
                        placeholder="New Game Name"
                        value={newNames.game}
                        onChange={(e) => setNewNames(prev => ({ ...prev, game: e.target.value }))}
                        className="game-editor-input"
                    />
                    <button onClick={handleCreateGame} className="game-editor-button">Create Game</button>
                </div>
                
                <div className="game-editor-grid">
                    {games.map((game) => (
                        <button
                            key={game.id}
                            onClick={() => selectGame(game.id)}
                            className={`game-editor-grid-button ${selectedGame?.id === game.id ? 'game-editor-selected' : ''}`}
                        >
                            {game.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Levels Section */}
            {selectedGame && (
                <div className="game-editor-section">
                    <h3 className="game-editor-subtitle">Level Editor - {selectedGame.name}</h3>
                    <div className="game-editor-input-group">
                        <input
                            type="text"
                            placeholder="New Level Name"
                            value={newNames.level}
                            onChange={(e) => setNewNames(prev => ({ ...prev, level: e.target.value }))}
                            className="game-editor-input"
                        />
                        <button onClick={handleCreateLevel} className="game-editor-button">Create Level</button>
                    </div>

                    <div className="game-editor-grid">
                        {levels.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => selectLevel(level.id)}
                                className={`game-editor-grid-button ${selectedLevel?.id === level.id ? 'game-editor-selected' : ''}`}
                            >
                                {level.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Level Details Section */}
            {selectedLevel && (
                <div className="game-editor-level-details">
                    <h3 className="game-editor-subtitle">Level Details - {selectedLevel.name}</h3>
                    <div className="game-editor-tabs">
                        {["basic", "sprites", "dialogues", "settings"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`game-editor-tab ${activeTab === tab ? 'game-editor-tab-active' : ''}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="game-editor-tab-content">
                        {/* Basic Tab */}
                        {activeTab === "basic" && (
                            <div className="game-editor-form">
                                <div className="game-editor-form-group">
                                    <label>Level Name</label>
                                    <input
                                        type="text"
                                        value={selectedLevel.name}
                                        onChange={(e) => updateLevelData({ name: e.target.value })}
                                        className="game-editor-input"
                                    />
                                </div>
                                <div className="game-editor-form-group">
                                    <label>Background</label>
                                    <select
                                        value={selectedLevel.background || ""}
                                        onChange={(e) => updateLevelData({ background: e.target.value })}
                                        className="game-editor-select"
                                    >
                                        <option value="">Select background</option>
                                        <option value="/backgrounds/forest.jpg">Forest</option>
                                        <option value="/backgrounds/castle.jpg">Castle</option>
                                        <option value="/backgrounds/space.jpg">Space</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Sprites Tab */}
                        {activeTab === "sprites" && (
                            <div className="game-editor-sprites">
                                <button 
                                    onClick={spriteOperations.add}
                                    className="game-editor-add-button"
                                >
                                    <Plus size={16} style={{ marginRight: '4px' }} />
                                    Add Sprite
                                </button>
                                {selectedLevel.sprites?.map((sprite) => (
                                    <div key={sprite.id} className="game-editor-sprite-card">
                                        <div className="game-editor-sprite-header">
                                            <label>Sprite Name</label>
                                            <button 
                                                onClick={() => spriteOperations.remove(sprite.id)}
                                                className="game-editor-remove-button"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <input
                                            value={sprite.name}
                                            onChange={(e) => spriteOperations.update(sprite.id, { name: e.target.value })}
                                            className="game-editor-input"
                                        />
                                        <div className="game-editor-sprite-position">
                                            <div className="game-editor-form-group">
                                                <label>X Position</label>
                                                <input
                                                    type="number"
                                                    value={sprite.x}
                                                    onChange={(e) => spriteOperations.update(sprite.id, { x: Number(e.target.value) })}
                                                    className="game-editor-input"
                                                />
                                            </div>
                                            <div className="game-editor-form-group">
                                                <label>Y Position</label>
                                                <input
                                                    type="number"
                                                    value={sprite.y}
                                                    onChange={(e) => spriteOperations.update(sprite.id, { y: Number(e.target.value) })}
                                                    className="game-editor-input"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Dialogues Tab */}
                        {activeTab === "dialogues" && (
                            <div className="game-editor-dialogues">
                                <button 
                                    onClick={dialogueOperations.add}
                                    className="game-editor-add-button"
                                >
                                    <Plus size={16} style={{ marginRight: '4px' }} />
                                    Add Dialogue
                                </button>
                                
                                {selectedLevel.dialogues?.map((dialogue, index) => (
                                    <div key={index} className="game-editor-sprite-card">
                                        <div className="game-editor-sprite-header">
                                            <label>Dialogue {index + 1}</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => dialogueOperations.moveUp(index)}
                                                    disabled={index === 0}
                                                    className="game-editor-button"
                                                    style={{ padding: '4px' }}
                                                >
                                                    <MoveUp size={16} />
                                                </button>
                                                <button
                                                    onClick={() => dialogueOperations.moveDown(index)}
                                                    disabled={index === selectedLevel.dialogues.length - 1}
                                                    className="game-editor-button"
                                                    style={{ padding: '4px' }}
                                                >
                                                    <MoveDown size={16} />
                                                </button>
                                                <button
                                                    onClick={() => dialogueOperations.remove(index)}
                                                    className="game-editor-remove-button"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            value={dialogue}
                                            onChange={(e) => dialogueOperations.update(index, e.target.value)}
                                            className="game-editor-textarea"
                                            placeholder="Enter dialogue text..."
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === "settings" && (
                            <div className="game-editor-settings">
                                <div className="game-editor-form-group">
                                    <h4 className="game-editor-subtitle">Dialogue Settings</h4>
                                    <div className="game-editor-form-group">
                                        <label>Font Size</label>
                                        <input
                                            type="number"
                                            value={selectedLevel.settings.dialogue.fontSettings.baseSize}
                                            onChange={(e) => {
                                                const newSettings = { ...selectedLevel.settings };
                                                newSettings.dialogue.fontSettings.baseSize = Number(e.target.value);
                                                updateLevelData({ settings: newSettings });
                                            }}
                                            className="game-editor-input"
                                        />
                                    </div>

                                    <div className="game-editor-form-group">
                                        <label>Character Limit</label>
                                        <input
                                            type="number"
                                            value={selectedLevel.settings.dialogue.fontSettings.maxCharLimit}
                                            onChange={(e) => {
                                                const newSettings = { ...selectedLevel.settings };
                                                newSettings.dialogue.fontSettings.maxCharLimit = Number(e.target.value);
                                                updateLevelData({ settings: newSettings });
                                            }}
                                            className="game-editor-input"
                                        />
                                    </div>

                                    <div className="game-editor-form-group">
                                        <label>Display Speed</label>
                                        <select
                                            value={selectedLevel.settings.dialogue.display.speed}
                                            onChange={(e) => {
                                                const newSettings = { ...selectedLevel.settings };
                                                newSettings.dialogue.display.speed = e.target.value;
                                                updateLevelData({ settings: newSettings });
                                            }}
                                            className="game-editor-select"
                                        >
                                            <option value="slow">Slow</option>
                                            <option value="normal">Normal</option>
                                            <option value="fast">Fast</option>
                                        </select>
                                    </div>

                                    <div className="game-editor-form-group">
                                        <label>Display Position</label>
                                        <select
                                            value={selectedLevel.settings.dialogue.display.position}
                                            onChange={(e) => {
                                                const newSettings = { ...selectedLevel.settings };
                                                newSettings.dialogue.display.position = e.target.value;
                                                updateLevelData({ settings: newSettings });
                                            }}
                                            className="game-editor-select"
                                        >
                                            <option value="top">Top</option>
                                            <option value="middle">Middle</option>
                                            <option value="bottom">Bottom</option>
                                        </select>
                                    </div>

                                    <div className="game-editor-form-group">
                                        <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedLevel.settings.dialogue.display.autoProgress}
                                                onChange={(e) => {
                                                    const newSettings = { ...selectedLevel.settings };
                                                    newSettings.dialogue.display.autoProgress = e.target.checked;
                                                    updateLevelData({ settings: newSettings });
                                                }}
                                            />
                                            Auto Progress Dialogues
                                        </label>
                                    </div>
                                </div>

                                <div className="game-editor-form-group">
                                    <h4 className="game-editor-subtitle">Audio Settings</h4>
                                    <div className="game-editor-form-group">
                                        <label>BGM Volume</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={selectedLevel.settings.audio.bgmVolume}
                                            onChange={(e) => {
                                                const newSettings = { ...selectedLevel.settings };
                                                newSettings.audio.bgmVolume = Number(e.target.value);
                                                updateLevelData({ settings: newSettings });
                                            }}
                                            className="game-editor-input"
                                        />
                                    </div>

                                    <div className="game-editor-form-group">
                                        <label>SFX Volume</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={selectedLevel.settings.audio.sfxVolume}
                                            onChange={(e) => {
                                                const newSettings = { ...selectedLevel.settings };
                                                newSettings.audio.sfxVolume = Number(e.target.value);
                                                updateLevelData({ settings: newSettings });
                                            }}
                                            className="game-editor-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="game-editor-navigation">
                <Link to="/" className="game-editor-back-link">
                    <button className="game-editor-button">Back to Home</button>
                </Link>
            </div>
        </div>
    );
}

export default GameEditor;