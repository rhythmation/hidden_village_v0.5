import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./home.css";

function Home() {

    return (
        <div className="home-container">
            <div className="home-items">
                <Link className="home-link" to="/signIn"> Sign in</Link>
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