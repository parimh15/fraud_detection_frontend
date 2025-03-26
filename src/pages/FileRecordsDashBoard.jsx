

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Tag, 
  Empty, 
  Spin, 
  Alert,
  Row,
  Col,
  Drawer 
} from 'antd';
import { 
  FileOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

const FileRecordItem = ({ record }) => {
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'orange';
      case 'processed': return 'green';
      case 'accept': return 'blue';
      default: return 'default';
    }
  };

  return (
    <Card 
      hoverable 
      style={{ 
        borderLeft: '4px solid', 
        borderLeftColor: getStatusColor(record.status),
        marginBottom: '16px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 10
      }}
    >
      <Row align="middle" justify="space-between">
        <Col xs={24} sm={8}>
          <div className="flex items-center">
            <FileOutlined className="mr-2 text-gray-500" />
            <Text strong>{record.fileType}</Text>
          </div>
        </Col>

        <Col xs={24} sm={8} className="text-center">
          <Tag color={getStatusColor(record.status)}>
            {record.status.toUpperCase()}
          </Tag>
        </Col>

        <Col xs={24} sm={8} className="text-right">
          <div className="flex items-center justify-end">
            <ClockCircleOutlined className="mr-2 text-gray-500" />
            <Text type="secondary">
              {new Date(record.uploadedAt).toLocaleString()}
            </Text>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

const FileRecordsDashboard = () => {
  const [fileRecords, setFileRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(true);

  const navigate = useNavigate();
  const { agent } = useAuth();
  const agentId = agent?.agentId;

  const API_BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    const fetchFileRecords = async () => {
      if (!agentId) return;

      setLoading(true);
      setError(null);

      try {
        const leadsResponse = await fetch(`${API_BASE_URL}/leads/agent/${agentId}/name-email`);
        if (!leadsResponse.ok) {
          throw new Error(`Failed to fetch leads: ${leadsResponse.status}`);
        }
        const leads = await leadsResponse.json();

        if (leads.length === 0) {
          setFileRecords([]);
          return;
        }

        const leadId = leads[0].id;

        const filesResponse = await fetch(`${API_BASE_URL}/files/${agentId}/${leadId}`);
        if (!filesResponse.ok) {
          throw new Error(`Failed to fetch file records: ${filesResponse.status}`);
        }
        const records = await filesResponse.json();

        setFileRecords(records);
      } catch (err) {
        console.error('Error fetching file records:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFileRecords();
  }, [agentId]);

  const handleClose = () => {
    setVisible(false);
    navigate('/upload');
  };

  const BackgroundIcon = () => (
    <div 
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.05,
        zIndex: 1
      }}
    >
      <svg 
        width="200" 
        height="200" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="0.5" 
        color="gray"
      >
        <path 
          d="M22 12h-4l-3 9L9 3l-3 9H2" 
          fill="none" 
          stroke="currentColor" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  return (
    <Drawer
      title="File Records"
      placement="right"
      onClose={handleClose}
      visible={visible}
      width={800}
      bodyStyle={{ 
        position: 'relative',
        height: '100%',
        overflow: 'auto'
      }}
    >
      <div style={{ position: 'relative', height: '100%' }}>
        <BackgroundIcon />
        <div style={{ position: 'relative', zIndex: 10 }}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spin size="large" tip="Loading file records..." />
            </div>
          ) : error ? (
            <Alert 
              message="Error" 
              description={error} 
              type="error" 
              showIcon 
            />
          ) : fileRecords.length === 0 ? (
            <Empty description="No File Records Found" />
          ) : (
            <div className="space-y-4">
              {fileRecords.map(record => (
                <FileRecordItem key={record.fileId} record={record} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
 
export default FileRecordsDashboard;
