import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importing App where routing is set up
import "./index.css"
import "./Reset.css"
import { firebaseApp } from './services/Firebase/firebase';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

