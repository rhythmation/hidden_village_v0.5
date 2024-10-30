import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importing App where routing is set up
import "./index.css"
import "./Reset.css"
import { AuthProvider } from './contexts/AuthContext';


ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <App/>
    </AuthProvider>
);

