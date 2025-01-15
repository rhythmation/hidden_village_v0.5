import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import PoseDrawer from "../../components/Pose/PoseDrawer.jsx";
import GetPoseData from "../../components/Pose/MotionCaptureUtils.jsx";
import './GamePlayer.css';

const GamePlayer = ({ gameData, initialLevel, onComplete }) => {
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [showCursor, setShowCursor] = useState(false);
  const width = 1200;
  const height = 800;

  const { poseData, loading } = GetPoseData({ width, height });
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

  const backgroundStyle = level.background ? {
    backgroundImage: `url(${level.background})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : undefined;

  return (
    <div className="game-container">
      <div className="game-background" style={backgroundStyle}>
        <div className="nav-container">
          <Link to="/" className="back-link">
            Back to Home
          </Link>
        </div>
        
        <div className="game-content">
          {/* Left side - Sprites area */}
          <div className="sprites-container">
            {level.sprites.map(sprite => (
              <div
                key={sprite.id}
                className="sprite-wrapper"
                style={{
                  left: `${sprite.x}px`,
                  bottom: `${sprite.y}px`,
                  width: `${sprite.appearance.size}px`,
                  height: `${sprite.appearance.size}px`,
                }}
              >
                {sprite.appearance.sprite ? (
                  <img 
                    src={sprite.appearance.sprite}
                    alt={sprite.name}
                    className="sprite-image"
                  />
                ) : (
                  <div className="sprite-shape">
                    {sprite.appearance.shape === 'square' && (
                      <div 
                        className="square-shape"
                        style={{ backgroundColor: sprite.appearance.color || '#4299e1' }}
                      >
                        {sprite.appearance.eyes && (
                          <div className="eyes">
                            <div className="eye left" />
                            <div className="eye right" />
                          </div>
                        )}
                      </div>
                    )}
                    {sprite.appearance.shape === 'triangle' && (
                      <div 
                        className="triangle-shape"
                        style={{ 
                          borderBottomColor: sprite.appearance.color || '#4299e1',
                          borderLeftWidth: `${sprite.appearance.size/2}px`,
                          borderRightWidth: `${sprite.appearance.size/2}px`,
                          borderBottomWidth: `${sprite.appearance.size}px`
                        }}
                      >
                        {sprite.appearance.eyes && (
                          <div className="eyes">
                            <div className="eye left" />
                            <div className="eye right" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side - Pose detection area */}
          <div >
            <PoseDrawer
              poseData={poseData}
              width={width / 2}
              height={height}
              similarityScore={null}
            />
          </div>
        </div>

        {/* Dialogue Box */}
        <div 
          className="dialogue-box"
          style={{ 
            fontSize: `${level.settings.dialogue.fontSettings.baseSize}px`
          }}
        >
          <p className="dialogue-text">{level.dialogues[currentDialogue]}</p>
          {showCursor && (
            <button
              onClick={handleNext}
              className="next-button"
              aria-label="Next"
            >
              →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePlayer;