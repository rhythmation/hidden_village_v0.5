import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";
import { auth } from "../../services/Firebase/firebase";
import { signOut } from "firebase/auth";
function Home() {

    const navigate = useNavigate()

    function handleLogOut() {
        signOut(auth).then(() => {
            navigate("/signIn")
        }).catch((error) => {
            console.error(error)
        })

    }

    return (
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
    );
}

export default Home;