import React from 'react';
import { Layout, Typography } from 'antd';
import ProfileMenu from './ProfileMenu';
import logo from '../assets/logo.png';           // Fraud icon
import loans24Logo from '../assets/loans24.png'; // Loans24 icon
import styled from 'styled-components';

const { Header } = Layout;
const { Title } = Typography;

const StyledHeader = styled(Header)`
    position: sticky;
    top: 0;
    z-index: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    @media (max-width: 768px) {
        flex-direction: column; /* Stack logo and profile on smaller screens */
        align-items: flex-start; /* Align logo to the left */
        padding: 12px;
    }
`;

const StyledLogoDiv = styled.div`
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
        margin-bottom: 12px; /* Add space below logo on smaller screens */
    }
`;

const Navbar = () => {
    return (
        <StyledHeader>
            <StyledLogoDiv className="logo">
                {/* Fraud Icon */}
                <img
                    src={logo}
                    alt="Fraud Analysis System Logo"
                    style={{ height: '32px', marginRight: '12px' }}
                />

                {/* Title */}
                <Title level={4} style={{ margin: 0 }}>
                    Fraud Analysis <span style={{ fontSize: '16px', color: '#555' }}>by</span>
                </Title>

                {/* Loans24 Icon */}
                <img
                    src={loans24Logo}
                    alt="Loans24 Company Logo"
                    style={{ height: '32px', marginLeft: '12px' }}
                />
            </StyledLogoDiv>

            <ProfileMenu />
        </StyledHeader>
    );
};

export default Navbar;