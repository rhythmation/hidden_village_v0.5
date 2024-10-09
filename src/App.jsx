import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from "./pages/Home/home.jsx"
import Game from './pages/game/Game.jsx';
import GameEditor from './pages/gameEditor/gameEditor.jsx';
import Settings from './pages/settings/settings.jsx';
import SignIn from './pages/SignIn/SignIn.jsx';
import UserManage from './pages/UserManage/UserManage.jsx';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/game" element={<Game/>} />
        <Route path="/gameEditor" element={<GameEditor/>}/>
        <Route path="/settings" element={<Settings/>}/> 
        <Route path='/signIn' element={<SignIn/>} />
        <Route path='/userManage' element={<UserManage/>}/>

      </Routes>
    </Router>
  );
};

export default App;
