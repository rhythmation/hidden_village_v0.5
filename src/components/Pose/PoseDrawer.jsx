import { useCallback, forwardRef, useMemo } from "react";
import { Stage, Container, Graphics } from "@pixi/react";
import { FACEMESH_FACE_OVAL, POSE_LANDMARKS } from "@mediapipe/holistic/holistic";
import { scale } from "chroma-js";
import { blue, yellow, pink } from "../util/colors";
import { LANDMARK_GROUPINGS } from "./LandmarkUtils";
import { landmarkToCoordinates, objMap } from "./PoseDrawingUtils";

// Color configuration and scales for similarity scoring
const COLORS = {
  fill: yellow,
  stroke: blue,
  scales: {
    fill: scale([yellow.toString(16), pink.toString(16)]).domain([0, 100]),
    stroke: scale([blue.toString(16), pink.toString(16)]).domain([0, 100])
  }
};

// Drawing configuration constants
const LINE_STYLE = { width: 4, alpha: 1 };
const DEFAULT_ARM_WIDTH = 15;
const CIRCLE_RADIUS = 0.01;

// Utility function to calculate distance between two points
const magnitude = (point1, point2) => (
  Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2)
);

// Get colors based on similarity scores for a given segment
const getSegmentColors = (similarityScores, segmentName) => {
  if (!similarityScores?.length || !segmentName) {
    return { fill: COLORS.fill, stroke: COLORS.stroke };
  }

  const score = similarityScores.find(s => s.segment === segmentName);
  if (!score) return { fill: COLORS.fill, stroke: COLORS.stroke };

  return {
    fill: parseInt(COLORS.scales.fill(score.similarityScore).hex().substring(1), 16),
    stroke: parseInt(COLORS.scales.stroke(score.similarityScore).hex().substring(1), 16)
  };
};

// Draw a connected path with the given landmarks
const drawPath = (g, landmarks, width, height, segmentName = '', similarityScores = [], shouldClose = true) => {
  if (!landmarks?.length || landmarks.some(l => l.x > width || l.y > height)) return;

  const { fill, stroke } = getSegmentColors(similarityScores, segmentName);
  const [first, ...rest] = landmarks;

  g.beginFill(fill);
  g.lineStyle(LINE_STYLE.width, stroke, LINE_STYLE.alpha);
  g.moveTo(first.x, first.y);
  
  rest.forEach(coord => g.lineTo(coord.x, coord.y));
  if (shouldClose) g.lineTo(first.x, first.y);
  
  g.endFill();
};

// Calculate arm width based on shoulder to solar plexus distance
const calculateArmWidth = (poseData, width, height) => {
  if (!poseData?.poseLandmarks) return DEFAULT_ARM_WIDTH;

  const { RIGHT_SHOULDER, SOLAR_PLEXIS } = POSE_LANDMARKS;
  const coords = objMap(
    { RIGHT_SHOULDER, SOLAR_PLEXIS },
    landmarkToCoordinates(poseData.poseLandmarks, width, height)
  );

  return coords.RIGHT_SHOULDER && coords.SOLAR_PLEXIS
    ? magnitude(coords.RIGHT_SHOULDER, coords.SOLAR_PLEXIS) * 0.04
    : DEFAULT_ARM_WIDTH;
};

// Drawing functions for different body parts
const drawingFunctions = {
  torso: (poseData, g, { width, height, similarityScores }) => {
    const torsoCoords = objMap(
      LANDMARK_GROUPINGS.TORSO_LANDMARKS,
      landmarkToCoordinates(poseData.poseLandmarks, width, height)
    );
    drawPath(g, Object.values(torsoCoords), width, height, 'TORSO', similarityScores);
  },

  abdomen: (poseData, g, { width, height }) => {
    const abdomenCoords = objMap(
      LANDMARK_GROUPINGS.ABDOMEN_LANDMARKS,
      landmarkToCoordinates(poseData.poseLandmarks, width, height)
    );
    const radius = magnitude(abdomenCoords.PELVIS, abdomenCoords.LEFT_HIP);
    
    g.beginFill(COLORS.fill);
    g.drawCircle(abdomenCoords.PELVIS.x, abdomenCoords.PELVIS.y, radius);
    g.endFill();
  },

  biceps: (poseData, g, { armWidth, width, height, similarityScores }) => {
    const coords = objMap(
      LANDMARK_GROUPINGS.BICEP_LANDMARKS,
      landmarkToCoordinates(poseData.poseLandmarks, width, height)
    );

    ['RIGHT', 'LEFT'].forEach(side => {
      const shoulder = coords[`${side}_SHOULDER`];
      const elbow = coords[`${side}_ELBOW`];
      const bicepCoords = [
        { x: shoulder.x + armWidth, y: shoulder.y + armWidth },
        { x: shoulder.x - armWidth, y: shoulder.y - armWidth },
        elbow
      ];
      drawPath(g, bicepCoords, width, height, `${side}_BICEP`, similarityScores);
    });
  },

  forearms: (poseData, g, { armWidth, width, height, similarityScores }) => {
    const coords = objMap(
      LANDMARK_GROUPINGS.FOREARM_LANDMARKS,
      landmarkToCoordinates(poseData.poseLandmarks, width, height)
    );

    ['RIGHT', 'LEFT'].forEach(side => {
      const handData = poseData[`${side.toLowerCase()}HandLandmarks`];
      const wrist = handData
        ? objMap(
            LANDMARK_GROUPINGS.WRIST_LANDMARK,
            landmarkToCoordinates(handData, width, height)
          ).WRIST
        : coords[`${side}_WRIST`];

      const elbow = coords[`${side}_ELBOW`];
      const forearmCoords = [
        { x: elbow.x + armWidth, y: elbow.y + armWidth },
        { x: elbow.x - armWidth, y: elbow.y - armWidth },
        wrist
      ];
      drawPath(g, forearmCoords, width, height, `${side}_FOREARM`, similarityScores);
    });
  },

  thighs: (poseData, g, { armWidth, width, height, similarityScores }) => {
    const coords = objMap(
      LANDMARK_GROUPINGS.THIGH_LANDMARKS,
      landmarkToCoordinates(poseData.poseLandmarks, width, height)
    );

    ['RIGHT', 'LEFT'].forEach(side => {
      if (coords[`${side}_KNEE`].visibility <= 0.6) return;

      const hip = coords[`${side}_HIP`];
      const knee = coords[`${side}_KNEE`];
      const pelvis = coords.PELVIS;
      const magnitude1 = magnitude(pelvis, hip);
      
      const thighCoords = [
        { x: knee.x + armWidth, y: knee.y - magnitude1 + armWidth },
        { x: hip.x + armWidth, y: hip.y + magnitude1 + armWidth },
        { x: hip.x - armWidth, y: hip.y + magnitude1 - armWidth },
        { x: knee.x - armWidth, y: knee.y - magnitude1 - armWidth }
      ];
      drawPath(g, thighCoords, width, height, `${side}_THIGH`, similarityScores);
    });
  },

  shins: (poseData, g, { armWidth, width, height, similarityScores }) => {
    const coords = objMap(
      LANDMARK_GROUPINGS.SHIN_LANDMARKS,
      landmarkToCoordinates(poseData.poseLandmarks, width, height)
    );

    ['RIGHT', 'LEFT'].forEach(side => {
      if (coords[`${side}_KNEE`].visibility <= 0.6) return;

      const knee = coords[`${side}_KNEE`];
      const ankle = coords[`${side}_ANKLE`];
      const shinCoords = [
        { x: knee.x + armWidth, y: knee.y + armWidth },
        { x: knee.x - armWidth, y: knee.y - armWidth },
        ankle
      ];
      drawPath(g, shinCoords, width, height, `${side}_SHIN`, similarityScores);
    });
  },

  face: (poseData, g, { width, height, similarityScores }) => {
    // Draw face oval
    const faceOvalCoords = FACEMESH_FACE_OVAL.map(([index]) => {
      const coords = poseData.faceLandmarks[index];
      return { x: coords.x * width, y: coords.y * height };
    });
    drawPath(g, faceOvalCoords, width, height, 'FACE', similarityScores);

    // Draw individual landmarks
    g.beginFill(COLORS.fill);
    g.lineStyle(LINE_STYLE.width, COLORS.stroke, LINE_STYLE.alpha);

    poseData.faceLandmarks.forEach(landmark => {
      const x = landmark.x * width;
      const y = landmark.y * height;
      if (x <= width && y <= height) {
        g.drawCircle(x, y, CIRCLE_RADIUS);
      }
    });

    g.endFill();
  },

  hands: (poseData, g, { width, height, similarityScores }) => {
    ['right', 'left'].forEach(side => {
      const handData = poseData[`${side}HandLandmarks`];
      if (!handData) return;

      // Draw palm
      const palmCoords = objMap(
        LANDMARK_GROUPINGS.PALM_LANDMARKS,
        landmarkToCoordinates(handData, width, height)
      );
      drawPath(g, Object.values(palmCoords), width, height, `${side.toUpperCase()}_PALM`, similarityScores);

      // Draw fingers
      const fingerGroups = [
        LANDMARK_GROUPINGS.THUMB_LANDMARKS,
        LANDMARK_GROUPINGS.INDEX_FINGER_LANDMARKS,
        LANDMARK_GROUPINGS.MIDDLE_FINGER_LANDMARKS,
        LANDMARK_GROUPINGS.RING_FINGER_LANDMARKS,
        LANDMARK_GROUPINGS.PINKY_LANDMARKS
      ];

      fingerGroups.forEach(group => {
        const fingerCoords = objMap(
          group,
          landmarkToCoordinates(handData, width, height)
        );
        drawPath(g, Object.values(fingerCoords), width, height, '', similarityScores, false);
      });
    });
  }
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
    
    const params = {
      armWidth: calculateArmWidth(poseData, width, height),
      width,
      height,
      similarityScores
    };
    
    // Draw body parts in specific order for proper layering
    if (poseData.poseLandmarks) {
      [
        'torso',
        'abdomen',
        'biceps',
        'forearms',
        'thighs',
        'shins'
      ].forEach(part => drawingFunctions[part](poseData, g, params));
    }
    
    if (poseData.faceLandmarks) {
      drawingFunctions.face(poseData, g, params);
    }

    drawingFunctions.hands(poseData, g, params);
  }, [poseData, width, height, similarityScores]);

  {/* Pixi.js options */}
  const stageOptions = useMemo(() => ({
    backgroundColor: 0xffffff,
    backgroundAlpha: 0,
    resolution: window.devicePixelRatio || 1,
    antialias: true,
    autoDensity: true
  }), []);

  return (
    <Stage width={width} height={height} options={stageOptions}>
      <Container ref={ref}>
        <Graphics draw={draw} />
      </Container>
    </Stage>
  );
});

PoseDrawer.displayName = 'PoseDrawer';

export default PoseDrawer;