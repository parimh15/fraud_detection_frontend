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
    SearchOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Content } = Layout;

const CustomInsightPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [selectedDocType, setSelectedDocType] = useState(null);
    const [documentTypes, setDocumentTypes] = useState([]); // State for document types from API
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserIdAndDocumentTypes = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch userId from local storage
                const storedUserId = localStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(storedUserId);
                } else {
                    setError('User ID not found. Please log in again.');
                }

                // Fetch document types from API
                const response = await axios.get('http://localhost:8080/documents/types');
                const apiDocumentTypes = Object.entries(response.data).map(([value, label]) => ({
                    value,
                    label,
                }));
                setDocumentTypes(apiDocumentTypes);
               // localStorage.getItem("documentType",apiDocumentTypes)
                console.log("Document Types from API:", apiDocumentTypes);

            } catch (error) {
                console.error('Error fetching user ID or document types:', error);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserIdAndDocumentTypes();
    }, []);

    // Prepare document options with icons and descriptions
    const prepareDocumentOptions = () => {
        return documentTypes.map(docType => {
            let iconComponent = <FileSearchOutlined />;
            switch (docType.value) {
                case 'AADHAR':
                    iconComponent = <IdcardOutlined />;
                    break;
                case 'PAN':
                    iconComponent = <CreditCardOutlined />;
                    break;
                case 'REFERENCE_CALL':
                    iconComponent = <PhoneOutlined />;
                    break;
                default:
                    iconComponent = <FileSearchOutlined />;
                    break;
            }

            let description = 'Document Verification Insight'; //Default description

            switch (docType.value) {
                case 'AADHAR':
                    description = 'Government-issued identification with biometric details';
                    break;
                case 'PAN':
                    description = 'Permanent Account Number for tax identification';
                    break;
                case 'REFERENCE_CALL':
                    description = 'Verification call with provided references';
                    break;

            }
            let color = '#1890ff'; //Default Color
            switch (docType.value) {
                case 'AADHAR':
                    color = '#1890ff';
                    break;
                case 'PAN':
                    color = '#52c41a';
                    break;
                case 'REFERENCE_CALL':
                    color = '#722ed1';
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

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        try {
            if (!userId) {
                setError('User ID not found. Please log in again.');
                return;
            }

             // Store the selected documentType in localStorage
            
             localStorage.setItem('documentType', values.documentType); //need to store doctype before navigating to next page
            
             // Build the URL based on the selected document type and userId.
            let insightURL = '';
            switch (values.documentType) {
                case 'REFERENCE_CALL':
                    insightURL = `/audio/${userId}`;
                    break;
                default:
                    insightURL = `/documents/${userId}/${values.documentType}`; //the url mentioned here was wrong values.doctype was missing
                    break;
            }

            message.loading({ content: 'Fetching insights...', key: 'fetchInsight' });
            navigate(insightURL);

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

    const docOptions = prepareDocumentOptions();
    console.log("Prepared Doc options:", docOptions);

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
                                    Select the document type to fetch specific insights for the current user.
                                    Each document provides different verification insights.
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
                                        disabled={!userId}
                                        icon={<SearchOutlined />}
                                        size="large"
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

                            {!userId && (
                                <Alert
                                    message="Authentication Required"
                                    description="Please log in to access custom insights."
                                    type="warning"
                                    showIcon
                                />
                            )}
                        </Space>)}
                </Card>
            </Content>
        </Layout>
    );
};

export default CustomInsightPage;

