import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signUp.css";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../../services/Firebase/firebase";
import { useAuth } from "../../../contexts/AuthContext"; 

export default function SignUp() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });
  const [tooManyRequests, setTooManyRequests] = useState(false);
  const [lastEmailSentTime, setLastEmailSentTime] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth(); // Use user from context

  useEffect(() => {
    let checkEmailVerified = null;

    if (emailVerificationSent && user) {
      // Set an interval to check email verification status
      checkEmailVerified = setInterval(() => {
        user.reload()
          .then(() => {
            if (user.emailVerified) {
              clearInterval(checkEmailVerified);
              setEmailVerificationSent(false);
              navigate("/");
            }
          })
          .catch((error) => console.error("Error reloading user:", error));
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (checkEmailVerified) {
        clearInterval(checkEmailVerified);
        console.log("Verification check interval cleared");
      }
    };
  }, [emailVerificationSent, user, navigate]);

  useEffect(() => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    };
    setPasswordValidations(requirements);
  }, [password]);

  useEffect(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setErrorMessage(email && !emailPattern.test(email) ? "Invalid email format" : "");
  }, [email]);

  function validate() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

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
    e.preventDefault();
    if (validate()) {
      setErrorMessage("");
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const newUser = userCredential.user;
          sendEmailVerification(newUser)
            .then(() => {
              setEmailVerificationSent(true);
              setLastEmailSentTime(Date.now());
            })
            .catch(handleEmailVerificationError);
        })
        .catch((error) => setErrorMessage("There was an issue creating your account. Try a different email."));
    }
  }

  function resendVerification() {
    const now = Date.now();
    if (lastEmailSentTime && now - lastEmailSentTime < 60000) {
      setErrorMessage("Please wait before requesting another verification email.");
      return;
    }

    if (user) {
      sendEmailVerification(user)
        .then(() => {
          setErrorMessage("");
          setEmailVerificationSent(true);
          setLastEmailSentTime(now);
        })
        .catch(handleEmailVerificationError);
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
    navigate("/AdminSignIn");
  }

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="show-pass">
          <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
          <p>Show Password</p>
        </div>

        {password !== "" && Object.values(passwordValidations).some((v) => !v) && (
          <div>
            <p>Password must include:</p>
            <ul>
              <li className={passwordValidations.minLength ? "valid" : "error"}>At least 8 characters</li>
              <li className={passwordValidations.hasUpperCase ? "valid" : "error"}>At least one uppercase letter</li>
              <li className={passwordValidations.hasLowerCase ? "valid" : "error"}>At least one lowercase letter</li>
              <li className={passwordValidations.hasNumber ? "valid" : "error"}>At least one number</li>
            </ul>
          </div>
        )}
        {errorMessage && <p className="error">{errorMessage}</p>}

        <div className="buttons">
          <button type="submit">Create Account</button>
          <button onClick={handleSignIn} type="button">Go to: Sign In</button>
        </div>
      </form>
      {emailVerificationSent && (
        <div>
          <p>{errorMessage || "Email verification sent! Click the link in the email to continue."}</p>
          {!tooManyRequests && <p className="resend" onClick={resendVerification}>Resend Verification</p>}
        </div>
      )}
    </div>
  );
}
