import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Home from "./pages/Home";
// import Insights from "./pages/OverallInsights";
import DocumentDetails from "./pages/DocumentInsights";
// import AudioDetails from "./pages/AudioInsights";

function App() {
  return (
    <Router>
      <Routes>
        {/* Remove missing pages for now */}
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/signup" element={<Signup />} /> */}
        {/* <Route path="/overallinsights" element={<Insights />} /> */}
        <Route path="/document/:id" element={<DocumentDetails />} />
        {/* <Route path="/audio/:id" element={<AudioDetails />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
