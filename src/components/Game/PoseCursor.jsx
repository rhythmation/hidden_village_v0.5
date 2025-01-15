import React, { useEffect, useState, useRef } from 'react';

const PoseCursor = ({ 
  poseData, 
  containerWidth, 
  containerHeight, 
  onClick,
  children,
  sensitivity = 1.2
}) => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [hoverStartTime, setHoverStartTime] = useState(null);
  const lastClickTime = useRef(0);
  const hoverElement = useRef(null);
  const HOVER_THRESHOLD = 200;
  
  useEffect(() => {
    if (!poseData?.leftHandLandmarks?.[8]) return;

    const indexFinger = poseData.leftHandLandmarks[8];
    const palm = poseData.leftHandLandmarks[0];

    const x = indexFinger.x * containerWidth * sensitivity;
    const y = indexFinger.y * containerHeight * sensitivity;
    
    // Bound the coordinates
    const boundedX = Math.min(Math.max(x, 0), containerWidth);
    const boundedY = Math.min(Math.max(y, 0), containerHeight);
    
    setCursorPos({ x: boundedX, y: boundedY });

    // Check for hovering over clickable elements
    const elementsAtPoint = document.elementsFromPoint(boundedX, boundedY);
    const nextButton = elementsAtPoint.find(el => el.classList.contains('next-button'));

    if (nextButton) {
      if (!hoverStartTime) {
        setHoverStartTime(Date.now());
        hoverElement.current = nextButton;
      } else if (Date.now() - hoverStartTime >= HOVER_THRESHOLD && hoverElement.current === nextButton) {
        const now = Date.now();
        if (now - lastClickTime.current > 1000) {
          setIsClicking(true);
          lastClickTime.current = now;
          onClick?.(boundedX, boundedY);
          setHoverStartTime(null);
          hoverElement.current = null;
        }
      }
    } else {
      setHoverStartTime(null);
      hoverElement.current = null;
      setIsClicking(false);
    }

    // Traditional click detection
    if (palm) {
      const distance = Math.sqrt(
        Math.pow(indexFinger.x - palm.x, 2) + 
        Math.pow(indexFinger.y - palm.y, 2)
      );
      
      if (distance < 0.15) {
        const now = Date.now();
        if (now - lastClickTime.current > 300) {
          setIsClicking(true);
          lastClickTime.current = now;
          onClick?.(boundedX, boundedY);
        }
      }
    }
  }, [poseData, containerWidth, containerHeight, onClick, sensitivity, hoverStartTime]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
      <div
        className="pose-cursor"
        style={{
          position: 'absolute',
          left: cursorPos.x,
          top: cursorPos.y,
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: isClicking ? 'rgba(255, 0, 0, 0.6)' : 
                         hoverStartTime ? `rgba(255, 165, 0, ${(Date.now() - hoverStartTime) / HOVER_THRESHOLD})` : 
                         'rgba(255, 255, 255, 0.6)',
          border: '3px solid white',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 1000,
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          transition: 'background-color 0.1s ease-out'
        }}
      />
    </div>
  );
};

export default PoseCursor;