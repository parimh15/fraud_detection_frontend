import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    DashboardOutlined,
    UserOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed, leadName, leadId }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuItems, setMenuItems] = useState([
        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: 'leads', icon: <UserOutlined />, label: 'Leads' },
        { key: 'upload', icon: <UploadOutlined />, label: 'Upload' },
        { key: 'custom-insight', icon: <SearchOutlined />, label: 'Custom Search' },
    ]);

    const handleMenuClick = useCallback(({ key }) => {
        navigate(key);
    }, [navigate]);

    useEffect(() => {
        if (leadName && leadId) {
            const newMenuItemKey = `risk-assessment/${leadId}`;
            const newMenuItem = {
                key: newMenuItemKey,
                label: `Insights: ${leadName}`,
                icon: <SearchOutlined />,
            };

            const itemExists = menuItems.some(item => item.key === newMenuItemKey);

            if (!itemExists) {
                setMenuItems(prevItems => [...prevItems, newMenuItem]);
            }
        } else {
            // Remove the dynamic menu item when leadName or leadId is null/undefined
            setMenuItems(prevItems => prevItems.filter(item => !item.key.startsWith('risk-assessment/')));
        }
    }, [leadName, leadId]);

    const getSelectedKey = useCallback(() => {
        const path = location.pathname;
        if (path === '/upload') return ['upload'];
        if (path === '/leads') return ['leads'];
        if (path === '/custom-insight') return ['custom-insight'];
        if (path.includes('/document')) return ['document'];
        if (path.includes('/audio')) return ['audio'];
        if (path.startsWith('/risk-assessment/')) return [location.pathname]; //Highlight the current active tab
        return ['dashboard'];
    }, [location.pathname]);

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'sticky',
                left: 0,
                top: 64,
                bottom: 0,
            }}
        >
            <div className="logo" />
            <div
                style={{
                    height: 32,
                    margin: 16,
                    color: '#fff',
                    textAlign: 'center',
                    cursor: 'pointer',
                }}
                onClick={() => setCollapsed(!collapsed)}
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>

            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={getSelectedKey()}
                onClick={handleMenuClick}
                items={menuItems}
            />
        </Sider>
    );
};

export default Sidebar;