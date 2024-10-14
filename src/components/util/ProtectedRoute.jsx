import { Navigate, Outlet } from "react-router-dom";




export default function ProtectedRoute({isLoggedIn}) {
    console.log(isLoggedIn)
    return isLoggedIn ? <Outlet/> : <Navigate to="signIn"/>
}