import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, List, Button } from 'antd';
import { 
  FileOutlined, 
  SoundOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,UploadOutlined,DashboardOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Home = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalAudio: 0,
    flaggedDocuments: 0,
    flaggedAudio: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch stats and recent activity from your API
    // This is a placeholder - replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // const response = await fetch('/api/dashboard');
        // const data = await response.json();
        
        // Placeholder data
        setStats({
          totalDocuments: 156,
          totalAudio: 87,
          flaggedDocuments: 23,
          flaggedAudio: 12
        });
        
        setRecentActivity([
          { id: 1, type: 'document', name: 'Aadhar_User123.pdf', status: 'flagged', timestamp: '2025-03-18T10:30:00' },
          { id: 2, type: 'audio', name: 'Call_User456.mp3', status: 'verified', timestamp: '2025-03-18T09:45:00' },
          { id: 3, type: 'document', name: 'PAN_User789.pdf', status: 'verified', timestamp: '2025-03-17T16:20:00' },
          { id: 4, type: 'audio', name: 'Call_User123.mp3', status: 'flagged', timestamp: '2025-03-17T14:15:00' },
          { id: 5, type: 'document', name: 'Aadhar_User456.pdf', status: 'verified', timestamp: '2025-03-17T11:30:00' },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const handleViewDetails = (item) => {
    if (item.type === 'document') {
      navigate(`/document/${item.id}`);
    } else {
      navigate(`/audio/${item.id}`);
    }
  };
  
  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Documents" 
              value={stats.totalDocuments} 
              prefix={<FileOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Audio Calls" 
              value={stats.totalAudio} 
              prefix={<SoundOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Flagged Documents" 
              value={stats.flaggedDocuments} 
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Flagged Audio Calls" 
              value={stats.flaggedAudio} 
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Recent Activity</Title>
        <List
          itemLayout="horizontal"
          dataSource={recentActivity}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => handleViewDetails(item)}>
                  View Details
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={item.type === 'document' ? <FileOutlined /> : <SoundOutlined />}
                title={item.name}
                description={
                  <>
                    <Text type={item.status === 'flagged' ? 'danger' : 'success'}>
                      {item.status === 'flagged' ? 
                        <ExclamationCircleOutlined style={{ marginRight: 8 }} /> : 
                        <CheckCircleOutlined style={{ marginRight: 8 }} />
                      }
                      {item.status === 'flagged' ? 'Potential fraud detected' : 'Verified'}
                    </Text>
                    <br />
                    <Text type="secondary">
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Title level={4}>Quick Actions</Title>
            <Button 
              type="primary" 
              icon={<UploadOutlined />} 
              onClick={() => navigate('/upload')}
              style={{ marginRight: 16 }}
            >
              Upload New Document
            </Button>
            <Button 
              icon={<DashboardOutlined />} 
              onClick={() => navigate('/insights')}
            >
              View Insights
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;