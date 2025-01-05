import React, { useCallback, useState, useEffect } from "react";
import { Container, Graphics, Stage } from "@pixi/react";
import { blue, yellow } from "./util/colors";

const Layout = ({ children }) => {
  const [height, setHeight] = useState(window.innerHeight);
  const [width, setWidth] = useState(window.innerWidth);
  const backgroundHeight = height * 0.55;

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const draw = useCallback((g) => {
    g.clear();
    g.lineStyle(4, blue, 1);
    
    // horizontal lines
    const horizontalLineOffsets = [0, 0.025, 0.05, 0.1, 0.2, 0.35, 0.6];
    horizontalLineOffsets.forEach((offset) => {
      g.moveTo(0, offset * backgroundHeight);
      g.lineTo(width, offset * backgroundHeight);
    });
    
    // draw midline to bottom of screen
    const linesToSideOffsets = [
      0.014, 0.025, 0.05, 0.11, 0.175, 0.25, 0.375, 0.6, 1,
    ];
    linesToSideOffsets.forEach((element) => {
      g.moveTo(width / 2, 0);
      g.lineTo(0, width * element);
      g.moveTo(width / 2, 0);
      g.lineTo(width, width * element);
    });
    
    const linesToBottomOffsets = [0.375, 0.5, 0.625];
    linesToBottomOffsets.forEach((element) => {
      g.moveTo(width / 2, 0);
      g.lineTo(width * element, height);
    });
  }, [height, width, backgroundHeight]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none' // This allows clicks to pass through to content
      }}>
        <Stage 
          width={width} 
          height={height}
          options={{
            backgroundColor: yellow,
            antialias: true
          }}
        >
          <Container y={backgroundHeight}>
            <Graphics draw={draw} />
          </Container>
        </Stage>
      </div>
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        overflow: 'auto'
      }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;