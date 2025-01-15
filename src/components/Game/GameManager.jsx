import { useState } from 'react';

const DEFAULTS = {
    TITLE: "GAME TITLE",
    DESCRIPTION: "GAME DESCRIPTION",
    DIALOGUES: ["Welcome to the game!", "This is your first challenge.", "Well done!"],
    SPRITES: [],
    BACKGROUND: null,
    SETTINGS: {
        dialogue: {
            fontSettings: {
                baseSize: 16,
                maxCharLimit: 100,
                scalingRatio: 1.2,
                minFontSize: 12,
                maxFontSize: 24,
            },
            display: {
                speed: "normal",
                position: "bottom",
                autoProgress: false
            }
        },
        cursor: {
            hoverDelay: 500,
            visibility: "auto",
        },
        audio: {
            bgmVolume: 0.7,
            sfxVolume: 1.0,
            voiceVolume: 1.0
        }
    }
};

//TODO: Combine this with database
export function gameManager() {
    const [gameData, setGameData] = useState({
        games: [
            { id: "game1", name: "Math Adventure" },
            { id: "game2", name: "Space Explorer" },
            { id: "game3", name: "Word Wizard" },
        ],
        levels: [
            { 
                id: "level1", 
                gameId: "game1", 
                name: "Level 1",
                background: "/backgrounds/default.jpg",
                sprites: [
                    { id: "sprite1", name: "Player", image: "/sprites/player.png", x: 100, y: 100 },
                    { id: "sprite2", name: "Enemy", image: "/sprites/enemy.png", x: 200, y: 200 }
                ],
                dialogues: DEFAULTS.DIALOGUES,
                settings: DEFAULTS.SETTINGS
            },
        ]
    });

    const [selectedIds, setSelectedIds] = useState({
        gameId: null,
        levelId: null
    });

    const selectedGame = gameData.games.find(g => g.id === selectedIds.gameId);
    const selectedLevel = gameData.levels.find(l => l.id === selectedIds.levelId);
    const gameLevels = gameData.levels.filter(l => l.gameId === selectedIds.gameId);

    const createGame = (gameName) => {
        if (!gameName.trim()) return;
        
        const gameId = `game${Date.now()}`;
        const newGame = {
            id: gameId,
            name: gameName,
            description: DEFAULTS.DESCRIPTION,
            settings: DEFAULTS.SETTINGS
        };
        
        setGameData(prev => ({
            ...prev,
            games: [...prev.games, newGame]
        }));
    };

    const createLevel = (levelName) => {
        if (!selectedIds.gameId || !levelName.trim()) return;

        const newLevel = {
            id: `level${Date.now()}`,
            gameId: selectedIds.gameId,
            name: levelName,
            background: DEFAULTS.BACKGROUND,
            sprites: DEFAULTS.SPRITES,
            dialogues: DEFAULTS.DIALOGUES,
            settings: DEFAULTS.SETTINGS
        };

        setGameData(prev => ({
            ...prev,
            levels: [...prev.levels, newLevel]
        }));
    };

    const updateLevelData = (updates) => {
        if (!selectedIds.levelId) return;

        setGameData(prev => ({
            ...prev,
            levels: prev.levels.map(level => 
                level.id === selectedIds.levelId 
                    ? { ...level, ...updates }
                    : level
            )
        }));
    };

    const spriteOperations = {
        add: () => {
            if (!selectedLevel) return;
            
            const newSprite = {
                id: `sprite${Date.now()}`,
                name: "New Sprite",
                image: "/sprites/default.png",
                x: 0,
                y: 0
            };

            const updatedSprites = [...(selectedLevel.sprites || []), newSprite];
            updateLevelData({ sprites: updatedSprites });
        },

        remove: (spriteId) => {
            if (!selectedLevel) return;
            const updatedSprites = selectedLevel.sprites.filter(sprite => sprite.id !== spriteId);
            updateLevelData({ sprites: updatedSprites });
        },

        update: (spriteId, updates) => {
            if (!selectedLevel) return;
            const updatedSprites = selectedLevel.sprites.map(sprite =>
                sprite.id === spriteId ? { ...sprite, ...updates } : sprite
            );
            updateLevelData({ sprites: updatedSprites });
        }
    };

    const dialogueOperations = {
        add: () => {
            if (!selectedLevel) return;
            const newDialogues = [...(selectedLevel.dialogues || []), "New dialogue..."];
            updateLevelData({ dialogues: newDialogues });
        },

        remove: (index) => {
            if (!selectedLevel) return;
            const newDialogues = selectedLevel.dialogues.filter((_, i) => i !== index);
            updateLevelData({ dialogues: newDialogues });
        },

        moveUp: (index) => {
            if (!selectedLevel || index === 0) return;
            const newDialogues = [...selectedLevel.dialogues];
            [newDialogues[index - 1], newDialogues[index]] = [newDialogues[index], newDialogues[index - 1]];
            updateLevelData({ dialogues: newDialogues });
        },

        moveDown: (index) => {
            if (!selectedLevel || index === selectedLevel.dialogues.length - 1) return;
            const newDialogues = [...selectedLevel.dialogues];
            [newDialogues[index], newDialogues[index + 1]] = [newDialogues[index + 1], newDialogues[index]];
            updateLevelData({ dialogues: newDialogues });
        },

        update: (index, text) => {
            if (!selectedLevel) return;
            const newDialogues = [...selectedLevel.dialogues];
            newDialogues[index] = text;
            updateLevelData({ dialogues: newDialogues });
        }
    };

    const selectGame = (gameId) => {
        setSelectedIds(prev => ({ ...prev, gameId, levelId: null }));
    };

    const selectLevel = (levelId) => {
        setSelectedIds(prev => ({ ...prev, levelId }));
    };

    return {
        games: gameData.games,
        levels: gameLevels,
        selectedGame,
        selectedLevel,
        createGame,
        createLevel,
        selectGame,
        selectLevel,
        updateLevelData,
        spriteOperations,
        dialogueOperations
    };
}