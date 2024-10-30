import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import "./studentAuth.css";
import { signInAnonymously } from "firebase/auth";
import { AuthProvider, useAuth } from "../../../contexts/AuthContext";

export default function StudentAuth() {
  const [teacherEmail, setTeacherEmail] = useState("")
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  let {user, auth} = useAuth()

  function handleSubmit(e) {
    e.preventDefault();
    
    signInAnonymously(auth)
    navigate("/")
    setErrorMessage("Invalid username or password");
  }
  return (
    <div className="auth-container">
      <h2> Student Login </h2>
      <form onSubmit={(e) => handleSubmit(e)} className="auth-form">
        <input placeholder="Teacher Email" type="email" onChange={(e) => setTeacherEmail(e.target.value)} ></input>
        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        ></input>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <div className="show-pass">
          <input
            onChange={() => setShowPassword(!showPassword)}
            type="checkbox"
          ></input>
          <p> Show Password</p>
        </div>
        {errorMessage ? (
          errorMessage ===
          "Email verification sent! Click link in email to continue" ? (
            <p className="green">{errorMessage}</p>
          ) : (
            <p className="error">{errorMessage}</p>
          )
        ) : null}

        <button type="submit"> Sign in</button>

        <button onClick={() => navigate("/AdminSignIn")}>
          Go to: Admin Login{" "}
        </button>
      </form>
    </div>
  );
}
