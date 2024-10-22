import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";
import { auth } from "../../services/Firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth"
import { firebaseDB } from "../../services/Firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Home() {
  const [currentUser, setCurrentUser] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.email);

        const userRef = doc(firebaseDB, "users", user.email);
        
        getDoc(userRef)
          .then((docSnap) => {
            if (!docSnap.exists()) {
              // User document doesn't exist, create it
              const userData = {
                students: [],
              };

              return setDoc(userRef, userData)
                .then(() => {
                  console.log("User document created successfully");
                })
                .catch((error) => {
                  console.error("Error creating user document:", error);
                });
            } else {
              console.log("User document already exists");
            }
          })
          .catch((error) => {
            console.error("Error checking user document:", error);
          });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  function handleLogOut() {
    signOut(auth)
      .then(() => {
        navigate("/signIn");
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div>
      <p id="user-info"> Signed in as: {currentUser}</p>
      <div className="home-container">
        <div className="home-items">
          <div onClick={() => handleLogOut()} className="home=link">
            {" "}
            Log Out
          </div>
          <Link className="home-link" to="/userManage">
            User Management
          </Link>
          <Link className="home-link" to="/game">
            {" "}
            Play Game
          </Link>
          <Link className="home-link" to="/gameEditor">
            Editor
          </Link>
          <Link className="home-link" to="/settings">
            Settings
          </Link>
          <button>Get Data</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
