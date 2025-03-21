import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UploadOutlined, 
  DashboardOutlined, 
  FileTextOutlined, 
  SoundOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleMenuClick = (key) => {
    navigate(key);
  };

  // Determine which menu item should be selected based on current path
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/upload') return ['upload'];
    if (path === '/insights') return ['insights'];
    if (path.includes('/document')) return ['document'];
    if (path.includes('/audio')) return ['audio'];
    return ['dashboard'];
  };

  // Conditionally add Document/Audio Insights only when on their respective pages
  const sidebarItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: 'Upload',
    },
    {
      key: 'insights',
      icon: <DashboardOutlined />,
      label: 'Overall Insights',
    },
  ];

  if (location.pathname.includes('/document')) {
    sidebarItems.push({
      key: 'document',
      icon: <FileTextOutlined />,
      label: 'Document Insights',
    });
  }

  if (location.pathname.includes('/audio')) {
    sidebarItems.push({
      key: 'audio',
      icon: <SoundOutlined />,
      label: 'Audio Insights',
    });
  }

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
        onClick={({ key }) => handleMenuClick(key)}
        items={sidebarItems}
      />
    </Sider>
  );
};

export default Sidebar;
