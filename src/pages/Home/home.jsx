import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";
import { auth } from "../../services/Firebase/firebase";
import { signOut } from "firebase/auth";
import { firebaseDB } from "../../services/Firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/common/loading/loading";

function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false)
  const { user } = useAuth(); 

  useEffect(() => {
    if (user) {
      setLoading(false); // Set loading to false when user is available

      if (!user.isAnonymous) {
        setIsAdmin(true)
        setCurrentUser(user.email);
        const userRef = doc(firebaseDB, "users", user.email);

        getDoc(userRef)
          .then((docSnap) => {
            if (!docSnap.exists()) {
              const userData = { students: [] };

              setDoc(userRef, userData)
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
      } else {
        setCurrentUser("Student Account");
      }
    }
  }, [user]);

  function handleLogOut() {
    signOut(auth)
      .then(() => {
        navigate("/signIn");
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // Show loading indicator while user data is being fetched
  if (loading) {
    return <Loading/>;
  }

  return (
    <div>
      <p id="user-info">Signed in as: {currentUser}</p>
      <div className="home-container">
        <div className="home-items">
          <div onClick={handleLogOut} className="home-link">Log Out</div>
          {isAdmin ? <Link className="home-link" to="/userManage">User Management</Link> : null }
          <Link className="home-link" to="/game">Play Game</Link>
          {isAdmin ? <Link className="home-link" to="/gameEditor">Editor</Link> : null}
          <Link className="home-link" to="/settings">Settings</Link>
          {isAdmin ? <button>Get Data</button> : null }
        </div>
      </div>
    </div>
  );
}

export default Home;
