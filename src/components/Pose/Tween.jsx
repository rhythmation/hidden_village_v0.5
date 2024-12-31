import { useState, useEffect, useCallback } from 'react';
import PoseDrawer from './PoseDrawer';

const interpolateLandmark = (start, end, progress) => {
  if (!start || !end) return null;
  
  return {
    x: start.x + (end.x - start.x) * progress,
    y: start.y + (end.y - start.y) * progress,
    z: start.z + (end.z - start.z) * progress,
    visibility: start.visibility
  };
};

const interpolatePoseData = (startPose, endPose, progress) => {
  if (!startPose || !endPose) {
    console.log('Missing pose data:', { startPose, endPose });
    return null;
  }

  const result = {
    image: startPose.image,
    poseLandmarks: [],
    rightHandLandmarks: [],
    faceLandmarks: [],
  };

  // Interpolate pose landmarks
  if (startPose.poseLandmarks && endPose.poseLandmarks) {
    result.poseLandmarks = startPose.poseLandmarks.map((landmark, i) => 
      interpolateLandmark(landmark, endPose.poseLandmarks[i], progress)
    );
  }

  // Interpolate right hand landmarks
  if (startPose.rightHandLandmarks && endPose.rightHandLandmarks) {
    result.rightHandLandmarks = startPose.rightHandLandmarks.map((landmark, i) => 
      interpolateLandmark(landmark, endPose.rightHandLandmarks[i], progress)
    );
  }

  // Interpolate face landmarks
  if (startPose.faceLandmarks && endPose.faceLandmarks) {
    result.faceLandmarks = startPose.faceLandmarks.map((landmark, i) => 
      interpolateLandmark(landmark, endPose.faceLandmarks[i], progress)
    );
  }

  return result;
};

const easeInOutCubic = t => 
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function Tween({ 
  poses = [], 
  duration = 2000,
  width = 800,
  height = 600,
  loop = false,
  isPlaying = false
}) {
  const [currentPose, setCurrentPose] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  const animate = useCallback((timestamp) => {
    if (!startTime) {
      setStartTime(timestamp);
      requestAnimationFrame(animate);
      return;
    }

    const elapsed = timestamp - startTime;
    const totalDuration = duration * (poses.length - 1);
    let progress = elapsed / totalDuration;

    // Calculate which poses to interpolate between
    const absoluteProgress = progress * (poses.length - 1);
    const currentIndex = Math.min(Math.floor(absoluteProgress), poses.length - 2);
    const nextIndex = Math.min(currentIndex + 1, poses.length - 1);
    const segmentProgress = absoluteProgress - currentIndex;

    if (progress >= 1) {
      if (loop) {
        setStartTime(timestamp);
        setAnimationPhase(0);
      } else {
        // Ensure we end on the final pose
        setCurrentPose(poses[poses.length - 1]);
        return;
      }
    } else {
      // Apply easing to the segment progress
      const easedProgress = easeInOutCubic(segmentProgress);

      // Interpolate between current and next pose
      const interpolatedPose = interpolatePoseData(
        poses[currentIndex],
        poses[nextIndex],
        easedProgress
      );

      setCurrentPose(interpolatedPose);
      setAnimationPhase(currentIndex);
    }

    if (isPlaying) {
      requestAnimationFrame(animate);
    }
  }, [poses, duration, loop, isPlaying, startTime]);

  useEffect(() => {
    if (isPlaying && poses.length > 1) {
      setStartTime(null);
      setAnimationPhase(0);
      requestAnimationFrame(animate);
    }
  }, [isPlaying, animate, poses]);

  // If no current pose, use the first pose
  const poseToRender = currentPose || poses[0];

  return (
    <div>
      {poseToRender ? (
        <PoseDrawer
          poseData={poseToRender}
          width={width}
          height={height}
          similarityScore={null}
        />
      ) : (
        <p>Pose data not available</p>
      )}
    </div>
  );
}