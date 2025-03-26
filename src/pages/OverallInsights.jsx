// OverallInsights.jsx
import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Button, Tag, Space, Layout, message } from 'antd';
import {
    ArrowRightOutlined,
    FileTextOutlined,
    IdcardOutlined,
    CreditCardOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom'; // Import useOutletContext

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

const OverallInsights = () => { // Remove onLeadNameChange from props definition
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leadName, setLeadName] = useState("Loading...");
    const navigate = useNavigate();
    const { leadId } = useParams();
    const API_BASE_URL = 'http://localhost:8080';
    const { onLeadNameChange } = useOutletContext(); // Access it from context

    useEffect(() => {
        const fetchLeadName = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/leads/${leadId}/name`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const name = await response.text(); // Assuming the API returns plain text name
                setLeadName(name);
                onLeadNameChange(name); // Update MainLayout's state
            } catch (error) {
                console.error('Error fetching lead name:', error);
                setLeadName("Error Loading");
            }
        };

        const fetchInsights = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/leads/${leadId}/insights`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Process the insights with additional UI-specific properties
                const processedInsights = data.map(item => {
                    const id = `${item.doctype}-${Math.random().toString(36).substr(2, 9)}`;  // Generate a unique ID
                    let riskLevel = 'pending'; // Calculate risk level based on score (if available)
                    if (item.status !== 'Pending' && item.score !== null) {
                        if (item.score < 5.0) riskLevel = 'low';
                        else riskLevel = 'medium';
                    }

                    return {
                        id,
                        ...item,
                        riskLevel
                    };
                });

                setInsights(processedInsights);

            } catch (error) {
                console.error('Error fetching/processing insights data:', error);
                message.error('Failed to load insights. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeadName();
        fetchInsights();

    }, [leadId, onLeadNameChange]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'green';
            case 'Uploaded': return 'green';
            default: return 'blue';
        }
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel) {
            case 'medium': return 'orange';  // Medium Risk
            case 'low': return 'green';
            case 'pending': return 'gray';
            default: return 'default';
        }
    };

    const getRiskLabel = (riskLevel) => {
        switch (riskLevel) {
            case 'medium': return 'Needs review';
            case 'low': return 'Low risk';
            case 'pending': return 'Not uploaded';
            default: return 'Unknown';
        }
    };

    const getDocumentIcon = (doctype) => {
        switch (doctype) {
            case 'Aadhaar': return <IdcardOutlined style={{ fontSize: '20px' }} />;
            case 'Pan': return <CreditCardOutlined style={{ fontSize: '20px' }} />;
            case 'Reference Call': return <PhoneOutlined style={{ fontSize: '20px' }} />;
            default: return <FileTextOutlined style={{ fontSize: '20px' }} />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            });
        } catch (error) {
            console.error('Invalid date:', dateString);
            return 'Invalid date';
        }
    };

    const handleViewDetails = (id, doctype, status) => {
        if (status === 'Pending') {
            navigate('/upload'); // Navigate to UploadPage
        } else {
            // Redirecting based on document type
            switch (doctype) {
                case 'Reference Call':
                    navigate(`/audio/${id}`);
                    break;
                case 'Aadhaar':
                    navigate(`/aadhaar-insights/${id}`);
                    break;

                case 'Pan':
                    navigate(`/pan-insights/${id}`);
                    break;
            }
        }
    };

    const renderInsightSummary = (insight) => {
        if (insight.status === 'Pending') {
            return insight.doctype === 'Reference Call'
                ? "Reference call has not been uploaded yet. Please upload to proceed with verification."
                : "This document has not been uploaded yet. Please upload to proceed with verification.";
        }

        if (insight.doctype === 'Reference Call') {
            return `Reference call verification completed with a score of ${insight.score}. ${insight.description}`;
        }

        return `Document verification completed with a score of ${insight.score}. ${insight.description}`;
    };

    const renderInsightCard = (insight) => {
        const borderColor = insight.status === 'Pending' ? '#d9d9d9' :
            insight.riskLevel === 'medium' ? '#faad14' :
                '#52c41a';

        return (
            <Card
                key={insight.id}
                className="insight-card"
                style={{
                    borderLeft: `4px solid ${borderColor}`,
                    marginBottom: '16px',
                    backgroundColor: insight.status === 'Pending' ? '#f9f9f9' : '#fff'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                        <Space>
                            {getDocumentIcon(insight.doctype)}
                            <Title level={5} style={{ margin: 0 }}>
                                {insight.documentName}
                            </Title>
                        </Space>

                        <Paragraph style={{ marginTop: '8px' }}>
                            {renderInsightSummary(insight)}
                        </Paragraph>

                        <Space style={{ marginTop: '8px' }}>
                            <Tag color={getStatusColor(insight.status)}>
                                {insight.status}
                            </Tag>
                            <Tag color={getRiskColor(insight.riskLevel)}>
                                {getRiskLabel(insight.riskLevel)}
                            </Tag>
                            {insight.score !== null && insight.status !== 'Pending' && (
                                <Tag color="blue">
                                    Score: {insight.score.toFixed(1)}
                                </Tag>
                            )}
                            <Text type="secondary">
                                {insight.uploadedAt ? `Uploaded: ${formatDate(insight.uploadedAt)}` : 'Not uploaded yet'}
                            </Text>
                        </Space>
                    </div>
                    <Button
                        type={insight.status === 'Pending' ? 'default' : 'primary'}
                        icon={<ArrowRightOutlined />}
                        onClick={() => handleViewDetails(insight.id, insight.doctype, insight.status)}
                        style={{ marginTop: '16px' }}
                    >
                        {insight.status === 'Pending' ? 'Upload Document' : 'View Detailed Insights'}
                    </Button>
                </div>
            </Card>
        );
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Header */}
            <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                    <Title level={3} style={{ margin: 0 }}>
                        Lead Assessment: <span style={{ color: '#1890ff' }}>{leadName}</span>
                    </Title>
                </div>
            </Header>

            {/* Main content */}
            <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* Loading state */}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <Spin size="large" />
                    </div>
                )}

                {/* Dashboard content */}
                {!loading && (
                    <>
                        <div style={{ marginBottom: '24px' }}>
                            <Title level={4}>Document Verification Status</Title>
                            <Text type="secondary">
                                Review verification status for all required documents and reference calls.
                            </Text>
                        </div>

                        {insights.length > 0 ? (
                            <div>
                                {insights.map(renderInsightCard)}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                <Text type="secondary">No document insights available for this lead.</Text>
                            </div>
                        )}
                    </>
                )}
            </Content>

            {/* Footer */}
            <Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                <Text type="secondary">© 2025 Risk Assessment Platform. All rights reserved.</Text>
            </Footer>
        </Layout>
    );
};

export default OverallInsights;