import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./signIn.css"

function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordHidden, setpasswordHidden] = useState(true)
    const [mode, setMode] = useState('login')

    const handleSubmit = (e) => {
        e.preventDefault()

        if (mode === 'login') {
            console.log("Login: ", email, password)
        } else if (mode == 'create') {
            console.log("Create Account: ", email, password)
        }

    }

    const showPassword = () => {
        setpasswordHidden(!passwordHidden)
    }

    return (
        <div className="signin-container">
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type={passwordHidden ? "password" : "text"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <div className="showPass-div">
                        <label htmlFor="showPass"> Show Password:</label>
                        <input type="checkbox" name="showPass" onClick={showPassword}/>
                    </div>
                    
                </div>
                <div className="signin-buttons">
                    <button type="submit" onClick={() => setMode('login')}>Log In</button>
                    <button type="submit" onClick={() => setMode('create')}>Create Account</button>
                </div>
            </form>
            <p className="back-home">
                <Link to="/">Back to Home</Link>
            </p>
        </div>
    );
}

export default SignIn;