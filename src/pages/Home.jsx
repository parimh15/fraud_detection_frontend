import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  message,
  Progress,
  Tag
} from 'antd';
import {
  BarChartOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Home = () => {
  const { agent } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const agentId = agent?.agentId;

  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!agentId) {
        setError('No Agent ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:8080/agents/${agentId}/analysis`, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
          }
        });

        setAnalysisData(response.data);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Fetch error details:', err);
        const errorMessage = err.response
          ? `Server Error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`
          : 'Network error. Please check your connection.';

        setError(errorMessage);
        setIsLoading(false);
        message.error('Failed to load dashboard data');
      }
    };

    if (agentId) {
      fetchAnalysisData();
      const intervalId = setInterval(fetchAnalysisData, 30000);
      return () => clearInterval(intervalId);
    }
  }, [agentId]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        <Alert
          message="Dashboard Loading Error"
          description={error}
          type="error"
          showIcon
          closable
        />
      </div>
    );
  }

  const renderStatCard = (icon, title, data, acceptedKey, rejectedKey) => {
    const total = title === 'Aadhaar'
      ? data.totalAadhars
      : data.totalPans || 0;
    const accepted = data[acceptedKey] || 0;
    const rejected = data[rejectedKey] || 0;
    const acceptanceRate = total > 0 ? (accepted / total * 100).toFixed(1) : 0;

    return (
      <Card
        hoverable
        style={{
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #f0f5fc, #e6eaf0)',
          transition: 'transform 0.3s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.025)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {React.cloneElement(icon, {
              style: {
                fontSize: '32px',
                color: title === 'Aadhaar' ? '#1890ff' : '#52c41a',
                marginRight: '12px'
              }
            })}
            <Title level={4} style={{ margin: 0, color: '#333' }}>
              {title} Verification
            </Title>
          </div>
          <Progress
            type="circle"
            percent={acceptanceRate}
            width={80}
            status={acceptanceRate >= 90 ? 'success' : 'normal'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Total"
              value={total}
              valueStyle={{ color: '#333', fontWeight: 'bold' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Accepted"
              value={accepted}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Rejected"
              value={rejected}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              background: 'white'
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <DashboardOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#1890ff' }} />
                <Title level={3} style={{ margin: 0, color: '#333' }}>
                  Agent Performance Dashboard
                </Title>
                <Tag
                  color="processing"
                  style={{
                    marginLeft: '12px',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                >
                  Real-time Analytics
                </Tag>
              </div>
            }
            extra={
              <Text type="secondary">
                Last Updated: {new Date().toLocaleString()}
              </Text>
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card
                  type="inner"
                  title={
                    <>
                      <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      Talk Time Metrics
                    </>
                  }
                >
                  <Row>
                    <Col span={12}>
                      <Statistic
                        title="Avg Agent Talk Time"
                        value={analysisData?.averageAgentTalkTime?.toFixed(2) || 0}
                        suffix="s"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Avg Reference Talk Time"
                        value={analysisData?.averageReferenceTalkTime?.toFixed(2) || 0}
                        suffix="s"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  type="inner"
                  title={
                    <>
                      <BarChartOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      Reference Calls Overview
                    </>
                  }
                >
                  <Row>
                    <Col span={8}>
                      <Statistic
                        title="Total Calls"
                        value={analysisData?.totalReferenceCalls || 0}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Accepted"
                        value={analysisData?.acceptedReferenceCalls || 0}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Rejected"
                        value={analysisData?.rejectedReferenceCalls || 0}
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          {renderStatCard(
            <FileTextOutlined />,
            'Aadhaar',
            analysisData,
            'acceptedAadhars',
            'rejectedAadhars'
          )}
        </Col>

        <Col span={12}>
          {renderStatCard(
            <FileTextOutlined />,
            'PAN',
            analysisData,
            'acceptedPans',
            'rejectedPans'
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Home;