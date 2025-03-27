import React, { useState, useEffect } from 'react';
import { Avatar, Dropdown, Space, Typography, Menu } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

const ProfileMenu = () => {
    const [username, setUsername] = useState('User');
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const storedAgentName = localStorage.getItem('agentName');
        if (storedAgentName) {
            setUsername(storedAgentName);
        }
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout
        }
    ];

    return (
        <Dropdown
            overlay={<Menu items={menuItems} />}
            placement="bottomRight"
            arrow
            trigger={['click']}
        >
            <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <Text strong>{username}</Text>
            </Space>
        </Dropdown>
    );
};

export default ProfileMenu;