import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Holistic } from "@mediapipe/holistic/holistic";
import { enrichLandmarks } from "../../components/Pose/landmark_utilities";
import Pose from "../../components/Pose/index.jsx";

const generateRowAndColumnFunctions = (
    screenWidth,
    screenHeight,
    numberOfRows,
    numberOfColumns,
    marginBetweenRows,
    marginBetweenColumns,
    columnGutter,
    rowGutter
  ) => {
    // calculate the width of each row
    const rowWidth = screenWidth - 2 * rowGutter;
    // calculate the height of each row
    const rowHeight =
      (screenHeight - 2 * columnGutter - (numberOfRows - 1) * marginBetweenRows) /
      numberOfRows;
    // calculate the height of each column
    const columnHeight = screenHeight - 2 * columnGutter;
    // calculate the width of each column
    const columnWidth =
      (screenWidth -
        2 * rowGutter -
        (numberOfColumns - 1) * marginBetweenColumns) /
      numberOfColumns;
  
    // return a tuple containing two functions:
    // one that takes in a row index and returns an object with the dimensions of the row, its starting x, and its starting y
    // the other that takes in a column index and returns an object with the dimensions of the column, its starting x, and its starting y
    return [
      (rowNumber) => {
        if (rowNumber > numberOfRows) {
          throw new Error("rowNumber is greater than numberOfRows");
        }
        return {
          width: rowWidth,
          height: rowHeight,
          x: rowGutter,
          y: columnGutter + (rowHeight + marginBetweenRows) * (rowNumber - 1),
          margin: marginBetweenRows,
        };
      },
      (columnNumber) => {
        if (columnNumber > numberOfColumns) {
          throw new Error("columnNumber is greater than numberOfColumns");
        }
        return {
          width: columnWidth,
          height: columnHeight,
          x:
            rowGutter + (columnWidth + marginBetweenColumns) * (columnNumber - 1),
          y: columnGutter,
          margin: marginBetweenColumns,
        };
      },
    ];
  };

const Tween = () => {
  const [poseData, setPoseData] = useState({});
  const [height, setHeight] = useState(window.innerHeight);
  const [width, setWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);

  const numRows = 2;
  const numColumns = 3;
  const marginBetweenRows = 20;
  const marginBetweenColumns = 20;
  const columnGutter = 30;
  const rowGutter = 30;

  let [rowDimensions, columnDimensions] = generateRowAndColumnFunctions(
    width,
    height,
    numRows,
    numColumns,
    marginBetweenRows,
    marginBetweenColumns,
    columnGutter,
    rowGutter
  );

  // Resize handler
  const handleResize = () => {
    setHeight(window.innerHeight);
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    // Initialize camera and holistic model on component mount
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

    // Pose detection frame function
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
      setPoseData(enrichLandmarks(newResults)); // Process and set new pose data
    };

    holistic.onResults(updatePoseResults);

    camera.start();

    // Listen to window resize
    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount
    return () => {
      camera.stop();
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty array means this effect only runs once when the component mounts

  return (
    <div>
      <p>Placeholder Page</p>
      <Link to="/">Back to Home</Link>
      <div>Pose Data: {JSON.stringify(poseData)}</div> {/* Displaying pose data */}
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <p>Pose Detection is active.</p>
        )}
      </div>
    </div>
  );
};

export default Tween;
