import React, { useState, useEffect } from 'react';
import { Avatar, Dropdown, Space, Typography, Menu } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const ProfileMenu = () => {
  const [username, setUsername] = useState('User');
  const navigate = useNavigate();

  useEffect(() => {
    // Get username from localStorage or your auth system
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUsername(userObj.username || 'User');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Redirect to login page
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
