import { Link } from "react-router-dom";
import PoseDrawer from "../../components/Pose/PoseDrawer.jsx";
import GetPoseData from "../../components/Pose/MotionCaptureUtils.jsx";
import { useState } from "react";
import PoseBox from "../../components/util/PoseBox.jsx";

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
        <div className="p-6">
            <div className="flex gap-6">
                <div className="flex-1">
                    <div className="mb-4">
                        <Link to="/" className="text-blue-600 hover:text-blue-800">
                            Back to Home
                        </Link>
                    </div>
                    
                    {loading ? (
                        <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <div className="rounded-lg overflow-hidden">
                            <PoseDrawer
                                poseData={poseData}
                                width={width}
                                height={height}
                                similarityScores={null}
                            />
                        </div>
                    )}
                </div>

                <div className="w-[200px]">
                    <PoseBox
                        width={poseBoxWidth}
                        height={poseBoxHeight}
                        name="Captured Pose"
                        currentPoseData={poseData}
                        onPoseCapture={handlePoseCapture}
                    />
                </div>
            </div>
        </div>
    );
};

export default Tween;