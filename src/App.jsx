import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import RiskAssessmentDashboard from "./pages/RiskAssessmentDashboard"; 
import DocumentInsight from "./pages/DocumentInsights";
import AudioInsights from "./pages/AudioInsights";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<RiskAssessmentDashboard />} />
      <Route path="/document/:id" element={<DocumentInsight />} />
      <Route path="/audio/:id" element={<AudioInsights />} />
    </Routes>
  );
}

export default App;