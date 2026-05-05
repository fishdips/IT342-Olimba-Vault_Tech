import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/register.jsx";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Profile from "./pages/profile.jsx"; 

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