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
    
    // Create separate state for each pose box
    const [startPose, setStartPose] = useState(null);
    const [intermediatePose, setIntermediatePose] = useState(null);
    const [endPose, setEndPose] = useState(null);

    // Handle pose capture for each box separately
    const handlePoseCapture = {
        start: (capturedPose) => {
            setStartPose(capturedPose);
            console.log("Start pose captured:", capturedPose);
        },
        intermediate: (capturedPose) => {
            setIntermediatePose(capturedPose);
            console.log("Intermediate pose captured:", capturedPose);
        },
        end: (capturedPose) => {
            setEndPose(capturedPose);
            console.log("End pose captured:", capturedPose);
        }
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
                        onPoseCapture={handlePoseCapture.start}
                    />
                    <PoseBox
                        width={poseBoxWidth}
                        height={poseBoxHeight}
                        name="Intermediate Pose"
                        currentPoseData={poseData}
                        onPoseCapture={handlePoseCapture.intermediate}
                    />
                    <PoseBox
                        width={poseBoxWidth}
                        height={poseBoxHeight}
                        name="End Pose"
                        currentPoseData={poseData}
                        onPoseCapture={handlePoseCapture.end}
                    />
                </div>
            </div>
        </div>
    );
};

export default Tween;