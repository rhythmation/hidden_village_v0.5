import { useNavigate } from "react-router-dom";
import "./signIn.css";
import { useState } from "react";
import { auth } from "../../../services/Firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function SignIn() {
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user.emailVerified) {
            navigate("/")
        } else {
          setErrorMessage("Not verified, check email for link")
        }
       
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setErrorMessage("Invalid email or password")
      });
  }

  function handleCreate() {
    navigate("/signUp");
  }

  return (
    <div className="auth-container">
      <h2> Sign in</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input placeholder="example@email.com" onChange={(e) => setEmail(e.target.value)}></input>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="password"
          onChange={(e) => setPassword(e.target.value) }
        ></input>
        <div className="show-pass">
          <input
            onChange={() => setShowPassword(!showPassword)}
            type="checkbox"
          ></input>
          <p> Show Password</p>
        </div>
        {errorMessage ? <p className="error"> {errorMessage} </p> : null}
        <div className="buttons">
          <button type="submit"> Sign in</button>
          <button onClick={handleCreate} type="button">
            Go to:Create Account
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignIn;
