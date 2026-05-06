import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/register.css";

function Gear({ teeth = 8, r = 38, stroke = "#0a6aa8", strokeWidth = 2 }) {
  const R = r;
  const ri = R * 0.72;
  const toothH = R * 0.22;

  let d = "";
  for (let i = 0; i < teeth; i++) {
    const angNext = ((i + 1) / teeth) * Math.PI * 2;
    const a1 = (i / teeth) * Math.PI * 2 + 0.12;
    const a2 = (i / teeth) * Math.PI * 2 + Math.PI / teeth - 0.12;
    const a3 = (i / teeth) * Math.PI * 2 + Math.PI / teeth + 0.12;
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

      <div className="register-card">

        <div className="register-header">
          <div className="logo-box"></div>
          <h1 className="register-title">Create Account</h1>
        </div>

        <p className="register-subtitle">Join Vault-Tech to secure your digital legacy</p>

        <form onSubmit={handleRegister} className="register-form">

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
