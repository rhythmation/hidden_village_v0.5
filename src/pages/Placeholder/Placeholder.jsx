import { Link } from "react-router-dom";
import PoseDrawer from "../../components/Pose/index.jsx";
import GetPoseData from "../../components/Pose/MotionCaptureUtils.jsx";

const Tween = () => {
    const { poseData, width, height, loading } = GetPoseData();

    return (
        <div>
            <p>Placeholder Page</p>
            <Link to="/">Back to Home</Link>
            <div>Pose Data: {JSON.stringify(poseData)}</div>
            <div>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    // <PoseDrawer
                    //     poseData={poseData}
                    //     width={width}
                    //     height={height}
                    //     similarityScores={null}
                    // />
                    <p>Placeholder</p>
                )}
            </div>
        </div>
    );
};

export default Tween;
