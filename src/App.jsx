import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import RiskAssessmentDashboard from "./pages/RiskAssessmentDashboard"; 
import DocumentDetails from "./pages/DocumentInsights";
import AudioDetails from "./pages/AudioInsights";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<RiskAssessmentDashboard />} />
      <Route path="/document/:id" element={<DocumentDetails />} />
      <Route path="/audio/:id" element={<AudioDetails />} />
    </Routes>
  );
}

export default App;