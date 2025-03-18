import { Routes, Route } from "react-router-dom";
import AudioInsights from "./pages/AudioInsights";

function App() {
  return (
    <Routes>
      {/*  <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/overallinsights" element={<Insights />} />
      <Route path="/document/:id" element={<DocumentInsights />} /> */}
      <Route path="/audio/:id" element={<AudioInsights />} />
    </Routes>
  );
}

export default App;
