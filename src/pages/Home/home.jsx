import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";
import { auth } from "../../services/Firebase/firebase";
import { signOut } from "firebase/auth";
import { firebaseDB } from "../../services/Firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/common/loading/loading";
import GetData from "../../components/GetDataModal/GetData";
import "../../components/GetDataModal/GetData.css"

function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeUser = async () => {
      if (user) {
        if (!user.isAnonymous) {
          setIsAdmin(true);
          setCurrentUser(user.email);

          const userRef = doc(firebaseDB, "users", user.email);

          try {
            const docSnap = await getDoc(userRef);
            if (!docSnap.exists()) {
              const userData = { students: [] };
              await setDoc(userRef, userData);
              console.log("User document created successfully");
            } else {
              console.log("User document already exists");
            }
          } catch (error) {
            console.error("Error handling user document:", error);
          }
        } else {
          setCurrentUser("Student Account");
        }
        setLoading(false);
      }
    };

    initializeUser();
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <p id="user-info">Signed in as: {currentUser}</p>
      <div className="home-container">
        <div className="home-items">
          <div onClick={handleLogOut} className="home-link">Log Out</div>
          {isAdmin && <Link className="home-link" to="/userManage">User Management</Link>}
          <Link className="home-link" to="/game">Play Game</Link>
          {isAdmin && <Link className="home-link" to="/gameEditor">Editor</Link>}
          <Link className="home-link" to="/settings">Settings</Link>
          {isAdmin && (<button onClick={() => setIsModalOpen(true)}>Get Data</button>)}
        </div>
      </div>
      <GetData isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userId={currentUser}/>
    </div>
  );
}

export default Home;
