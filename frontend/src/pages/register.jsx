import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../css/register.css";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate(); // hook for navigation

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const userData = { firstName, lastName, email, password };

    try {
      const response = await fetch("http://localhost:8080/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const data = await response.text();
      alert(data);

      // redirect to login after registration
      navigate("/"); 
      
    } catch (error) {
      console.error("Registration error:", error);
      alert("Server error");
    }
  };

  return (
    <div className="register-container">
      <h1>Create Account</h1>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="First Name" required onChange={(e) => setFirstName(e.target.value)} />
        <input type="text" placeholder="Last Name" required onChange={(e) => setLastName(e.target.value)} />
        <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" required onChange={(e) => setConfirmPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;