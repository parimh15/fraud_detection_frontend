import React, { useState, useEffect } from 'react';
import { Avatar, Dropdown, Space, Typography, Menu } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const ProfileMenu = () => {
  const [username, setUsername] = useState('User');
  const navigate = useNavigate();

  //  Function to update username from localStorage
  const updateUsername = () => {
    const storedUser = localStorage.getItem("userName");
    if (storedUser) {
      try {
        const userObj = localStorage.getItem("userName");
        setUsername(userObj || 'User');  //  Set username
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  };

  useEffect(() => {
    updateUsername(); // Load username on mount

    // ✅ Listen for "user-updated" event from fetchUserData
    const handleUserUpdate = () => updateUsername();

    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, []);

  const handleLogout = () => {
    //  Clear all user-related data from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');

    //  Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("user-logged-out"));

    //  Redirect to login page
    navigate('/login', { replace: true }); // Prevents back navigation
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
