import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Import useNavigate
import "../css/login.css";

function Login() {
  const navigate = useNavigate(); // <-- Initialize navigate
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
    <div className="login-container">
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      <p>
        Don't have an account?{" "}
        <span className="link" onClick={() => navigate("/register")}>
          Create one
        </span>
      </p>
    </div>
  );
}

export default Login;