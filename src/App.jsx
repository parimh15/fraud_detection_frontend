import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Upload from './pages/Upload';
import OverallInsights from './pages/RiskAssessmentDashboard';  
import DocumentInsight from './pages/DocumentInsights';
import AudioInsight from './pages/AudioInsights';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} /> 
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/upload" element={<UploadPage />}/>
        <Route path="*" element={<Navigate to="/login" />} />
        {/* Main layout with correct nested routing */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="upload" element={<Upload />} />
          <Route path="insights" element={<OverallInsights />} />
          <Route path="document/:id" element={<DocumentInsight />} />
          <Route path="audio/:id" element={<AudioInsight />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
