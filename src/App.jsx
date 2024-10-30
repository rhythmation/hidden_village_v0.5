import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/home.jsx";
import Game from "./pages/game/Game.jsx";
import GameEditor from "./pages/gameEditor/gameEditor.jsx";
import Settings from "./pages/settings/settings.jsx";
import SignIn from "./pages/Auth/signIn/signIn.jsx";
import UserManage from "./pages/UserManage/UserManage.jsx";
import ProtectedRoute from "./components/util/ProtectedRoute.jsx";
import SignUp from "./pages/Auth/signUp/signUp.jsx";
import StudentAuth from "./pages/Auth/studentAuth/studentAuth.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import AdminRoute from "./components/util/AdminRoute.jsx";

const App = () => {
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [adminStatus, setAdminStatus] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.isAnonymous) {
        setisLoggedIn(true);
      } else if (user.emailVerified) {
        setAdminStatus(true);
        setisLoggedIn(true);
      } else {
        setisLoggedIn(false);
      }
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route path="/signIn" element={<StudentAuth />} />
        <Route path="/AdminSignIn" element={<SignIn />} />
        <Route path="/AdminSignUp" element={<SignUp />} />

        {/* Protect routes based on login status */}
        <Route element={<ProtectedRoute loginStatus={isLoggedIn} />}>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/settings" element={<Settings />} />

          {/* Protect certain routes based on admin status */}
          <Route element={<AdminRoute adminStatus={adminStatus} />}>
            <Route path="/userManage" element={<UserManage />} />
            <Route path="/gameEditor" element={<GameEditor />} />
          </Route>
        </Route>

        {/* Any undefined paths redirect to student sign in */}
        <Route path="*" element={<StudentAuth/>} />
      </Routes>
    </Router>
  );
};

export default App;
