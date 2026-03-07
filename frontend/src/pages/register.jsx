import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/register.css";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const userData = { firstName, lastName, username, email, password };
    try {
      const response = await fetch("http://localhost:8080/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.text();
      alert(data);
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Server error");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-header">
          <div className="logo-box"></div>
          <h1 className="register-title">Create Account</h1>
        </div>

        <p className="register-subtitle">Join Vault-Tech to secure your digital legacy</p>

        <form onSubmit={handleRegister} className="register-form">

          {/* First Name & Last Name side by side */}
          <div className="name-row">
            <div className="field-group">
              <label>First Name</label>
              <input
                type="text"
                required
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Last Name</label>
              <input
                type="text"
                required
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label>Username</label>
            <input
              type="text"
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

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

          <div className="field-group">
            <label>Confirm Password</label>
            <input
              type="password"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="register-btn">Create Account</button>
        </form>

        <p className="login-redirect">
          Already have an account?{" "}
          <span className="login-link" onClick={() => navigate("/")}>Log In</span>
        </p>

      </div>
    </div>
  );
}

export default Register;