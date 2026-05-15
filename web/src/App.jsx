import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./features/auth/register";
import Login from "./features/auth/login";
import Dashboard from "./features/vaults/dashboard"; 
import Profile from "./features/profile/profile";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} /> 
      </Routes>
    </Router>
  );
}

export default App;