import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/register.jsx";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/dashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;