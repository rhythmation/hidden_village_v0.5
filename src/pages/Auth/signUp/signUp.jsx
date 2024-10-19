import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signUp.css";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../../services/Firebase/firebase";

export default function SignUp() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [user, setUser] = useState();
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });
  const [tooManyRequests, setTooManyRequests] = useState(false); // Track if user hit rate limit
  const [lastEmailSentTime, setLastEmailSentTime] = useState(null); // Track last email time

  const navigate = useNavigate();

  useEffect(() => {
    let checkEmailVerified = null;

    if (emailVerificationSent) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in
          checkEmailVerified = setInterval(() => {
            user
              .reload()
              .then(() => {
                if (user.emailVerified) {
                  clearInterval(checkEmailVerified); // Stop checking once verified
                  setVerified(true);
                  navigate("/");
                }
              })
              .catch((error) => {
                console.error("Error reloading user:", error);
              });
          }, 5000); // Check every 5 seconds
        } 
      });
    }

    return () => {
      if (checkEmailVerified) {
        clearInterval(checkEmailVerified);
        console.log("interval cleared");
      }
    };
  }, [emailVerificationSent]);

  useEffect(() => {
    // Dynamically check each password requirement
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    };

    setPasswordValidations(requirements);
  }, [password]);

  useEffect(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex pattern

    if (email != "" && !emailPattern.test(email)) {
      setErrorMessage("Invalid email format"); 
    } else {
      setErrorMessage("")
    }
  }, [email])

  function validate() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex pattern
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/; // Password pattern

    if (!emailPattern.test(email)) {
      setErrorMessage("Invalid email format");
      return false;
    } else if (!passwordPattern.test(password)) {
      setErrorMessage("Password does not meet requirements");
      return false;
    } else {
      setErrorMessage("");
      return true;
    }
  }

  function handleSubmit(e) {
    e.preventDefault(); // Prevent default form submission behavior
    if (validate()) {
      setErrorMessage("");
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          setUser(user);

          sendEmailVerification(user)
            .then(() => {
              setEmailVerificationSent(true);
              setLastEmailSentTime(Date.now()); // Track the time the email was sent
            })
            .catch((error) => {
              handleEmailVerificationError(error);
            });
        })
        .catch((error) => {
          const errorMessage = error.message;
          setErrorMessage("There was an issue creating your account. Try a different email.");
        });
    }
  }

  function resendVerification() {
    const now = Date.now();
    if (lastEmailSentTime && now - lastEmailSentTime < 60000) {
      setErrorMessage("Please wait before requesting another verification email.");
      return;
    } 

    if (user !== null) {
      sendEmailVerification(user)
        .then(() => {
          setErrorMessage("");
          setEmailVerificationSent(true);
          setLastEmailSentTime(now); // Update the last email sent time
        })
        .catch((error) => {
          handleEmailVerificationError(error);
        });
    }
  }

  function handleEmailVerificationError(error) {
    if (error.code === "auth/too-many-requests") {
      setTooManyRequests(true);
      setErrorMessage("Too many requests. Please wait a while before trying again.");
    } else {
      setErrorMessage("Error sending verification email. Please try again later.");
    }
    console.error("Error sending verification email:", error);
  }

  function handleSignIn() {
    navigate("/signIn");
  }

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Controlled input
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Controlled input
        />
        <div className="show-pass">
          <input
            type="checkbox"
            onChange={() => setShowPassword(!showPassword)} // Toggle password visibility
          />
          <p>Show Password</p>
        </div>

        {password !== "" &&
        Object.values(passwordValidations).some(
          (validation) => validation !== true
        ) ? (
          <div>
            <p>Password must include:</p>
            <ul>
              <li className={passwordValidations.minLength ? "valid" : "error"}>
                At least 8 characters {passwordValidations.minLength ? "✓" : "✗"}
              </li>
              <li className={passwordValidations.hasUpperCase ? "valid" : "error"}>
                At least one uppercase letter {passwordValidations.hasUpperCase ? "✓" : "✗"}
              </li>
              <li className={passwordValidations.hasLowerCase ? "valid" : "error"}>
                At least one lowercase letter {passwordValidations.hasLowerCase ? "✓" : "✗"}
              </li>
              <li className={passwordValidations.hasNumber ? "valid" : "error"}>
                At least one number {passwordValidations.hasNumber ? "✓" : "✗"}
              </li>
            </ul>
          </div>
        ) : null}
        {errorMessage && <p className="error">{errorMessage}</p>}

        <div className="buttons">
          <button type="submit">Create Account</button>
          <button onClick={handleSignIn} type="button">
            Go to: Sign In
          </button>
        </div>
      </form>
      {emailVerificationSent ? (
        <div>
          {errorMessage ? null : <p>Email verification sent! Click the link in the email to continue.</p> }
          {tooManyRequests ? (
            <p>Please wait before trying to resend the verification email.</p>
          ) : (
            <p className="resend" onClick={resendVerification}>
              Resend Verification
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
