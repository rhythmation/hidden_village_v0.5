import { useNavigate } from "react-router-dom";
import "./signIn.css";
import { useState } from "react";
import { auth } from "../../../services/Firebase/firebase";
import { signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail} from "firebase/auth";

function SignIn() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notVerified, setNotVerified] = useState();
  const [resetMessage, setResetMessage] = useState("");

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user.emailVerified) {
          navigate("/");
        } else {
          setErrorMessage("Not verified, check email for link");
          setNotVerified(true);
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setErrorMessage("Invalid email or password");
      });
  }

  function handleCreate() {
    navigate("/AdminSignUp");
  }

  function handleResend() {
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      const user = userCredential.user;
      if (user.emailVerified) {
        navigate("/");
      } else {
        sendEmailVerification(user)
          .then(() => {
            setErrorMessage(
              "Email verification sent! Click link in email to continue"
            );
          })
          .catch((error) => {
            if (error.code == "auth/too-many-requests") {
              setErrorMessage("Wait before sending a verification email again");
            }
          })
      }
    });
  }

  function handleResetPassword() {
    if (!email) {
      setResetMessage("Please enter your email address");
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setResetMessage("Password reset email sent. Check your inbox.");
        setErrorMessage("");
      })
      .catch((error) => {
        setResetMessage("");
        setErrorMessage("Failed to send reset email. Please try again.");
      });
  }


  return (
    <div className="auth-container">
      <h2> Sign in</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          placeholder="example@email.com"
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="password"
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

        {notVerified ? (
          <p onClick={handleResend} className="resend">
            {" "}
            Resend Link
          </p>
        ) : null}
        <div className="buttons">
          <button type="submit"> Sign in</button>
          <button onClick={handleCreate} type="button">
            Go to:Create Account
          </button>
        </div>
        <button type="button" onClick={handleResetPassword} className="reset-button">
          Forgot Password?
        </button>
      <button className="student-login" onClick={() => navigate("/signIn")}> Go to: Student Login</button>
        {resetMessage && <p className="reset-message">{resetMessage}</p>}
      </form>
    </div>
  );
}

export default SignIn;
