import React from 'react';
import { Layout, Typography } from 'antd';
import ProfileMenu from './ProfileMenu';
import logo from '../assets/logo.png';           // Fraud icon
import loans24Logo from '../assets/loans24.png'; // Loans24 icon

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
        {/* Fraud Icon */}
        <img 
          src={logo}    
          alt="Fraud Icon" 
          style={{ height: '32px', marginRight: '12px' }} 
        />

        {/* Title */}
        <Title level={4} style={{ margin: 0 }}>
          Fraud Analysis <span style={{ fontSize: '16px', color: '#555' }}>by</span>
        </Title>

        {/* Loans24 Icon */}
        <img 
          src={loans24Logo}    
          alt="Loans24 Icon" 
          style={{ height: '32px', marginLeft: '12px' }} 
        />
      </div>
      
      <ProfileMenu />
    </Header>
  );
};

export default Navbar;
