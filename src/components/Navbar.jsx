import React from 'react';
import { Layout, Typography } from 'antd';
import ProfileMenu from './ProfileMenu';
import logo from '../assets/logo.png'

const { Header } = Layout;
const { Title } = Typography;

const Navbar = ({ collapsed }) => {
  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)'
      }}
    >
      <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
      <img 
        src={logo}    // Use imported image variable here
        alt="Logo" 
        style={{ height: '32px', marginRight: '16px' }} 
      />
      <Title level={4} style={{ margin: 0 }}>
        Fraud Analysis
      </Title>
    </div>
      
      <ProfileMenu />
    </Header>
  );
};

export default Navbar;