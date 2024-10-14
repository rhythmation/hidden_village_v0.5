import {initializeApp } from "firebase/app"
import {getAuth, onAuthStateChanged} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAKxTt_XX1yTgjETIOG9roxhnb3LgG_nIM",
  authDomain: "thvo-c5238.firebaseapp.com",
  projectId: "thvo-c5238",
  storageBucket: "thvo-c5238.appspot.com",
  messagingSenderId: "1019305135754",
  appId: "1:1019305135754:web:7984b23d9a675b065ee773",
  measurementId: "G-TZRBH2ZNZ7"
};

const firebaseInstance = initializeApp(firebaseConfig);

const auth = getAuth(firebaseInstance);


export { firebaseInstance, auth };

