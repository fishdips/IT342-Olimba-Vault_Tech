import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

/* Reusable gear SVG — teeth count & inner-radius vary per call */
function Gear({ teeth = 8, r = 38, stroke = "#85bfe6", strokeWidth = 2 }) {
  const R = r;
  const ri = R * 0.72;
  const toothH = R * 0.22;

  let d = "";
  for (let i = 0; i < teeth; i++) {
    const ang = (i / teeth) * Math.PI * 2;
    const angNext = ((i + 1) / teeth) * Math.PI * 2;

    const a1 = ang + 0.12;
    const a2 = ang + Math.PI / teeth - 0.12;
    const a3 = ang + Math.PI / teeth + 0.12;
    const a4 = angNext - 0.12;

    const cos = (a) => Math.cos(a);
    const sin = (a) => Math.sin(a);

    if (i === 0) d += `M ${ri * cos(a1)} ${ri * sin(a1)} `;
    d += `L ${(R + toothH) * cos(a1)} ${(R + toothH) * sin(a1)} `;
    d += `L ${(R + toothH) * cos(a2)} ${(R + toothH) * sin(a2)} `;
    d += `L ${ri * cos(a3)} ${ri * sin(a3)} `;
    d += `L ${ri * cos(a4)} ${ri * sin(a4)} `;
  }
  d += "Z";

  const cx = R + toothH + 4;

  return (
    <svg
      viewBox={`${-cx} ${-cx} ${cx * 2} ${cx * 2}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={d} stroke={stroke} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" />
      <circle cx="0" cy="0" r={ri * 0.35} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
    </svg>
  );
}

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
      
      // Check if the response is successful
      if (response.ok) {
        // Navigate to the dashboard on success
        navigate("/dashboard");
      } else {
        // Show the error message if login fails
        alert(data);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error");
    }
  };

  return (
    <div className="login-page">

      {/* Floating gear background */}
      <div className="gear-layer">
        <Gear teeth={12} r={56} strokeWidth={2.5} />
        <Gear teeth={7}  r={26} strokeWidth={2}   />
        <Gear teeth={16} r={72} strokeWidth={2.5} />
        <Gear teeth={9}  r={36} strokeWidth={2}   />
        <Gear teeth={14} r={62} strokeWidth={2.5} />
        <Gear teeth={6}  r={24} strokeWidth={2}   />
        <Gear teeth={10} r={48} strokeWidth={2.5} />
        <Gear teeth={5}  r={20} strokeWidth={2}   />
        <Gear teeth={8}  r={40} strokeWidth={2}   />
        <Gear teeth={6}  r={18} strokeWidth={1.8} />
      </div>

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