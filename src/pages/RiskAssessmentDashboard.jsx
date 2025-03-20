import React, { useState, useEffect } from 'react';
import { Card, Typography, Avatar, Spin, Button, Tag, Space, Tabs, Layout, message } from 'antd';
import { DownloadOutlined, UserOutlined, FileTextOutlined, AudioOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;

const OverallInsights = () => {
    const [documentInsights, setDocumentInsights] = useState([]);
    const [audioInsights, setAudioInsights] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    //const userId = '704c10fe-f318-407e-9aad-57fab900dc9a';
    const userId = 'a7e52987-2667-44ff-bd0f-5d69eba0acbe';
    const generateInsightSummary = (insight, type) => {
        if (type === 'document') {
            let summary = "";
            try {
                const ocrData = JSON.parse(insight.ocrResults.output);
                const extractedName = ocrData.structured_data.name || 'N/A';

                const validationData = JSON.parse(insight.validationResults.output);
                const validationScore = validationData.overall_validation_score.toFixed(1);
                const validationStatus = validationData.status;

                const qualityData = JSON.parse(insight.qualityResults.output);
                const qualityScore = (qualityData.finalQualityScore * 100).toFixed(0);
                const qualityDecision = qualityData.decision;

                const forgeryData = JSON.parse(insight.forgeryResults.output);
                const forgeryRisk = (forgeryData.forgeryAnalysis.overallForgeryAssessment.finalForgeryRiskScore * 100).toFixed(0);
                const forgeryDecision = forgeryData.forgeryAnalysis.overallForgeryAssessment.decision;


                summary = `Document analysis shows extracted name as ${extractedName}.  Data validation scored ${validationScore}% and the status is ${validationStatus}. Image quality is ${qualityScore}% and considered ${qualityDecision}.  Forgery risk is ${forgeryRisk}% (${forgeryDecision}).`;
            } catch (e) {
                summary = "Error generating document summary. Some information may be missing.";
            }

            return summary;

        } else if (type === 'audio') {
            let summary = "";
            try {
                const llmData = JSON.parse(insight.llmExtraction.output);
                const overallScore = llmData.scoring_results.overall_score.toFixed(1);
                const refName = llmData.extracted_result.reference_name || 'N/A';
                const subjectName = llmData.extracted_result.subject_name || 'N/A';

                const audioData = JSON.parse(insight.audioAnalysis.output);
                const snrGrade = audioData.snr_grade || 'N/A';
                const overallQuality = audioData.overall_quality || 'N/A';

                summary = `Audio analysis: Overall score is ${overallScore}. Reference name is ${refName}, and subject name is ${subjectName}. Audio signal quality is ${snrGrade} and overall audio quality is ${overallQuality}.`;
            } catch (e) {
                summary = "Error generating audio summary. Some information may be missing.";
            }

            return summary;
        } else {
            return "Unsupported insight type";
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                // Fetch data from the API
                const userApiUrl = `http://localhost:8080/users/${userId}`;

                const userResponse = await fetch(userApiUrl, {
                    signal: AbortSignal.timeout(5000)
                });

                if (!userResponse.ok) {
                    throw new Error(`Failed to fetch user data: ${userResponse.status}`);
                }

                const userData = await userResponse.json();

                if (!userData) {
                    throw new Error("Empty or invalid user data received");
                }

                console.log("API data received:", userData);

                // Set user data
                setUser({
                    id: userData.id,
                    name: userData.name,
                    phone: userData.phone,
                    email: userData.email || `${userData.name.toLowerCase()}@example.com` // Fallback email
                });

                // Process document insights
                if (userData.documents && Array.isArray(userData.documents)) {
                    const processedDocuments = userData.documents.map(doc => {
                        // Generate the summary
                        const documentSummary = generateInsightSummary(doc, 'document');

                        return {
                            id: doc.id || `doc-${Math.random().toString(36).substr(2, 9)}`,
                            type: "document",
                            title: doc.fileName || "Untitled Document",
                            summary: documentSummary, // Use the generated summary
                            riskLevel: doc.riskLevel ? doc.riskLevel.toLowerCase() : "low",
                            timestamp: new Date().toISOString(),
                            score: doc.finalRiskScore || 0,
                            originalData: doc
                        };
                    });

                    setDocumentInsights(processedDocuments);
                }

                // Process audio insights
                if (userData.audioCalls && Array.isArray(userData.audioCalls)) {
                    const processedAudioCalls = userData.audioCalls.map(call => {
                        //Generate the summary
                        const audioSummary = generateInsightSummary(call, 'audio');

                        return {
                            id: call.id || `audio-${Math.random().toString(36).substr(2, 9)}`,
                            type: "audio",
                            title: call.fileName || call.callId || "Untitled Audio",
                            summary: audioSummary,
                            riskLevel: call.riskLevel ? call.riskLevel.toLowerCase() : "low",
                            timestamp: call.date || new Date().toISOString(),
                            duration: call.duration || "00:00",
                            score: call.score || calculateMockScore(call.riskLevel ? call.riskLevel.toLowerCase() : "low"),
                            originalData: call // Store original data for detailed view
                        };
                    });

                    setAudioInsights(processedAudioCalls);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                message.error('Failed to fetch data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    // Helper function to generate mock score based on risk level
    const calculateMockScore = (riskLevel) => {
        switch (riskLevel) {
            case 'high': return Math.floor(Math.random() * 40) + 20; // 20-60
            case 'medium': return Math.floor(Math.random() * 20) + 60; // 60-80
            case 'low': return Math.floor(Math.random() * 15) + 85; // 85-100
            default: return Math.floor(Math.random() * 100);
        }
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel) {
            case 'high': return 'red';
            case 'medium': return 'orange';
            case 'low': return 'green';
            default: return 'default';
        }
    };

    const getRiskLabel = (riskLevel) => {
        switch (riskLevel) {
            case 'high': return 'Very risky';
            case 'medium': return 'Needs review';
            case 'low': return 'Low risk';
            default: return 'Unknown';
        }
    };

    const handleViewDetails = (id, type) => {
        if (type === 'document') {
            navigate(`/document/${id}`);
        } else if (type === 'audio') {
            navigate(`/audio/${id}`);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Invalid date:', dateString);
            return 'Invalid date';
        }
    };

    const renderInsightCard = (insight) => (
        <Card
            key={insight.id}
            className="insight-card"
            style={{
                borderLeft: `4px solid ${insight.riskLevel === 'high' ? '#ff4d4f' :
                        insight.riskLevel === 'medium' ? '#faad14' :
                            '#52c41a'
                    }`,
                marginBottom: '16px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                    <Space>
                        {insight.type === 'document' ? (
                            <FileTextOutlined style={{ fontSize: '20px' }} />
                        ) : (
                            <AudioOutlined style={{ fontSize: '20px' }} />
                        )}
                        <Title level={5} style={{ margin: 0 }}>
                            {insight.title}
                        </Title>
                    </Space>

                    <Paragraph style={{ marginTop: '8px' }}>
                        {insight.summary}  {/* Display the generated summary */}
                    </Paragraph>

                    <Space style={{ marginTop: '8px' }}>
                        <Tag color={getRiskColor(insight.riskLevel)}>
                            {getRiskLabel(insight.riskLevel)}
                        </Tag>
                        <Text type="secondary">{formatDate(insight.timestamp)}</Text>
                        {insight.type === 'audio' && insight.duration && (
                            <Tag icon={<AudioOutlined />}>
                                {insight.duration}
                            </Tag>
                        )}
                        <Tag color="blue">
                            Score: {insight.score ? insight.score.toFixed(1) : 'N/A'}
                        </Tag>
                    </Space>
                </div>
                <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={() => handleViewDetails(insight.id, insight.type)}
                    style={{ marginTop: '16px' }}
                >
                    View Detailed Insights
                </Button>
            </div>
        </Card>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Header with profile section */}
            <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                    <Title level={3} style={{ margin: 0 }}>Risk Assessment Dashboard</Title>
                    <Space>
                        {user ? (
                            <div style={{ textAlign: 'right' }}>
                                <Text strong>{user.name}</Text>
                                <br />
                                <Text type="secondary">{user.phone}</Text>
                            </div>
                        ) : (
                            <Text type="secondary">Loading user info...</Text>
                        )}
                        <Avatar icon={<UserOutlined />} />
                    </Space>
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
                {!loading && user && (
                    <Tabs defaultActiveKey="1">
                        <TabPane tab={
                            <span>
                                <FileTextOutlined />
                                Documents ({documentInsights.length})
                            </span>
                        } key="1">
                            <div style={{ marginBottom: '24px' }}>
                                <Title level={4}>Document Analysis</Title>
                                <Text type="secondary">Review and manage document risk assessments</Text>
                            </div>

                            {documentInsights.length > 0 ? (
                                <div>
                                    {documentInsights.map(renderInsightCard)}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                    <Text type="secondary">No document insights available at this time.</Text>
                                </div>
                            )}
                        </TabPane>

                        <TabPane tab={
                            <span>
                                <AudioOutlined />
                                Audio Calls ({audioInsights.length})
                            </span>
                        } key="2">
                            <div style={{ marginBottom: '24px' }}>
                                <Title level={4}>Audio Call Analysis</Title>
                                <Text type="secondary">Review and manage audio call risk assessments</Text>
                            </div>

                            {audioInsights.length > 0 ? (
                                <div>
                                    {audioInsights.map(renderInsightCard)}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                    <Text type="secondary">No audio call insights available at this time.</Text>
                                </div>
                            )}
                        </TabPane>
                    </Tabs>
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