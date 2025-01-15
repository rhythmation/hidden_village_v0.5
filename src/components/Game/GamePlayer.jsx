import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import PoseDrawer from "../../components/Pose/PoseDrawer.jsx";
import GetPoseData from "../../components/Pose/MotionCaptureUtils.jsx";
import PoseCursor from "./PoseCursor";
import './GamePlayer.css';

// Constants for UI elements
const UI_CONSTANTS = {
  NEXT_BUTTON: {
    SIZE: 80,
    ARROW_SIZE: 48,
    HOVER_COLOR: '#ffd700',
    TRANSITION_DURATION: '0.3s'
  },
  CONTAINER: {
    WIDTH: 1200,
    HEIGHT: 800
  }
};

const Sprite = ({ sprite }) => {
  const { x, y, appearance, name } = sprite;
  
  return (
    <div 
      className="sprite-wrapper" 
      style={{
        left: `${x}px`,
        bottom: `${y}px`,
        width: `${appearance.size}px`,
        height: `${appearance.size}px`,
      }}
    >
      <img 
        src={appearance.sprite}
        alt={name}
        className="sprite-image"
      />
    </div>
  );
};

const GamePlayer = ({ gameData, initialLevel, onComplete }) => {
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [showCursor, setShowCursor] = useState(false);
  const { poseData, loading } = GetPoseData({ 
    width: UI_CONSTANTS.CONTAINER.WIDTH, 
    height: UI_CONSTANTS.CONTAINER.HEIGHT 
  });

  const level = gameData.levels.find(l => l.id === initialLevel);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCursor(true);
    }, level.settings.cursor.delayMS);
    
    return () => clearTimeout(timer);
  }, [currentDialogue, level.settings.cursor.delayMS]);

  const handleNext = () => {
    if (currentDialogue < level.dialogues.length - 1) {
      setCurrentDialogue(prev => prev + 1);
      setShowCursor(false);
    } else {
      onComplete?.(gameData.id, level.id);
    }
  };

  const handleCursorClick = (x, y) => {
    const nextButton = document.querySelector('.next-button');
    if (!nextButton) return;

    const rect = nextButton.getBoundingClientRect();
    const isWithinButton = 
      x >= rect.left && 
      x <= rect.right && 
      y >= rect.top && 
      y <= rect.bottom;

    if (isWithinButton) {
      handleNext();
    }
  };

  const backgroundStyle = level.background ? {
    backgroundImage: `url(${level.background})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : undefined;

  return (
    <>
      <PoseCursor
        poseData={poseData}
        containerWidth={window.innerWidth}
        containerHeight={window.innerHeight}
        onClick={handleCursorClick}
        sensitivity={1.5}
      />
      <div className="game-container">
        <div className="game-background" style={backgroundStyle}>
          <nav className="nav-container">
            <Link to="/" className="back-link">
              Back to Home
            </Link>
          </nav>

          <main className="game-content">
            <div className="sprites-container">
              {level.sprites.map(sprite => (
                <Sprite key={sprite.id} sprite={sprite} />
              ))}
            </div>

            <div className="pose-drawer-container">
              <PoseDrawer
                poseData={poseData}
                width={UI_CONSTANTS.CONTAINER.WIDTH / 3}
                height={UI_CONSTANTS.CONTAINER.HEIGHT}
                similarityScore={null}
              />
            </div>
          </main>

          <footer 
            className="dialogue-box"
            style={{ 
              fontSize: `${level.settings.dialogue.fontSettings.baseSize}px`,
            }}
          >
            <p className="dialogue-text">{level.dialogues[currentDialogue]}</p>
            {showCursor && (
              <button
                onClick={handleNext}
                className="next-button"
                style={{
                  width: `${UI_CONSTANTS.NEXT_BUTTON.SIZE}px`,
                  height: `${UI_CONSTANTS.NEXT_BUTTON.SIZE}px`,
                  fontSize: `${UI_CONSTANTS.NEXT_BUTTON.ARROW_SIZE}px`,
                  transition: `all ${UI_CONSTANTS.NEXT_BUTTON.TRANSITION_DURATION} ease`
                }}
                aria-label="Next"
              >
                →
              </button>
            )}
          </footer>
        </div>
      </div>
    </>
  );
};

export default GamePlayer;