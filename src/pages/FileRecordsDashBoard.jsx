import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Tag, Empty, Spin, Alert, Row, Col, Button, Drawer, Select
} from 'antd';
import { FileOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const { Text } = Typography;
const { Option } = Select;
const FileRecordItem = ({ record }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'orange';
      case 'processed': return 'green';
      case 'accept': return 'blue';
      default: return 'default';
    }
  };
  return (
    <Card
      hoverable
      style={{ borderLeft: '4px solid', borderLeftColor: getStatusColor(record.status), marginBottom: '16px' }}
    >
      <Row align="middle" justify="space-between">
        <Col xs={24} sm={8}>
          <FileOutlined style={{ marginRight: 8, color: 'gray' }} />
          <Text strong>{record.fileType}</Text>
        </Col>
        <Col xs={24} sm={8} className="text-center">
          <Tag color={getStatusColor(record.status)}>{record.status.toUpperCase()}</Tag>
        </Col>
        <Col xs={24} sm={8} className="text-right">
          <Text type="secondary">{new Date(record.uploadedAt).toLocaleString()}</Text>
        </Col>
      </Row>
    </Card>
  );
};
const FileRecordsDashboard = () => {
  const [fileRecords, setFileRecords] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
  const { agent } = useAuth();
  const agentId = agent?.agentId;
  const API_BASE_URL = 'http://localhost:8080';
  useEffect(() => {
    const fetchLeads = async () => {
      if (!agentId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/leads/agent/${agentId}/name-email`);
        if (!response.ok) throw new Error(`Failed to fetch leads: ${response.status}`);
        const leadsData = await response.json();
        setLeads(leadsData);
        // Auto-select the first lead (optional)
        if (leadsData.length > 0) {
          setSelectedLeadId(leadsData[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [agentId]);
  useEffect(() => {
    const fetchFileRecords = async () => {
      if (!selectedLeadId || !agentId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/files/${agentId}/${selectedLeadId}`);
        if (!response.ok) throw new Error(`Failed to fetch file records: ${response.status}`);
        const records = await response.json();
        setFileRecords(records);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFileRecords();
  }, [selectedLeadId, agentId]);
  const handleLeadChange = (leadId) => {
    setSelectedLeadId(leadId);
  };
  const handleClose = () => {
    setVisible(false);
    navigate('/upload');
  };
  return (
    <Drawer
      title="File Records"
      placement="right"
      onClose={handleClose}
      visible={visible}
      width={800}
      maskClosable={false}
    >
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: '100%' }}
          placeholder="Select a Lead"
          onChange={handleLeadChange}
          value={selectedLeadId}
        >
          {leads.map(lead => (
            <Option key={lead.id} value={lead.id}>
              {lead.name} ({lead.email})
            </Option>
          ))}
        </Select>
      </div>
      {loading ? (
        <Spin size="large" tip="Loading file records..." />
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : fileRecords.length === 0 ? (
        <Empty description="No File Records Found" />
      ) : (
        fileRecords.map(record => <FileRecordItem key={record.fileId} record={record} />)
      )}
    </Drawer>
  );
};
export default FileRecordsDashboard;