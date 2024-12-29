import { Link } from "react-router-dom";
import PoseDrawer from "../../components/Pose/PoseDrawer.jsx";
import GetPoseData from "../../components/Pose/MotionCaptureUtils.jsx";

const Tween = () => {
    const width = 800;
    const height = 600;
    
    const { poseData, loading } = GetPoseData({width,height});

    return (
        <div>
            <p>Placeholder Page</p>
            <Link to="/">Back to Home</Link>
            <div>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <PoseDrawer
                        poseData={poseData}
                        width={width}
                        height={height}
                        similarityScores={null}
                    />
                )}
            </div>
        </div>
    );
};

export default Tween;