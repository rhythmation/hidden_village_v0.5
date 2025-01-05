import { Container, Graphics, Stage } from "@pixi/react";
import { useCallback } from "react";
import * as PIXI from "pixi.js";
import { blue, yellow } from "./util/colors";

const Background = (props) => {
  const backgroundHeight = props.height * 0.55;
  
  const draw = useCallback((g) => {
    g.clear();
    g.lineStyle(4, blue, 1);
    
    // horizontal lines
    const horizontalLineOffsets = [0, 0.025, 0.05, 0.1, 0.2, 0.35, 0.6];
    horizontalLineOffsets.forEach((offset) => {
      g.moveTo(0, offset * backgroundHeight);
      g.lineTo(props.width, offset * backgroundHeight);
    });
    
    // draw midline to bottom of screen
    const linesToSideOffsets = [
      0.014, 0.025, 0.05, 0.11, 0.175, 0.25, 0.375, 0.6, 1,
    ];
    linesToSideOffsets.forEach((element) => {
      g.moveTo(props.width / 2, 0);
      g.lineTo(0, props.width * element);
      g.moveTo(props.width / 2, 0);
      g.lineTo(props.width, props.width * element);
    });
    
    const linesToBottomOffsets = [0.375, 0.5, 0.625];
    linesToBottomOffsets.forEach((element) => {
      g.moveTo(props.width / 2, 0);
      g.lineTo(props.width * element, props.height);
    });
  }, [props.height, props.width, backgroundHeight]);

  return (
    <Stage 
      width={props.width} 
      height={props.height}
      options={{
        backgroundColor: yellow,
        antialias: true
      }}
    >
      <Container y={backgroundHeight}>
        <Graphics draw={draw} />
      </Container>
    </Stage>
  );
};

export default Background;