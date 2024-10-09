// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKxTt_XX1yTgjETIOG9roxhnb3LgG_nIM",
  authDomain: "thvo-c5238.firebaseapp.com",
  projectId: "thvo-c5238",
  storageBucket: "thvo-c5238.appspot.com",
  messagingSenderId: "1019305135754",
  appId: "1:1019305135754:web:7984b23d9a675b065ee773",
  measurementId: "G-TZRBH2ZNZ7"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAnalytics = getAnalytics(firebaseApp);

