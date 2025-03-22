import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';

import OverallInsights from './pages/RiskAssessmentDashboard';
import DocumentInsight from './pages/DocumentInsights';     
// it is insight not insights
import AudioInsight from './pages/AudioInsights';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UploadPage from './pages/UploadPage';
import CustomInsightPage from './pages/CustomInsightPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes inside MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />  {/* Default Home */}
          <Route path="upload" element={<UploadPage />} />
          <Route path="insights" element={<OverallInsights />} />
          <Route path="documents/:userId/:documentType" element={<DocumentInsight />} />  
           {/* // fixed the route to fetch docType*/}
          <Route path="audio/:id" element={<AudioInsight />} />
          <Route path="custom-insight" element={<CustomInsightPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
   
  );
}

export default App;