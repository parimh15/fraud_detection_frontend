// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
        const storedAgentId = localStorage.getItem('agentId');
        const storedAgentName = localStorage.getItem('agentName');
        const storedAgentEmail = localStorage.getItem('agentEmail');

        if (storedAgentId && storedAgentName && storedAgentEmail) {
            setAgent({
                agentId: storedAgentId,
                agentName: storedAgentName,
                agentEmail: storedAgentEmail
            });
        }
        setLoading(false); // Set loading to false after checking local storage
    }, []);


    const login = (agentData) => {
        localStorage.setItem('agentId', agentData.agentId);
        localStorage.setItem('agentName', agentData.agentName);
        localStorage.setItem('agentEmail', agentData.agentEmail);
        setAgent(agentData);
    };

    const logout = () => {
        localStorage.removeItem('agentId');
        localStorage.removeItem('agentName');
        localStorage.removeItem('agentEmail');
        setAgent(null);
    };

    const value = {
        agent,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return React.useContext(AuthContext);
};