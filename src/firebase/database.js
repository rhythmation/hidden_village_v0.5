// Firebase Init
import { ref, push, getDatabase, set, query, equalTo, get, orderByChild } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { Curriculum } from "../components/CurricularModule/CurricularModule";


// Import the uuid library
const { v4: uuidv4 } = require('uuid');

const db = getDatabase();

// User Id functionality will be added in a different PR
let userId;

// Get the Firebase authentication instance
const auth = getAuth();

// Listen for changes to the authentication state
// and update the userId variable accordingly
onAuthStateChanged(auth, (user) => {
  userId = user.uid;
});

// Define data keys for the text inputs of conjectures
export const keysToPush = [
  "Conjecture Name",
  "Author Name",
  "PIN",
  "Conjecture Keywords",
  "Conjecture Description",
  "Multiple Choice 1",
  "Multiple Choice 2",
  "Multiple Choice 3",
  "Multiple Choice 4",
];

// Export a function named writeToDatabase
export const writeToDatabase = async (poseData, conjectureId, frameRate) => {
  // Create a new date object to get a timestamp
  const dateObj = new Date();
  const timestamp = dateObj.toISOString();

  // Create a reference to the Firebase Realtime Database
  const dbRef = ref(db, "/Experimental_Data");

  // Create an object to send to the database
  // This object includes the userId, poseData, conjectureId, frameRate, and timestamp and
  const dataToSend = {
    userId,
    poseData: JSON.stringify(poseData),
    conjectureId,
    frameRate,
    timestamp,
  };

  // Push the data to the database using the dbRef reference
  const promise = push(dbRef, dataToSend);

  // Return the promise that push() returns
  return promise;
};

export const writeToDatabasePoseAuth = async (poseData, state, tolerance) => {
  // Create a new date object to get a timestamp
  const dateObj = new Date();
  const timestamp = dateObj.toISOString();

  // Create a reference to the Firebase Realtime Database
  const dbRef = ref(db, "/PoseAuthoring");

  // Create an object to send to the database
  // This object includes the userId, poseData, conjectureId, frameRate, and timestamp
  const dataToSend = {
    userId,
    poseData,
    timestamp,
    state,
    tolerance,
  };

  // Push the data to the database using the dbRef reference
  const promise = push(dbRef, dataToSend);

  // Return the promise that push() returns
  return promise;
};

export const writeToDatabaseConjecture = async () => {
  // Create a new date object to get a timestamp
  const dateObj = new Date();
  const timestamp = dateObj.toISOString();

  const conjectureID = uuidv4();
  console.log('Conjecture UUID:', conjectureID);

  // Initialize empty object to store the data inside
  const dataToPush = {};

  // Fetch values from local storage for each key inside keysToPush 
  const isAnyKeyNullOrUndefined = keysToPush.some((key) => {
    const value = localStorage.getItem(key);
    return value === null || value === undefined || value.trim() === '';
  });

  // if any text values are not there alert message and exit
  if (isAnyKeyNullOrUndefined) {
    return alert("One or more text values are empty. Cannot publish conjecture to database.");
  }

  // Check if any of the pose data is null before proceeding
  const startJson = localStorage.getItem('start.json');
  const intermediateJson = localStorage.getItem('intermediate.json');
  const endJson = localStorage.getItem('end.json');

  if (
    startJson !== null && startJson !== undefined &&
    intermediateJson !== null && intermediateJson !== undefined &&
    endJson !== null && endJson !== undefined
  ) {
    // create pose objects
    const startPoseData = await createPoseObjects(startJson, 'StartPose', localStorage.getItem('Start Tolerance'));
    const intermediatePoseData = await createPoseObjects(intermediateJson, 'IntermediatePose', localStorage.getItem('Intermediate Tolerance'));
    const endPoseData = await createPoseObjects(endJson, 'EndPose', localStorage.getItem('End Tolerance'));

    // Define the database path
    const conjecturePath = `Level: ${localStorage.getItem("Conjecture Name")}`;

    // Fetch values from local storage for each key inside keysToPush 
    await Promise.all(keysToPush.map(async (key) => {
      const value = localStorage.getItem(key);

      // Check if the value is not null, undefined, or an empty string
      if (value !== null && value !== undefined && value.trim() !== '') {
        // uses helper function to create text objects
        Object.assign(dataToPush, await createTextObjects(key, value));
      }
    }));

    // creates promises to push all of the data to the database 
    // uses set to overwrite the random firebaseKeys with easier to read key names
    const promises = [
      set(ref(db, `${conjecturePath}/Time`), timestamp),
      set(ref(db, `${conjecturePath}/AuthorID`), userId),
      set(ref(db, `${conjecturePath}/UUID`),conjectureID),
      set(ref(db, `${conjecturePath}/PIN`), localStorage.getItem("PIN")),
      set(ref(db, `${conjecturePath}/Start Pose`), startPoseData),
      set(ref(db, `${conjecturePath}/Intermediate Pose`), intermediatePoseData),
      set(ref(db, `${conjecturePath}/End Pose`), endPoseData),
      set(ref(db, `${conjecturePath}/Text Boxes`), dataToPush),
      set(ref(db, `${conjecturePath}/isFinal`), true),
    ];

    return promises && alert("Conjecture successfully published to database.");
  } else {
    return alert("One or more poses are missing. Cannot publish conjecture to database.");
  }
};

// save a draft of the current conjecture so it can be published later
export const writeToDatabaseDraft = async () => {
  // Create a new date object to get a timestamp
  const dateObj = new Date();
  const timestamp = dateObj.toISOString();

  // Initialize empty object to store the data inside
  const dataToPush = {};

  // Fetch values from local storage for each key inside KeysToPush 
  await Promise.all(keysToPush.map(async (key) => {
    const value = localStorage.getItem(key);
    Object.assign(dataToPush, await createTextObjects(key, value));

    // If the value is undefined assign the value as undefined in firebase
    if(value == undefined){
      Object.assign(dataToPush, await createTextObjects(key, "undefined"));
    }
  }));

  // create pose objects
  const startPoseData = await createPoseObjects(localStorage.getItem('start.json'), 'StartPose', localStorage.getItem('Start Tolerance'));
  const intermediatePoseData = await createPoseObjects(localStorage.getItem('intermediate.json'), 'IntermediatePose', localStorage.getItem('Intermediate Tolerance'));
  const endPoseData = await createPoseObjects(localStorage.getItem('end.json'), 'EndPose', localStorage.getItem('End Tolerance'));

  // Define the database path
  const conjecturePath = `Level: ${localStorage.getItem("Conjecture Name")}`;

  // creates promises to push all of the data to the database 
  // uses set to overwrite the random firebaseKeys with easier to read key names
  const promises = [
    set(ref(db, `${conjecturePath}/Time`), timestamp),
    set(ref(db, `${conjecturePath}/Start Pose`), startPoseData),
    set(ref(db, `${conjecturePath}/Intermediate Pose`), intermediatePoseData),
    set(ref(db, `${conjecturePath}/End Pose`), endPoseData),
    set(ref(db, `${conjecturePath}/Text Boxes`), dataToPush),
    set(ref(db, `${conjecturePath}/isFinal`), false),
  ];

  return promises && alert("Draft saved");
};

// Helper function to create pose objects for the writeToDatabaseConjecture function 
const createPoseObjects = async (poseData, state, tolerance) => {
  const dateObj = new Date();
  const timestamp = dateObj.toISOString();

  const dataToSend = {
    userId,
    poseData,
    timestamp,
    state,
    tolerance,
  };

  // Returns pose data
  return dataToSend;
}

// Helper function to create text objects for the writeToDatabaseConjecture function 
const createTextObjects = async (key, value) => {
  const dataToSend = {
    [key]: value,
  };

  // Returns text data 
  return dataToSend;
}

// Set the initial time of the last alert to the current time
let lastAlertTime = Date.now();

// Define a function to check the status of a set of promises
export const promiseChecker = async (frameRate, promises) => {
  // Set the data loss threshold and check interval in seconds
  const dataLossThresholdInSeconds = 2;
  const checkIntervalInSeconds = 10;

  // Calculate the number of frame packages and the data loss threshold in frames
  const totalFramePackages = checkIntervalInSeconds * frameRate;
  const dataLossThreshold = dataLossThresholdInSeconds * frameRate;

  // Calculate the starting index for the promises to check
  const startIndex = Math.max(promises.length - totalFramePackages - 1, 0);

  // Get the promises to check
  const promisesToCheck = promises.slice(startIndex);

  // Count the number of rejected promises
  const totalRejections = await countRejectedPromises(promisesToCheck);

  // If the number of rejected promises is greater than the data loss threshold, alert the user
  if (totalRejections > dataLossThreshold) {
    // Get the current time
    const currentTime = Date.now();

    // Check if enough time has passed since the last alert
    if (currentTime - lastAlertTime > checkIntervalInSeconds * 1000) {
      // Alert the user
      alert(
        "The program is not sending enough data to the database. Please check the internet connection/connection speed to make sure that it can support data collection for this experiment."
      );

      // Update the last alert time
      lastAlertTime = currentTime;
    }
  } else {
    // If there is no data loss, log a message to the console
    console.log("No data loss detected");
  }
};

// Define a function to count the number of rejected promises
const countRejectedPromises = async (promises) => {
  let rejectedCount = 0;

  // Use Promise.allSettled to check the status of each promise
  await Promise.allSettled(
    promises.map((promise) => {
      return promise
        .then(() => {
          // If the promise is resolved, do nothing
        })
        .catch(() => {
          // If the promise is rejected, increment the rejected count
          rejectedCount++;
        });
    })
  );

  // Return the total number of rejected promises
  return rejectedCount;
};


// save a draft of a collection of conjectures to be published later
export const writeToDatabaseCurricularDraft = async () => {
  // Create a new date object to get a timestamp
  const dateObj = new Date();
  const timestamp = dateObj.toISOString();

  const CurricularID = uuidv4();

  const conjectureList = Curriculum.getCurrentConjectures();
  let dataToPush = [];
  for (let i = 0; i < conjectureList.length; i++){
    dataToPush.push(conjectureList[i]["conjecture"]["UUID"]);
  }

  const CurricularPath = `Game: ${localStorage.getItem("CurricularName")}`;

  // creates promises to push all of the data to the database 
  // uses set to overwrite the random firebaseKeys with easier to read key names
  const promises = [
    set(ref(db, `${CurricularPath}/ConjectureUUIDs`), dataToPush),
    set(ref(db, `${CurricularPath}/Time`), timestamp),
    set(ref(db, `${CurricularPath}/UUID`), CurricularID),
    set(ref(db, `${CurricularPath}/Author`), localStorage.getItem("CurricularAuthor")),
    set(ref(db, `${CurricularPath}/Keywords`), localStorage.getItem("CurricularKeywords")),
    set(ref(db, `${CurricularPath}/PIN`), localStorage.getItem("CurricularPIN")),
    set(ref(db, `${CurricularPath}/isFinal`), false),
  ];

  return promises && alert("Curricular Draft saved");
}


// Define a function to retrieve a conjecture based on UUID
export const getConjectureDataByUUID = async (conjectureID) => {
  try {
    // ref the realtime db
    const dbRef = ref(db, 'Level');
    // query to find data with the UUID
    const q = query(dbRef, orderByChild('UUID'), equalTo(conjectureID));
    
    // Execute the query
    const querySnapshot = await get(q);

    // check the snapshot
    if (querySnapshot.exists()) {
      const data = querySnapshot.val();
      return data; // return the data if its good
    } else {
      return null; // This will happen if data not found
    }
  } catch (error) {
    throw error; // this is an actual bad thing
  }
};

// Define a function to retrieve an array of conjectures based on AuthorID
export const getConjectureDataByAuthorID = async (authorID) => {
  try {
    // ref the realtime db
    const dbRef = ref(db, 'Level');
    // query to find data with the AuthorID
    const q = query(dbRef, orderByChild('AuthorID'), equalTo(authorID));
    
    // Execute the query
    const querySnapshot = await get(q);

    // check the snapshot
    if (querySnapshot.exists()) {
      // get all the conjectures in an array
      const conjectures = [];
      querySnapshot.forEach((conjectureSnapshot) => {
        conjectures.push(conjectureSnapshot.val());
      });
      return conjectures; // return the data if its good
    } else {
      return null; // This will happen if data not found
    }
  } catch (error) {
    throw error; // this is an actual bad thing
  }
};

// Define a function to retrieve an array of conjectures based on PIN
export const getConjectureDataByPIN = async (PIN) => {
  try {
    // ref the realtime db
    const dbRef = ref(db, 'Level');
    // query to find data with the PIN
    const q = query(dbRef, orderByChild('PIN'), equalTo(PIN));
    
    // Execute the query
    const querySnapshot = await get(q);

    // check the snapshot
    if (querySnapshot.exists()) {
      // get all the conjectures in an array
      const conjectures = [];
      querySnapshot.forEach((conjectureSnapshot) => {
        conjectures.push(conjectureSnapshot.val());
      });
      return conjectures; // return the data if its good
    } else {
      return null; // This will happen if data not found
    }
  } catch (error) {
    throw error; // this is an actual bad thing
  }
};

// get a list of all the conjecture UUIDs
export const getConjectureList = async (final) => {
  try {
    // ref the realtime db
    const dbRef = ref(db, 'Final');

    // query to find data
    let q;
    if (final){ //return only the final (complete) conjectures
      q = query(dbRef, orderByChild('isFinal'), equalTo(final));
    }
    else{ // return both final conjectures (complete) and drafts of conjectures (incomplete)
      q = query(dbRef, orderByChild('isFinal'));
    }
    
    // Execute the query
    const querySnapshot = await get(q);

    // check the snapshot
    if (querySnapshot.exists()) {
      // get all the conjectures in an array
      const conjectures = [];
      querySnapshot.forEach((conjectureSnapshot) => {
        conjectures.push(conjectureSnapshot.val());
      });
      return conjectures; // return the data if its good
    } else {
      return null; // This will happen if data not found
    }
  } catch (error) {
    throw error; // this is an actual bad thing
  }
};