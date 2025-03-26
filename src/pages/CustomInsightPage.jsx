import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Form,
    Select,
    Button,
    message,
    Spin,
    Alert,
    Space,
    Divider,
    Layout
} from 'antd';
import {
    FileSearchOutlined,
    IdcardOutlined,
    CreditCardOutlined,
    PhoneOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useNavigate, useOutletContext } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Content } = Layout;

const CustomInsightPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDocType, setSelectedDocType] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const [leadOptions, setLeadOptions] = useState([]); // State to hold lead options
    const navigate = useNavigate();
    const { agentId } = useOutletContext();  // Get agentId from context
    const API_BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        const fetchLeadOptions = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/leads/agent/${agentId}/name-email`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLeadOptions(data);
            } catch (error) {
                console.error('Error fetching lead options:', error);
                setError('Failed to load lead options. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeadOptions();
    }, [agentId]);  // Dependency on agentId

    // Hardcoded document types (will be replaced with API data later)
    const documentTypes = [
        { value: 'AADHAR', label: 'Aadhar Card' },
        { value: 'PAN', label: 'PAN Card' },
        { value: 'REFERENCE_CALL', label: 'Reference Call' },
    ];

    // Prepare document options with icons and descriptions
    const prepareDocumentOptions = () => {
        return documentTypes.map(docType => {
            let iconComponent = <FileSearchOutlined />;
            let description = 'Document Verification Insight'; // Default description
            let color = '#1890ff'; // Default Color

            switch (docType.value) {
                case 'AADHAR':
                    iconComponent = <IdcardOutlined />;
                    description = 'Government-issued identification with biometric details';
                    color = '#1890ff';
                    break;
                case 'PAN':
                    iconComponent = <CreditCardOutlined />;
                    description = 'Permanent Account Number for tax identification';
                    color = '#52c41a';
                    break;
                case 'REFERENCE_CALL':
                    iconComponent = <PhoneOutlined />;
                    description = 'Verification call with provided references';
                    color = '#722ed1';
                    break;
                default:
                    break;
            }

            return {
                value: docType.value,
                label: docType.label,
                icon: iconComponent,
                color: color,
                description: description,
            };
        });
    };

    const handleDocTypeChange = (value) => {
        setSelectedDocType(value);
    };

    const handleLeadChange = (value) => {
        setSelectedLead(value);
    };

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        try {
            // Build the URL based on the selected document type and lead ID.
            let insightURL = '';
            switch (values.documentType) {
                case 'REFERENCE_CALL':{
                    const response = await fetch(`${API_BASE_URL}/audio/recentaudio/${values.leadId}`);
                    const latestAudioId = await response.text();
                    insightURL = `/audio/${latestAudioId}`; // Relative path for same SPA
                    break;
                }
                
                default:{
                    const response1 = await fetch(`${API_BASE_URL}/documents/recentdocument/${values.leadId}`);
                    const latestDocId = await response1.text();
                    insightURL = `/document/${latestDocId}`; // Relative path for same SPA
                    break;
                }
            }

            message.loading({ content: 'Fetching insights...', key: 'fetchInsight' });
            navigate(insightURL); // Correct way to navigate

        } catch (error) {
            console.error("Error fetching custom insight:", error);
            setError("Failed to fetch insight. Please try again.");
            message.error({ content: 'Failed to fetch insights', key: 'fetchInsight' });
        } finally {
            setLoading(false);
        }
    };

    const getSelectedDocInfo = () => {
        const docOptions = prepareDocumentOptions();
        return docOptions.find(doc => doc.value === selectedDocType);
    };

    const getSelectedLeadInfo = () => {
        return leadOptions.find(lead => lead.id === selectedLead);
    };

    const docOptions = prepareDocumentOptions();

    return (
        <Layout style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px' }}>
            <Content style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Card
                    bordered={false}
                    style={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin size="large" tip="Loading..." />
                        </div>
                    ) : (
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div>
                                <Title level={3} style={{ marginBottom: '8px' }}>
                                    <FileSearchOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
                                    Custom Insight Search
                                </Title>
                                <Paragraph type="secondary">
                                    Select a lead and document type to fetch specific verification insights.
                                </Paragraph>
                            </div>

                            <Divider style={{ margin: '8px 0' }} />

                            {error && (
                                <Alert
                                    message="Error"
                                    description={error}
                                    type="error"
                                    showIcon
                                    style={{ marginBottom: '16px' }}
                                />
                            )}

                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                            >
                                {/* Lead Selection */}
                                <Form.Item
                                    name="leadId"
                                    label={<Text strong>Select Lead</Text>}
                                    rules={[{ required: true, message: 'Please select a lead' }]}
                                >
                                    <Select
                                        placeholder="Select a lead"
                                        size="large"
                                        onChange={handleLeadChange}
                                        style={{ width: '100%' }}
                                        dropdownStyle={{ padding: '8px' }}
                                    >
                                        {leadOptions.map(lead => (
                                            <Option key={lead.id} value={lead.id}>
                                                <Space>
                                                    <UserOutlined style={{ color: '#1890ff' }} />
                                                    {lead.name} - {lead.email}
                                                </Space>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                {selectedLead && (
                                    <Card
                                        size="small"
                                        style={{
                                            marginBottom: '24px',
                                            backgroundColor: '#f9fafc',
                                            borderLeft: '3px solid #1890ff'
                                        }}
                                    >
                                        <Space align="start">
                                            <div style={{
                                                color: 'white',
                                                backgroundColor: '#1890ff',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px'
                                            }}>
                                                <UserOutlined />
                                            </div>
                                            <div>
                                                <Text strong>{getSelectedLeadInfo()?.name}</Text>
                                                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                                    Email: {getSelectedLeadInfo()?.email}
                                                </Paragraph>
                                            </div>
                                        </Space>
                                    </Card>
                                )}

                                {/* Document Type Selection */}
                                <Form.Item
                                    name="documentType"
                                    label={<Text strong>Select Document Type</Text>}
                                    rules={[{ required: true, message: 'Please select a document type' }]}
                                >
                                    <Select
                                        placeholder="Select a document type"
                                        size="large"
                                        onChange={handleDocTypeChange}
                                        style={{ width: '100%' }}
                                        dropdownStyle={{ padding: '8px' }}
                                    >
                                        {docOptions.map(doc => (
                                            <Option key={doc.value} value={doc.value}>
                                                <Space>
                                                    <div style={{ color: doc.color }}>
                                                        {doc.icon}
                                                    </div>
                                                    {doc.label}
                                                </Space>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                {selectedDocType && (
                                    <Card
                                        size="small"
                                        style={{
                                            marginBottom: '24px',
                                            backgroundColor: '#f9fafc',
                                            borderLeft: `3px solid ${getSelectedDocInfo()?.color || '#1890ff'}`
                                        }}
                                    >
                                        <Space align="start">
                                            <div style={{
                                                color: 'white',
                                                backgroundColor: getSelectedDocInfo()?.color || '#1890ff',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px'
                                            }}>
                                                {getSelectedDocInfo()?.icon}
                                            </div>
                                            <div>
                                                <Text strong>{getSelectedDocInfo()?.label}</Text>
                                                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                                    {getSelectedDocInfo()?.description}
                                                </Paragraph>
                                            </div>
                                        </Space>
                                    </Card>
                                )}

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        icon={<SearchOutlined />}
                                        size="large"
                                        disabled={!selectedLead || !selectedDocType}
                                        style={{
                                            width: '100%',
                                            height: '45px',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        Fetch Insight
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Space>
                    )}
                </Card>
            </Content>
        </Layout>
    );
};

export default CustomInsightPage;
