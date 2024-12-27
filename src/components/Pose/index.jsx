import { useCallback, forwardRef } from "react";
import { Stage, Container, Graphics } from "@pixi/react";
import { FACEMESH_FACE_OVAL } from "@mediapipe/holistic/holistic";
import { scale } from "chroma-js";
import { LANDMARK_GROUPINGS } from "./LandmarkUtils";
import { 
  landmarkToCoordinates, 
  objMap 
} from "./PoseDrawingUtils";

const COLORS = {
  yellow: 0xFFEB3B,
  blue: 0x2196F3,
  pink: 0xFF4081
};

const COLOR_SCALES = {
  fill: scale(['FFEB3B', 'FF4081']).domain([0, 100]),
  stroke: scale(['2196F3', 'FF4081']).domain([0, 100])
};

const magnitude = (point1, point2) => {
  if (!point1 || !point2) return 0;
  return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
};

const connectLandmarks = (g, landmarks, width, height, segmentType, similarityScores) => {
  if (!landmarks?.length || landmarks.some(l => !l)) {
    console.log(`Skipping ${segmentType} - Invalid landmarks:`, landmarks);
    return;
  }

  if (landmarks.some(l => l.x > width || l.y > height)) {
    console.log(`Skipping ${segmentType} - Landmarks out of bounds:`, landmarks);
    return;
  }

  let similarity;
  if (similarityScores?.length && segmentType) {
    const score = similarityScores.find(s => s.segment === segmentType);
    similarity = score?.similarityScore;
  }

  const fillColor = similarity !== undefined
    ? parseInt(COLOR_SCALES.fill(similarity).hex(), 16)
    : COLORS.yellow;
  const strokeColor = similarity !== undefined
    ? parseInt(COLOR_SCALES.stroke(similarity).hex(), 16)
    : COLORS.blue;

  g.beginFill(fillColor, 0.6);
  g.lineStyle(4, strokeColor, 1);
  const [first, ...rest] = landmarks;
  g.moveTo(first.x, first.y);
  rest.forEach(coord => {
    if (coord) g.lineTo(coord.x, coord.y);
  });
  g.lineTo(first.x, first.y);
  g.endFill();
};

const connectFinger = (g, landmarks, width, height) => {
  if (!landmarks?.length) return;
  
  g.beginFill(COLORS.yellow);
  g.lineStyle(4, COLORS.blue, 1);
  const [first, ...rest] = landmarks.map(landmark => ({
    x: landmark.x * width,
    y: landmark.y * height
  }));
  g.moveTo(first.x, first.y);
  rest.forEach(coord => g.lineTo(coord.x, coord.y));
  g.endFill();
};

const calculateArmWidth = (poseData, width, height) => {
  if (!poseData?.poseLandmarks) return 0;
  const rightShoulder = poseData.poseLandmarks[11];
  const solarPlexis = poseData.poseLandmarks[23];
  
  if (!rightShoulder || !solarPlexis) return 20;
  
  const coords = {
    RIGHT_SHOULDER: {
      x: rightShoulder.x * width,
      y: rightShoulder.y * height
    },
    SOLAR_PLEXIS: {
      x: solarPlexis.x * width,
      y: solarPlexis.y * height
    }
  };
  
  return magnitude(coords.RIGHT_SHOULDER, coords.SOLAR_PLEXIS) * 0.04;
};

const drawTorso = (poseData, g, width, height, similarityScores) => {
  if (!poseData.poseLandmarks) return;

  const torsoLandmarks = [11, 12, 23, 24].map(index => ({
    x: poseData.poseLandmarks[index].x * width,
    y: poseData.poseLandmarks[index].y * height
  }));

  connectLandmarks(g, torsoLandmarks, width, height, "TORSO", similarityScores);
};

const drawAbdomen = (poseData, g, width, height) => {
  if (!poseData.poseLandmarks) return;

  const pelvis = poseData.poseLandmarks[23];
  const leftHip = poseData.poseLandmarks[24];
  
  if (!pelvis || !leftHip) return;

  const pelvisPoint = { x: pelvis.x * width, y: pelvis.y * height };
  const leftHipPoint = { x: leftHip.x * width, y: leftHip.y * height };
  
  const radius = magnitude(pelvisPoint, leftHipPoint);
  
  g.beginFill(COLORS.yellow);
  g.drawCircle(pelvisPoint.x, pelvisPoint.y, radius);
  g.endFill();
};

const drawHands = (poseData, g, width, height, similarityScores) => {
  const fingerGroups = [
    LANDMARK_GROUPINGS.THUMB_LANDMARKS,
    LANDMARK_GROUPINGS.INDEX_FINGER_LANDMARKS,
    LANDMARK_GROUPINGS.MIDDLE_FINGER_LANDMARKS,
    LANDMARK_GROUPINGS.RING_FINGER_LANDMARKS,
    LANDMARK_GROUPINGS.PINKY_LANDMARKS
  ];

  if (poseData.rightHandLandmarks) {
    // Draw right palm
    const rightPalmLandmarks = Object.values(LANDMARK_GROUPINGS.PALM_LANDMARKS)
      .map(index => poseData.rightHandLandmarks[index]);
    const rightPalmCoords = rightPalmLandmarks.map(landmark => ({
      x: landmark.x * width,
      y: landmark.y * height
    }));
    connectLandmarks(g, rightPalmCoords, width, height, "RIGHT_PALM", similarityScores);

    // Draw right fingers
    fingerGroups.forEach(fingerLandmarks => {
      const fingerPoints = Object.values(fingerLandmarks)
        .map(index => poseData.rightHandLandmarks[index]);
      connectFinger(g, fingerPoints, width, height);
    });
  }

  if (poseData.leftHandLandmarks) {
    // Draw left palm
    const leftPalmLandmarks = Object.values(LANDMARK_GROUPINGS.PALM_LANDMARKS)
      .map(index => poseData.leftHandLandmarks[index]);
    const leftPalmCoords = leftPalmLandmarks.map(landmark => ({
      x: landmark.x * width,
      y: landmark.y * height
    }));
    connectLandmarks(g, leftPalmCoords, width, height, "LEFT_PALM", similarityScores);

    // Draw left fingers
    fingerGroups.forEach(fingerLandmarks => {
      const fingerPoints = Object.values(fingerLandmarks)
        .map(index => poseData.leftHandLandmarks[index]);
      connectFinger(g, fingerPoints, width, height);
    });
  }
};

const drawShins = (poseData, g, armWidth, width, height, similarityScores) => {
  if (!poseData.poseLandmarks) return;

  const landmarks = {
    RIGHT_KNEE: poseData.poseLandmarks[25],
    RIGHT_ANKLE: poseData.poseLandmarks[27],
    LEFT_KNEE: poseData.poseLandmarks[26],
    LEFT_ANKLE: poseData.poseLandmarks[28]
  };

  if (landmarks.RIGHT_KNEE?.visibility > 0.6) {
    const rightShinCoords = [
      {
        x: landmarks.RIGHT_KNEE.x * width + armWidth,
        y: landmarks.RIGHT_KNEE.y * height + armWidth,
      },
      {
        x: landmarks.RIGHT_KNEE.x * width - armWidth,
        y: landmarks.RIGHT_KNEE.y * height - armWidth,
      },
      {
        x: landmarks.RIGHT_ANKLE.x * width,
        y: landmarks.RIGHT_ANKLE.y * height,
      }
    ];
    connectLandmarks(g, rightShinCoords, width, height, "RIGHT_SHIN", similarityScores);
  }

  if (landmarks.LEFT_KNEE?.visibility > 0.6) {
    const leftShinCoords = [
      {
        x: landmarks.LEFT_KNEE.x * width + armWidth,
        y: landmarks.LEFT_KNEE.y * height + armWidth,
      },
      {
        x: landmarks.LEFT_KNEE.x * width - armWidth,
        y: landmarks.LEFT_KNEE.y * height - armWidth,
      },
      {
        x: landmarks.LEFT_ANKLE.x * width,
        y: landmarks.LEFT_ANKLE.y * height,
      }
    ];
    connectLandmarks(g, leftShinCoords, width, height, "LEFT_SHIN", similarityScores);
  }
};

const drawBiceps = (poseData, g, armWidth, width, height, similarityScores) => {
  if (!poseData.poseLandmarks) {
    console.log('No pose landmarks available for biceps');
    return;
  }

  // Map landmarks to screen coordinates
  const landmarks = {
    RIGHT_SHOULDER: poseData.poseLandmarks[11],
    RIGHT_ELBOW: poseData.poseLandmarks[13],
    LEFT_SHOULDER: poseData.poseLandmarks[12],
    LEFT_ELBOW: poseData.poseLandmarks[14]
  };

  // Debug log
  console.log('Bicep landmarks:', landmarks);

  if (!landmarks.RIGHT_SHOULDER || !landmarks.RIGHT_ELBOW) {
    console.log('Missing right arm landmarks');
    return;
  }

  const rightBicepCoords = [
    {
      x: landmarks.RIGHT_SHOULDER.x * width + armWidth,
      y: landmarks.RIGHT_SHOULDER.y * height + armWidth,
    },
    {
      x: landmarks.RIGHT_SHOULDER.x * width - armWidth,
      y: landmarks.RIGHT_SHOULDER.y * height - armWidth,
    },
    {
      x: landmarks.RIGHT_ELBOW.x * width,
      y: landmarks.RIGHT_ELBOW.y * height,
    }
  ];

  if (landmarks.LEFT_SHOULDER && landmarks.LEFT_ELBOW) {
    const leftBicepCoords = [
      {
        x: landmarks.LEFT_SHOULDER.x * width + armWidth,
        y: landmarks.LEFT_SHOULDER.y * height + armWidth,
      },
      {
        x: landmarks.LEFT_SHOULDER.x * width - armWidth,
        y: landmarks.LEFT_SHOULDER.y * height - armWidth,
      },
      {
        x: landmarks.LEFT_ELBOW.x * width,
        y: landmarks.LEFT_ELBOW.y * height,
      }
    ];

    connectLandmarks(g, leftBicepCoords, width, height, "LEFT_BICEP", similarityScores);
  }

  connectLandmarks(g, rightBicepCoords, width, height, "RIGHT_BICEP", similarityScores);
};

const drawForearms = (poseData, g, armWidth, width, height, similarityScores) => {
  if (!poseData.poseLandmarks) {
    console.log('No pose landmarks available for forearms');
    return;
  }

  // Map landmarks to screen coordinates
  const landmarks = {
    RIGHT_ELBOW: poseData.poseLandmarks[13],
    RIGHT_WRIST: poseData.poseLandmarks[15],
    LEFT_ELBOW: poseData.poseLandmarks[14],
    LEFT_WRIST: poseData.poseLandmarks[16]
  };

  // Debug log
  console.log('Forearm landmarks:', landmarks);

  if (landmarks.RIGHT_ELBOW && landmarks.RIGHT_WRIST) {
    const rightForearmCoords = [
      {
        x: landmarks.RIGHT_ELBOW.x * width + armWidth,
        y: landmarks.RIGHT_ELBOW.y * height + armWidth,
      },
      {
        x: landmarks.RIGHT_ELBOW.x * width - armWidth,
        y: landmarks.RIGHT_ELBOW.y * height - armWidth,
      },
      {
        x: landmarks.RIGHT_WRIST.x * width,
        y: landmarks.RIGHT_WRIST.y * height,
      }
    ];
    connectLandmarks(g, rightForearmCoords, width, height, "RIGHT_FOREARM", similarityScores);
  }

  if (landmarks.LEFT_ELBOW && landmarks.LEFT_WRIST) {
    const leftForearmCoords = [
      {
        x: landmarks.LEFT_ELBOW.x * width + armWidth,
        y: landmarks.LEFT_ELBOW.y * height + armWidth,
      },
      {
        x: landmarks.LEFT_ELBOW.x * width - armWidth,
        y: landmarks.LEFT_ELBOW.y * height - armWidth,
      },
      {
        x: landmarks.LEFT_WRIST.x * width,
        y: landmarks.LEFT_WRIST.y * height,
      }
    ];
    connectLandmarks(g, leftForearmCoords, width, height, "LEFT_FOREARM", similarityScores);
  }
};

const drawFace = (poseData, g, width, height, similarityScores) => {
  if (!poseData.faceLandmarks) return;
  
  let faceOvalCoords = FACEMESH_FACE_OVAL.map((indexPair) => {
    const coordinates = poseData.faceLandmarks[indexPair[0]];
    return {
      x: coordinates.x * width,
      y: coordinates.y * height
    };
  });
  connectLandmarks(g, faceOvalCoords, width, height, "FACE", similarityScores);

  g.beginFill(COLORS.yellow);
  g.lineStyle(4, COLORS.blue, 1);

  poseData.faceLandmarks.forEach((landmark) => {
    const x = landmark.x * width;
    const y = landmark.y * height;
    if (x <= width && y <= height) {
      g.drawCircle(x, y, 0.01);
    }
  });

  g.endFill();
};

const drawThighs = (poseData, g, armWidth, width, height, similarityScores) => {
  if (!poseData.poseLandmarks) {
    console.log('No pose landmarks available for thighs');
    return;
  }

  // Map landmarks to screen coordinates
  const landmarks = {
    RIGHT_HIP: poseData.poseLandmarks[23],
    RIGHT_KNEE: poseData.poseLandmarks[25],
    LEFT_HIP: poseData.poseLandmarks[24],
    LEFT_KNEE: poseData.poseLandmarks[26],
    PELVIS: poseData.poseLandmarks[23] // Using right hip as pelvis reference
  };

  // Debug log
  console.log('Thigh landmarks:', landmarks);

  if (landmarks.RIGHT_KNEE?.visibility > 0.6) {
    const rightHipY = landmarks.RIGHT_HIP.y * height +
      magnitude(
        { x: landmarks.PELVIS.x * width, y: landmarks.PELVIS.y * height },
        { x: landmarks.RIGHT_HIP.x * width, y: landmarks.RIGHT_HIP.y * height }
      );
    
    const rightKneeY = landmarks.RIGHT_KNEE.y * height -
      magnitude(
        { x: landmarks.PELVIS.x * width, y: landmarks.PELVIS.y * height },
        { x: landmarks.RIGHT_HIP.x * width, y: landmarks.RIGHT_HIP.y * height }
      );

    const rightThighCoords = [
      {
        x: landmarks.RIGHT_KNEE.x * width + armWidth,
        y: rightKneeY + armWidth,
      },
      {
        x: landmarks.RIGHT_HIP.x * width + armWidth,
        y: rightHipY + armWidth,
      },
      {
        x: landmarks.RIGHT_HIP.x * width - armWidth,
        y: rightHipY - armWidth,
      },
      {
        x: landmarks.RIGHT_KNEE.x * width - armWidth,
        y: rightKneeY - armWidth,
      }
    ];
    connectLandmarks(g, rightThighCoords, width, height, "RIGHT_THIGH", similarityScores);
  }

  // Similar code for left thigh...
};

const PoseDrawer = forwardRef(({ 
  poseData, 
  width = 640, 
  height = 480, 
  similarityScores = [] 
}, ref) => {
  const draw = useCallback((g) => {
    if (!poseData) {
      console.log('No pose data available');
      return;
    }
    
    g.clear();
    
    const armWidth = calculateArmWidth(poseData, width, height);
    
    if (poseData.poseLandmarks) {
      // Draw in specific order for proper layering
      drawTorso(poseData, g, width, height, similarityScores);
      drawAbdomen(poseData, g, width, height);
      drawBiceps(poseData, g, armWidth, width, height, similarityScores);
      drawForearms(poseData, g, armWidth, width, height, similarityScores);
      drawThighs(poseData, g, armWidth, width, height, similarityScores);
      drawShins(poseData, g, armWidth, width, height, similarityScores);
    }
    
    if (poseData.faceLandmarks) {
      drawFace(poseData, g, width, height, similarityScores);
    }

    drawHands(poseData, g, width, height, similarityScores);
  }, [poseData, width, height, similarityScores]);

  return (
    <Stage
      width={width}
      height={height}
      options={{
        backgroundColor: 0x333333,
        resolution: window.devicePixelRatio || 1,
        antialias: true,
        autoDensity: true
      }}
    >
      <Container ref={ref}>
        <Graphics draw={draw} />
      </Container>
    </Stage>
  );
});

PoseDrawer.displayName = 'PoseDrawer';

export default PoseDrawer;