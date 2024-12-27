import { useCallback, useState, forwardRef } from "react";
import { Graphics, Container } from "@pixi/react"; // Updated import for latest pixi.js
import { Graphics as PIXIGraphics } from "pixi.js"; // Updated import for pixi.js directly
import {
  FACEMESH_FACE_OVAL,
  POSE_LANDMARKS,
} from "@mediapipe/holistic/holistic";
import { blue, yellow, pink } from "../util/colors.jsx";
import { LANDMARK_GROUPINGS } from "./LandmarkUtils.jsx";
import { landmarkToCoordinates, objMap } from "../util/PoseDrawingUtils.jsx";
import { scale } from "chroma-js";

const COLOR_SCALES = {
  fill: scale([yellow.toString(16), pink.toString(16)]).domain([0, 100]),
  stroke: scale([blue.toString(16), pink.toString(16)]).domain([0, 100])
};

// ****************************************************************
// Utility functions
// ****************************************************************
const magnitude = (point1, point2) => {
  return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
};

const FILL_COLOR = yellow;
const STROKE_COLOR = blue;

const connectLandmarks = (
  landmarks,
  g,
  width,
  height,
  similarityScoreSegment,
  similarityScores
) => {
  if (landmarks.some(l => l.x > width || l.y > height)) return;

  let similarity = undefined;
  if (similarityScores && similarityScores.length > 1 && similarityScoreSegment) {
    const score = similarityScores.find((score) => score.segment === similarityScoreSegment);
    if (score) {
      similarity = score.similarityScore;
    }
  }

  const fillColor = similarity !== undefined
    ? parseInt(COLOR_SCALES.fill(similarity).hex().substring(1), 16)
    : yellow;
  const strokeColor = similarity !== undefined
    ? parseInt(COLOR_SCALES.stroke(similarity).hex().substring(1), 16)
    : blue;

  g.beginFill(fillColor);
  g.lineStyle(4, strokeColor, 1);
  const [first, ...rest] = landmarks;
  g.moveTo(first.x, first.y);
  rest.forEach(coord => g.lineTo(coord.x, coord.y));
  g.lineTo(first.x, first.y);
  g.endFill();
}

//--------------------------------ORIGINAL CODE-----------------------------------
const connectFinger = (landmarks, g) => {
  g.beginFill(FILL_COLOR);
  g.lineStyle(4, STROKE_COLOR, 1);
  const coord = landmarks.shift();
  g.moveTo(coord.x, coord.y);
  landmarks.forEach((coordinate) => {
    g.lineTo(coordinate.x, coordinate.y);
  });
  g.endFill();
};

const calculateArmWidth = (poseData, width, height) => {
  const landmarks = (({ RIGHT_SHOULDER, SOLAR_PLEXIS }) => ({
    RIGHT_SHOULDER,
    SOLAR_PLEXIS,
  }))(POSE_LANDMARKS);
  const coords = objMap(
    landmarks,
    landmarkToCoordinates(poseData.poseLandmarks, width, height)
  );
  return magnitude(coords.RIGHT_SHOULDER, coords.SOLAR_PLEXIS) * 0.04;
};

const drawBiceps = (poseData, g, armWidth, width, height, similarityScores) => {
  const generalCoords = objMap(
    LANDMARK_GROUPINGS.BICEP_LANDMARKS,
    landmarkToCoordinates(poseData.poseLandmarks, width, height)
  );
  const rightBicepCoords = [
    {
      x: generalCoords.RIGHT_SHOULDER.x + armWidth,
      y: generalCoords.RIGHT_SHOULDER.y + armWidth,
    },
    {
      x: generalCoords.RIGHT_SHOULDER.x - armWidth,
      y: generalCoords.RIGHT_SHOULDER.y - armWidth,
    },
    generalCoords.RIGHT_ELBOW,
  ];
  const leftBicepCoords = [
    {
      x: generalCoords.LEFT_SHOULDER.x + armWidth,
      y: generalCoords.LEFT_SHOULDER.y + armWidth,
    },
    {
      x: generalCoords.LEFT_SHOULDER.x - armWidth,
      y: generalCoords.LEFT_SHOULDER.y - armWidth,
    },
    generalCoords.LEFT_ELBOW,
  ];
  connectLandmarks(
    rightBicepCoords,
    g,
    width,
    height,
    "RIGHT_BICEP",
    similarityScores
  );
  connectLandmarks(
    leftBicepCoords,
    g,
    width,
    height,
    "LEFT_BICEP",
    similarityScores
  );
};

const drawForearms = (
  poseData,
  g,
  armWidth,
  width,
  height,
  similarityScores
) => {
  const generalCoords = objMap(
    LANDMARK_GROUPINGS.FOREARM_LANDMARKS,
    landmarkToCoordinates(poseData.poseLandmarks, width, height)
  );
  let rightWrist;
  let leftWrist;
  if (poseData.rightHandLandmarks) {
    rightWrist = objMap(
      LANDMARK_GROUPINGS.WRIST_LANDMARK,
      landmarkToCoordinates(poseData.rightHandLandmarks, width, height)
    ).WRIST;
  } else {
    rightWrist = generalCoords.RIGHT_WRIST;
  }
  if (poseData.leftHandLandmarks) {
    leftWrist = objMap(
      LANDMARK_GROUPINGS.WRIST_LANDMARK,
      landmarkToCoordinates(poseData.leftHandLandmarks, width, height)
    ).WRIST;
  } else {
    leftWrist = generalCoords.LEFT_WRIST;
  }
  const rightForearmCoords = [
    {
      x: generalCoords.RIGHT_ELBOW.x + armWidth,
      y: generalCoords.RIGHT_ELBOW.y + armWidth,
    },
    {
      x: generalCoords.RIGHT_ELBOW.x - armWidth,
      y: generalCoords.RIGHT_ELBOW.y - armWidth,
    },
    rightWrist,
  ];
  const leftForearmCoords = [
    {
      x: generalCoords.LEFT_ELBOW.x + armWidth,
      y: generalCoords.LEFT_ELBOW.y + armWidth,
    },
    {
      x: generalCoords.LEFT_ELBOW.x - armWidth,
      y: generalCoords.LEFT_ELBOW.y - armWidth,
    },
    leftWrist,
  ];
  connectLandmarks(
    rightForearmCoords,
    g,
    width,
    height,
    "RIGHT_FOREARM",
    similarityScores
  );
  connectLandmarks(
    leftForearmCoords,
    g,
    width,
    height,
    "LEFT_FOREARM",
    similarityScores
  );
};

const drawFace = (poseData, g, width, height, similarityScores) => {
  let faceOvalCoords = FACEMESH_FACE_OVAL.map((indexPair) => {
    const coordinates = poseData.faceLandmarks[indexPair[0]];
    coordinates.x *= width;
    coordinates.y *= height;
    return coordinates;
  });
  connectLandmarks(faceOvalCoords, g, width, height, similarityScores);

  let fillColor = yellow;
  let strokeColor = blue;
  g.beginFill(fillColor);
  g.lineStyle(4, strokeColor, 1);

  poseData.faceLandmarks.forEach((landmark) => {
    let x = landmark.x;
    let y = landmark.y;
    x *= width;
    y *= height;
    if (x <= width || y <= height) {
      g.drawCircle(x, y, 0.01);
    }
  });

  g.endFill();
};

// create a drawThighs function that mimics the drawBiceps function
// but uses the LEFT_HIP and RIGHT_HIP landmarks instead of the
// RIGHT_SHOULDER and LEFT_SHOULDER landmarks
// and the LEFT_KNEE and RIGHT_KNEE landmarks instead of the
// LEFT_ELBOW and RIGHT_ELBOW landmarks
const drawThighs = (poseData, g, armWidth, width, height, similarityScores) => {
  const generalCoords = objMap(
    LANDMARK_GROUPINGS.THIGH_LANDMARKS,
    landmarkToCoordinates(poseData.poseLandmarks, width, height)
  );
  // Add magnitude to y coordinate to get a shorter distance b/c 0,0 is top left
  if (generalCoords.RIGHT_KNEE.visibility > 0.6) {
    const rightHipY =
      generalCoords.RIGHT_HIP.y +
      magnitude(generalCoords.PELVIS, generalCoords.RIGHT_HIP);
    const rightKneeY =
      generalCoords.RIGHT_KNEE.y -
      magnitude(generalCoords.PELVIS, generalCoords.RIGHT_HIP);
    const rightThighCoords = [
      {
        x: generalCoords.RIGHT_KNEE.x + armWidth,
        y: rightKneeY + armWidth,
      },
      {
        x: generalCoords.RIGHT_HIP.x + armWidth,
        y: rightHipY + armWidth,
      },
      {
        x: generalCoords.RIGHT_HIP.x - armWidth,
        y: rightHipY - armWidth,
      },
      {
        x: generalCoords.RIGHT_KNEE.x - armWidth,
        y: rightKneeY - armWidth,
      },
    ];
    connectLandmarks(rightThighCoords, g, width, height, similarityScores);
  }
  if (generalCoords.LEFT_KNEE.visibility > 0.6) {
    const leftHipY =
      generalCoords.LEFT_HIP.y +
      magnitude(generalCoords.PELVIS, generalCoords.LEFT_HIP);
    const leftKneeY =
      generalCoords.LEFT_KNEE.y -
      magnitude(generalCoords.PELVIS, generalCoords.LEFT_HIP);
    const leftThighCoords = [
      {
        x: generalCoords.LEFT_KNEE.x + armWidth,
        y: leftKneeY + armWidth,
      },
      {
        x: generalCoords.LEFT_HIP.x + armWidth,
        y: leftHipY + armWidth,
      },
      {
        x: generalCoords.LEFT_HIP.x - armWidth,
        y: leftHipY - armWidth,
      },
      {
        x: generalCoords.LEFT_KNEE.x - armWidth,
        y: leftKneeY - armWidth,
      },
    ];
    connectLandmarks(leftThighCoords, g, width, height, similarityScores);
  }
};

//-----------------------------------------------END OF ORIGINAL CODE-------------------------------------------------

// Adding forwardRef to make it work with React components
const PoseDrawer = forwardRef(({ poseData, width, height, similarityScores }, ref) => {
  const armWidth = calculateArmWidth(poseData, width, height);
  return (
    <Container>
      <Graphics
        draw={(g) => {
          drawBiceps(poseData, g, armWidth, width, height, similarityScores);
          drawForearms(poseData, g, armWidth, width, height, similarityScores);
          drawFace(poseData, g, width, height, similarityScores);
          drawThighs(poseData, g, armWidth, width, height, similarityScores);
        }}
      />
    </Container>
  );
});

export default PoseDrawer;
