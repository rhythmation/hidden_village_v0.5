import { Camera } from "@mediapipe/camera_utils";
import { Holistic } from "@mediapipe/holistic/holistic";
import { enrichLandmarks } from "./LandmarkUtils.jsx";
import { useEffect, useState } from "react";

const GetPoseData = () => {
    const [loading, setLoading] = useState(true);
    const [poseData, setPoseData] = useState({});
    const [height, setHeight] = useState(window.innerHeight);
    const [width, setWidth] = useState(window.innerWidth);

    const handleResize = () => {
        setHeight(window.innerHeight);
        setWidth(window.innerWidth);
    };

    useEffect(() => {
        const videoElement = document.getElementsByClassName("input-video")[0];
        const holistic = new Holistic({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
        });
    
        holistic.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: true,
          smoothSegmentation: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          selfieMode: true,
          refineFaceLandmarks: true,
        });

        const poseDetectionFrame = async () => {
            await holistic.send({ image: videoElement });
            if (loading) {
                setLoading(false);
            }
        };

        const camera = new Camera(videoElement, {
            onFrame: poseDetectionFrame,
            width: window.innerWidth,
            height: window.innerHeight,
            facingMode: "environment",
        });

        const updatePoseResults = (newResults) => {
            setPoseData(enrichLandmarks(newResults));
        };

        holistic.onResults(updatePoseResults);
        camera.start();

        window.addEventListener("resize", handleResize);

        return () => {
            camera.stop();
            window.removeEventListener("resize", handleResize);
        };
    }, [loading]);

    return { poseData, width, height, loading };
};

export default GetPoseData;
