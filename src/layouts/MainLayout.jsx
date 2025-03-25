import React, { useState } from 'react';
import { Layout, theme } from 'antd';
import { Outlet, useLocation } from 'react-router-dom'; // Import useLocation
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const { Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [leadName, setLeadName] = useState("Loading...");
    const [leadId, setLeadId] = useState(null);
    const { agent } = useAuth();
    const location = useLocation(); // Get the current location

    const handleLeadNameChange = (name) => {
        setLeadName(name);
        const parts = window.location.pathname.split('/');
        const id = parts[parts.length - 1];
        setLeadId(id);
    };

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Clear leadName and leadId when navigating away from the risk-assessment route
    React.useEffect(() => {
        if (!location.pathname.startsWith('/risk-assessment/')) {
            setLeadName(null); // Clear leadName
            setLeadId(null);   // Clear leadId
        }
    }, [location.pathname]);

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw' }}>
            <Navbar collapsed={collapsed} />

            {/* Sidebar + Content Wrapper */}
            <Layout style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                {/* Sidebar */}
                <Sidebar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    leadName={leadName}
                    leadId={leadId}
                    agentId={agent?.agentId}
                />

                {/* Content Area */}
                <Layout style={{ flex: 1, overflow: 'hidden' }}>
                    <Content
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            minHeight: 280,
                            overflow: 'auto'
                        }}
                    >
                        {/* Nested routes displayed here */}
                        <Outlet context={{ onLeadNameChange: handleLeadNameChange, agentId: agent?.agentId }}/>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MainLayout;