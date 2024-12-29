// PoseBox.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import PoseDrawer from '../Pose/PoseDrawer';

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
    <div className="rounded-lg border border-gray-200 shadow-sm bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        {name}
        <button 
          className="text-gray-500 hover:text-red-500 transition-colors"
          onClick={handleClear}
        >
          <X size={18} />
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-gray-100 mb-3" style={{ height }}>
        {capturedPose ? (
          <PoseDrawer
            poseData={capturedPose}
            width={width}
            height={height}
            similarityScores={null}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No pose captured
          </div>
        )}
      </div>

      <button
        onClick={handleCapture}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
      >
        {capturedPose ? 'Update Pose' : 'Capture Pose'}
      </button>
    </div>
  );
};

export default PoseBox;