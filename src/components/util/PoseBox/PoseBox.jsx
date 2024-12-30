import React, { useState } from 'react';
import { X } from 'lucide-react';
import PoseDrawer from '../../Pose/PoseDrawer';
import './PoseBox.css';

const PoseBox = ({ 
  width = 200, 
  height = 150, 
  name = '',
  currentPoseData = null,
  onPoseCapture = () => {} 
}) => {
  const [capturedPose, setCapturedPose] = useState(null);

  const handleCapture = () => {
    setCapturedPose(currentPoseData);
    onPoseCapture(currentPoseData);
  };

  const handleClear = () => {
    setCapturedPose(null);
    onPoseCapture(null);
  };

  return (
    <div className="pose-box">
      <div className="pose-box-header">
        {name}
        <button 
          className="clear-button"
          onClick={handleClear}
        >
          <X size={18} />
        </button>
      </div>
  
      <div className="pose-container" style={{ height }}>
        {capturedPose ? (
          <PoseDrawer
            poseData={capturedPose}
            width={width}
            height={height}
            similarityScores={null}
          />
        ) : (
          <div className="empty-state">
            No pose captured
          </div>
        )}
      </div>
  
      <button
        onClick={handleCapture}
        className="capture-button"
      >
        {capturedPose ? 'Update Pose' : 'Capture Pose'}
      </button>
    </div>
  );
};

export default PoseBox;