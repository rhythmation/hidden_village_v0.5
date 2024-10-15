import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/home.jsx";
import Game from "./pages/game/Game.jsx";
import GameEditor from "./pages/gameEditor/gameEditor.jsx";
import Settings from "./pages/settings/settings.jsx";
import SignIn from "./pages/Auth/signIn/signIn.jsx";
import UserManage from "./pages/UserManage/UserManage.jsx";
import { firebaseInstance } from "./services/Firebase/firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "./components/util/ProtectedRoute.jsx";
import SignUp from "./pages/Auth/signUp/signUp.jsx";
const firebase = firebaseInstance;

const auth = getAuth(firebaseInstance);

const App = () => {
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user !== null) {
        if (user.emailVerified) {
          setisLoggedIn(true);
          console.log("Logged in", user);
        } else {
          console.log("Need to verify user")
        }
      } else {
        setisLoggedIn(false);
        console.log("Logged out");
      }
      setLoading(false)
    });
  }, []);
  if (loading) {
    return <div>Loading...</div>
  }
  return (
    <Router>
      <Routes>
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/signUp" element={<SignUp />} />

        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn}/>}>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/gameEditor" element={<GameEditor />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/userManage" element={<UserManage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
