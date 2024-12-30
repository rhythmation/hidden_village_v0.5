import { Link } from "react-router-dom";
import PoseDrawer from "../../components/Pose/PoseDrawer.jsx";
import GetPoseData from "../../components/Pose/MotionCaptureUtils.jsx";
import { useState } from "react";
import PoseBox from "../../components/util/PoseBox/PoseBox.jsx";
import './Placeholder.css';

const Tween = () => {
    const width = 800;
    const height = 600;
    const poseBoxWidth = 200;
    const poseBoxHeight = 150;
    
    const { poseData, loading } = GetPoseData({width, height});
    const [savedPoseData, setSavedPoseData] = useState(null);

    const handlePoseCapture = (capturedPose) => {
        setSavedPoseData(capturedPose);
    };

    return (
        <div className="container">
            <div className="layout">
                <div className="main-content">
                    <div className="mb-4">
                        <Link to="/" className="back-link">
                            Back to Home
                        </Link>
                    </div>
                    
                    {loading ? (
                        <div className="loading-container">
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <div className="pose-display">
                            <PoseDrawer
                                poseData={poseData}
                                width={width}
                                height={height}
                                similarityScores={null}
                            />
                        </div>
                    )}
                </div>
    
                <div className="sidebar">
                    <PoseBox
                        width={poseBoxWidth}
                        height={poseBoxHeight}
                        name="Start Pose"
                        currentPoseData={poseData}
                        onPoseCapture={handlePoseCapture}
                    />
                    <PoseBox
                        width={poseBoxWidth}
                        height={poseBoxHeight}
                        name="Intermediate Pose"
                        currentPoseData={poseData}
                        onPoseCapture={handlePoseCapture}
                    />
                    <PoseBox
                        width={poseBoxWidth}
                        height={poseBoxHeight}
                        name="End Pose"
                        currentPoseData={poseData}
                        onPoseCapture={handlePoseCapture}
                    />
                </div>
            </div>
        </div>
    );
};

export default Tween;