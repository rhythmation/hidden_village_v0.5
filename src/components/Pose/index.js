import { useCallback, useState, forwardRef } from "react";
import { Graphics, Container } from "@inlet/react-pixi";
import { Graphics as PIXIGraphics } from "@pixi/graphics";
import {
  FACEMESH_FACE_OVAL,
  POSE_LANDMARKS,
} from "@mediapipe/holistic/holistic";
import { blue, yellow, pink } from "../../utils/colors";
import { LANDMARK_GROUPINGS } from "./landmark_utilities";
import { landmarkToCoordinates, objMap } from "./pose_drawing_utilities";
import { scale } from "chroma-js";

const matchedFill = scale([yellow.toString(16), pink.toString(16)]).domain([0, 100,]);
const matchedStroke = scale([blue.toString(16), pink.toString(16)]).domain([0, 100,]);

//Pre-compile landmark groupings
const COMPILED_LANDMARKS = {
    TORSO: Object.keys(LANDMARK_GROUPINGS.TORSO_LANDMARKS),
    BICEP: Object.keys(LANDMARK_GROUPINGS.BICEP_LANDMARKS),
    FOREARM: Object.keys(LANDMARK_GROUPINGS.FOREARM_LANDMARKS),
    THIGH: Object.keys(LANDMARK_GROUPINGS.THIGH_LANDMARKS),
    SHIN: Object.keys(LANDMARK_GROUPINGS.SHIN_LANDMARKS),
    ABDOMEN: Object.keys(LANDMARK_GROUPINGS.ABDOMEN_LANDMARKS),
    PALM: Object.keys(LANDMARK_GROUPINGS.PALM_LANDMARKS)
};

const magnitude = (x1, y1, x2, y2) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
};

const connectLandmarks = (
    landmarks,
    g,
    width,
    height,
    similarityScoreSegment,
    similarityScores
  ) => {
    if (landmarks.some(l => l.x > width || l.y > height)) return;

    const score = similarityScores.find((score) => score.segment === similarityScoreSegment);
    if (score) {
        similarity =score.similarityScore;
      }

    const fillColor = similarity!== undefined 
        ? parseInt(COLOR_SCALES.fill(similarity).hex().substring(1), 16) : yellow;
    const strokeColor = similarity !== undefined
        ? parseInt(COLOR_SCALES.stroke(similarity).hex().substring(1), 16) : blue;

    g.beginFill(fillColor);
    g.lineStyle(4, strokeColor, 1);
    const [first, ...rest] = landmarks;
    g.moveTo(first.x, first.y);
    rest.forEach(coord => g.lineTo(coord.x, coord.y));
    g.lineTo(first.x, first.y);
    g.endFill();
}
  


