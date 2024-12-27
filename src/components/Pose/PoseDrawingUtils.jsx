import { SEGMENT_ANGLE_LANDMARKS } from "./LandmarkUtils";

/** @internal
 * @param {Object} firstPoint
 * @param {Object} secondPoint
 * @param {Object} thirdPoint
 * @returns {number} angle in radians
 */
const getAngle = (firstPoint, midPoint, lastPoint) => {
  let radians =
    Math.atan2(lastPoint.y - midPoint.y, lastPoint.x - midPoint.x) -
    Math.atan2(firstPoint.y - midPoint.y, firstPoint.x - midPoint.x);
  return radians;
};

/** @internal
 * @param {Number} currentAngle
 * @param {Number} desiredAngle
 * @returns {Number} in range (0,100)
 * @description piecewise exponential function that calculates the difference between two angles
 * in radians
 *
 * calculations for 0 to π/2 are calculated using the following formula on Wolfram Alpha:
 * exponential fit {0,0},{π*0.25,10},{π*0.45,50}, {π*0.5,100}
 *
 * calculations for π/2 to π are calculated using the following formula on Wolfram Alpha:
 * exponential fit {π*0.5,100},{π*0.55,50}, {π*0.75,10}, {π,0}
 *
 * */
const angleDifference = (currentAngle, desiredAngle) => {
  let translation = Math.PI * 0.5 - desiredAngle;
  let angle = currentAngle + translation;
  if (angle <= Math.PI * 0.5 && angle >= 0) {
    return 0.167249 * Math.exp(angle * 4.06397);  {/*  0.167249 e^(4.06397 x)  */}
  } else if (angle > Math.PI * 0.5 && angle <= Math.PI) {  {/*  9.488988743673417*^7/E^(8.76242 x)   58634. e^(-4.06397 x)  */} 
    return 58634 * Math.exp(angle * -4.06397);
  } else {
    return 0;
  }
};

const objMap = (obj, func) => {
    const entries = new Array(Object.keys(obj).length);
    let i = 0;
    for (const key in obj) {
      entries[i++] = [key, func(obj[key])];
    }
    return Object.fromEntries(entries);
  };

const landmarkToCoordinates = (data, width, height) => {
  return (landmark) => {
    if (data) {
      const coordinates = Object.assign({}, data[landmark]);
      {/* scale the coordinates from 0 to 1 to a size within the column's width and height */}
      coordinates.x *= width;
      coordinates.y *= height;
      {/* bound the coordinates based on height and width of the newly scaled coordinates */}
      // coordinates.x = Math.min(Math.max(coordinates.x, 0), width);
      // coordinates.y = Math.min(Math.max(coordinates.y, 0), height);
      return coordinates;
    }
  };
};

/**
 * @param {Object} config Configuration object containing:
 * - a segment key defining which body segment to look up in the SEGMENT_ANGLE_LANDMARKS object
 * - a data key defining which set of pose data to use when converting the landmark indices to coordinates
 * @param {Object} data Data object with raw landmark data to subset
 * - should have keys corresponding to values passed in the config object
 * @param {Object} container layout object defining the container values
 * - should have width and height keys with values for the container's width and height
 * @returns {Array} Array containing landmark coordinates for the segment
 */
const matchSegmentToLandmarks = (config, poseData, container) => {
  if (!config || !poseData || !container) return null;
  return objMap(
    SEGMENT_ANGLE_LANDMARKS[config.segment],
    landmarkToCoordinates(poseData[config.data], container.width, container.height)
  );
};

/**
 * @param {Object} playerBodySegment an object containing three landmark objects, with each landmark having an x,y coordinate
 * @param {Object} modelBodySegment an object containing three landmark objects, with each landmark having an x,y coordinate
 * @returns {number} percentage
 * @description
 * returns a percentage of similarity between the player body segment
 * and the model body segment
 * */
const segmentSimilarity = (playerBodySegment, modelBodySegment) => {
  const [playerFirst, playerSecond, playerThird] = Object.keys(playerBodySegment);
  const [modelFirst, modelSecond, modelThird] = Object.keys(modelBodySegment);
  return angleDifference(
    getAngle(
      playerBodySegment[playerFirst],
      playerBodySegment[playerSecond],
      playerBodySegment[playerThird]
    ),
    getAngle(
      modelBodySegment[modelFirst],
      modelBodySegment[modelSecond],
      modelBodySegment[modelThird]
    )
  );
};

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
  const rowHeight = (screenHeight - 2 * columnGutter - (numberOfRows - 1) * marginBetweenRows) / numberOfRows;
  // calculate the height of each column
  const columnHeight = screenHeight - 2 * columnGutter;
  // calculate the width of each column
  const columnWidth = (screenWidth - 2 * rowGutter - (numberOfColumns - 1) * marginBetweenColumns) / numberOfColumns;
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

export { objMap, landmarkToCoordinates, segmentSimilarity, matchSegmentToLandmarks, generateRowAndColumnFunctions };