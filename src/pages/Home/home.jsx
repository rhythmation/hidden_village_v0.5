import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";
import { auth } from "../../services/Firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

function Home() {
    const [currentUser, setCurrentUser] = useState()

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
              setCurrentUser(user.email)
            }
          });
    }, [])


    const navigate = useNavigate()

    function handleLogOut() {
        signOut(auth).then(() => {
            navigate("/signIn")
        }).catch((error) => {
            console.error(error)
        })

    }

    return (
        <div>
        <p id="user-info"> Signed in as: {currentUser}</p>
        <div className="home-container">
            <div className="home-items">
                <div onClick={() => handleLogOut()} className="home=link"> Log Out</div>
                <Link className="home-link" to="/userManage">User Management</Link>
                <Link className="home-link" to="/game"> Play Game</Link>
                <Link className="home-link" to="/gameEditor">Editor</Link>
                <Link className="home-link" to="/settings">Settings</Link>
            <button>Get Data</button>
            </div>
        </div>
        </div>
    );
}

export default Home;