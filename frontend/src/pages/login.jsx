import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/login?email=${email}&password=${password}`,
        { method: "POST" }
      );
      const data = await response.text();
      alert(data);
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        
        <div className="login-header">
          <div className="logo-box"></div>
          <h1 className="login-title">Welcome Back</h1>
        </div>

        <p className="login-subtitle">Sign in to your digital vault</p>

        <form onSubmit={handleLogin} className="login-form">

          <div className="field-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn">Log In</button>
        </form>

        <p className="register-redirect">
          Don't have an account?{" "}
          <span className="register-link" onClick={() => navigate("/register")}>
            Register
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;