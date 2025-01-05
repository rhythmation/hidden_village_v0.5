import { Link } from "react-router-dom";
import PoseDrawer from "../../components/Pose/PoseDrawer.jsx";
import GetPoseData from "../../components/Pose/MotionCaptureUtils.jsx";
import { useState } from "react";
import PoseBox from "../../components/util/PoseBox/PoseBox.jsx";
import './Placeholder.css';
import { Tween } from "../../components/Pose/Tween.jsx";
import { PoseMatch } from "../../components/Pose/PoseMatching.jsx";

const Placeholder = () => {
    const width = 800;
    const height = 600;
    const poseBoxWidth = 200;
    const poseBoxHeight = 150;
    
    const { poseData, loading } = GetPoseData({width, height});
    const [poses, setPoses] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const handlePoseCapture = {
        start: (capturedPose) => {
            setPoses(current => {
                const newPoses = [...current];
                newPoses[0] = capturedPose;
                return newPoses;
            });
        },
        intermediate: (capturedPose) => {
            setPoses(current => {
                const newPoses = [...current];
                newPoses[1] = capturedPose;
                return newPoses;
            });
        },
        end: (capturedPose) => {
            setPoses(current => {
                const newPoses = [...current];
                newPoses[2] = capturedPose;
                return newPoses;
            });
        }
    };

    const toggleAnimation = () => {
        setIsAnimating(!isAnimating);
    };

    const canAnimate = poses.length === 3 && poses.every(pose => pose !== undefined);

    return (
        <div className="container">
            <div className="layout">
                <div className="main-content">
                    <div className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to="/" className="back-link">
                            Back to Home
                        </Link>
                        <button 
                            onClick={toggleAnimation}
                            disabled={!canAnimate}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: canAnimate ? (isAnimating ? '#dc2626' : '#2563eb') : '#9ca3af',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: canAnimate ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {isAnimating ? 'Stop Animation' : 'Start Animation'}
                        </button>
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
                                similarityScore={null}
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
                {canAnimate && (
                    <Tween
                        poses={poses}
                        duration={4000}
                        width={width}
                        height={height}
                        loop={true}
                        isPlaying={isAnimating}
                    />
                )}
                <PoseMatch
                        posesToMatch={poses}
                        poseData={poseData}
                />
            </div>
        </div>
    );
};

export default Placeholder;