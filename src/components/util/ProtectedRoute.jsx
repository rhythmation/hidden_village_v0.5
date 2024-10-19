import { onAuthStateChanged } from "firebase/auth";
import { Navigate, Outlet } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { firebaseInstance } from "../../services/Firebase/firebase";
import { useEffect, useState } from "react";



export default function ProtectedRoute() {
    const [isLoggedIn, setisLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true); 
    
    const auth = getAuth(firebaseInstance)
    
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
    return isLoggedIn ? <Outlet/> : <Navigate to="signIn"/>
}