import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard</Title>
      <Paragraph>Welcome to the Fraud Analysis Dashboard by Loans24</Paragraph>
      <Card>
        <Title level={4}>Dashboard Content</Title>
        <Paragraph>Dashboard statistics and analytics will appear here.</Paragraph>
      </Card>
    </div>
  );
};

export default Home;