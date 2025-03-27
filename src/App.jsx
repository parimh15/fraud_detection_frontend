// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import LeadsPage from './pages/LeadsPage';
import OverallInsights from './pages/OverallInsights';
import PanInsights from './pages/PanInsights'; 
import AadhaarInsights from './pages/AadhaarInsights'; 
import AudioInsight from './pages/AudioInsights';
import UploadPage from './pages/UploadPage';
import CustomInsightPage from './pages/CustomInsightPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import FileRecordsDashboard from './pages/FileRecordsDashBoard';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

function AppRoutes() {
    const { agent, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a spinner
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={agent ? <Navigate to="/" /> : <LoginPage />}
            />
            <Route
                path="/signup"
                element={agent ? <Navigate to="/" /> : <SignupPage />}
            />

            {/* Protected Routes inside MainLayout */}
            <Route
                path="/"
                element={agent ? <MainLayout /> : <Navigate to="/login" />}
            >
                <Route index element={<Home />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="/document-trail" element={<FileRecordsDashboard />} />
                <Route path="custom-insight" element={<CustomInsightPage />} />
                <Route path="risk-assessment/:leadId" element={<OverallInsights />} />

                {/* Remove or comment out the original DocumentInsight route */}
                {/* <Route path="documents/:id" element={<DocumentInsight />} /> */}

                {/* Add routes for PanInsights and AadhaarInsights with documentId parameter */}
                <Route path="pan-insights/:documentId" element={<PanInsights />} />
                <Route path="aadhaar-insights/:documentId" element={<AadhaarInsights />} />

                <Route path="audio/:id" element={<AudioInsight />} />
            </Route>

            {/* Redirect any unknown routes to home (if logged in) or login (if logged out) */}
            <Route path="*" element={agent ? <Navigate to="/" /> : <Navigate to="/login" />} />
        </Routes>
    );
}

export default App;