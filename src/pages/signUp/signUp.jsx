import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signUp.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/Firebase/firebase";

export default function SignUp() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  const Auth = auth;

  const navigate = useNavigate();

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

  function validate() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex pattern
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/; // Password pattern

    if (!emailPattern.test(email)) {
      setErrorMessage("Invalid email format");
      return false;
    } else if (!passwordPattern.test(password)) {
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
      // setEmail("")
      // setPassword("")
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log("Signed up");
          const user = userCredential.user;
          navigate("/");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;

          setErrorMessage("There was an issue creating your account, try a different email")
        });
    }
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

        {password != "" &&
        Object.values(passwordValidations).some(
          (validation) => validation !== true
        ) ? (
          <div>
            <p>Password must include:</p>
            <ul>
              <li className={passwordValidations.minLength ? "valid" : "error"}>
                At least 8 characters{" "}
                {passwordValidations.minLength ? "✓" : "✗"}
              </li>
              <li
                className={passwordValidations.hasUpperCase ? "valid" : "error"}
              >
                At least one uppercase letter{" "}
                {passwordValidations.hasUpperCase ? "✓" : "✗"}
              </li>
              <li
                className={passwordValidations.hasLowerCase ? "valid" : "error"}
              >
                At least one lowercase letter{" "}
                {passwordValidations.hasLowerCase ? "✓" : "✗"}
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
    </div>
  );
}
