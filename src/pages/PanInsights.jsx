import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
    Card, Row, Col, Typography, Divider, Tag, Progress, Table, Space, Descriptions, Alert, Timeline, Statistic, Spin
} from 'antd';
import {
    CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, FileImageOutlined,
    FileTextOutlined, ScanOutlined, SafetyOutlined, AuditOutlined, CheckOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const getRiskColor = (score) => {
    if (score === null || score === undefined) {
        return 'default';
    }
    return score <= 0.3 ? 'green' : score <= 0.7 ? 'orange' : 'red';
};

const getValidationColor = (score) => score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red';

const getMatchStatusIcon = (score) => {
    if (score >= 80) return <CheckCircleOutlined style={{ color: 'green' }} />;
    if (score >= 60) return <ExclamationCircleOutlined style={{ color: 'orange' }} />;
    return <CloseCircleOutlined style={{ color: 'red' }} />;
};

const validationColumns = [
    { title: 'Field', dataIndex: 'field', key: 'field' },
    { title: 'Expected Value', dataIndex: 'expected', key: 'expected' },
    { title: 'Extracted Value', dataIndex: 'extracted', key: 'extracted' },
    {
        title: 'Match Score',
        dataIndex: 'match_score',
        key: 'match_score',
        render: (score) => (
            <Space size="small">
                {getMatchStatusIcon(score)}
                <span>{score !== null && score !== undefined ? score.toFixed(2) : 'N/A'}%</span>
            </Space>
        ),
    },
];

const qualityColumns = [
    { title: 'Aspect', dataIndex: 'aspect', key: 'aspect' },
    {
        title: 'Score', dataIndex: 'score', key: 'score',
        render: (score) => {
            const validScore = (typeof score === 'number' && !isNaN(score)) ? score : 0;
            return (
                <Progress
                    percent={(validScore * 100).toFixed(0)}
                    size="small"
                    status={validScore >= 0.8 ? "success" : validScore >= 0.6 ? "normal" : "exception"}
                    format={percent => `${percent}%`}
                />
            );
        },
    },
    { title: 'Insight', dataIndex: 'insight', key: 'insight' },
    { title: 'Recommendation', dataIndex: 'recommendation', key: 'recommendation' },
];

const forgeryColumns = [
    { title: 'Aspect', dataIndex: 'aspect', key: 'aspect' },
    {
        title: 'Risk Score', dataIndex: 'score', key: 'score',
        render: (score) => {
            const validScore = (typeof score === 'number' && !isNaN(score)) ? score : 0;
            return (
                <Progress
                    percent={(validScore * 100).toFixed(0)}
                    size="small"
                    strokeColor={getRiskColor(validScore)}
                    format={percent => `${percent}%`}
                />
            );
        },
    },
    { title: 'Risk Level', dataIndex: 'riskLevel', key: 'riskLevel' },
    { title: 'Detailed Insight', dataIndex: 'insight', key: 'insight' },
];

const prepareValidationData = (documentData) => {
    try {
        if (documentData?.validationResults?.validation_results) {
            const validationResults = documentData.validationResults.validation_results;
            const preparedData = Object.entries(validationResults).map(([field, data], index) => {
                return {
                    key: index,
                    field: field.replace(/_/g, ' ').toUpperCase(),
                    expected: data?.expected !== null && data?.expected !== undefined ? data.expected : 'N/A',
                    extracted: data?.extracted !== null && data?.extracted !== undefined ? data.extracted : 'N/A',
                    match_score: data?.match_score !== null && data?.match_score !== undefined ? data.match_score : null,
                };
            });
            return preparedData;
        }
        return [];
    } catch (error) {
        console.error("Error processing validationResults:", error);
        return [];
    }
};

const prepareQualityData = (documentData) => {
    try {
        if (documentData?.qualityResults?.qualityAnalysis) {
            const qualityAnalysis = documentData.qualityResults.qualityAnalysis;
            const preparedData = Object.entries(qualityAnalysis).map(([field, data], index) => {
                const scoreKey = Object.keys(data).find((key) => key.includes('Score'));
                const score = data?.[scoreKey];

                return {
                    key: index,
                    aspect: field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
                    score: score !== null && score !== undefined ? score : 0,
                    insight: data?.detailedInsight || 'N/A',
                    recommendation: data?.recommendations || 'N/A',
                };
            });
            return preparedData;
        }
        return [];
    } catch (error) {
        console.error("Error processing qualityResults:", error);
        return [];
    }
};

const prepareForgeryData = (documentData) => {
    try {
        if (documentData?.forgeryResults?.forgeryAnalysis) {
            const forgeryAnalysis = documentData.forgeryResults.forgeryAnalysis;
            const preparedData = Object.entries(forgeryAnalysis)
                .filter(([key]) => key !== 'overallForgeryAssessment')
                .map(([field, data], index) => {
                    const scoreKey = Object.keys(data).find((key) => key.includes('Score'));
                    const score = data?.[scoreKey];
                    const finalForgeryRiskScore = forgeryAnalysis?.overallForgeryAssessment?.finalForgeryRiskScore;

                    return {
                        key: index,
                        aspect: field.replace(/([A-Z])/g, ' $1').replace(/Analysis$/, '').replace(/^./, (str) => str.toUpperCase()),
                        score: score !== null && score !== undefined ? score : 0,
                        riskLevel: finalForgeryRiskScore <= 0.3 ? 'Low Risk' : finalForgeryRiskScore <= 0.7 ? 'Medium Risk' : 'High Risk',
                        insight: data?.insight || 'N/A',
                    };
                });
            return preparedData;
        }
        return [];
    } catch (error) {
        console.error("Error processing forgeryResults:", error);
        return [];
    }
};

const PanInsights = () => {
    const [documentData, setDocumentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { leadId } = useParams();
    const { documentId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await axios.get(`http://localhost:8080/documents/${documentId}/Pan`);
                setDocumentData(result.data);
            } catch (error) {
                setError("Failed to load PAN insights.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [leadId]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Spin size="large" tip="Loading PAN insights..." /></div>;
    if (error) return <Alert message="Error" description={error} type="error" showIcon />;
    if (!documentData) return <Alert message="No Data" description="No PAN data available." type="warning" showIcon />;

    const validationData = prepareValidationData(documentData);
    const qualityData = prepareQualityData(documentData);
    const forgeryData = prepareForgeryData(documentData);

    const riskLevel = documentData?.riskLevel || 'LOW';
    const decision = documentData?.decision || 'UNKNOWN';
    const nextSteps = documentData?.nextSteps || 'No next steps provided';
    const remarks = documentData?.remarks || 'No remarks provided';
    const finalRiskScore = documentData?.finalRiskScore || 0;

    const qualityScore = documentData?.qualityResults?.finalQualityScore || 0;
    const qualityDecision = documentData?.qualityResults?.decision || 'UNKNOWN';

    const validationScore = documentData?.validationResults?.overall_validation_score || 0;
    const validationStatus = documentData?.validationResults?.status || 'UNKNOWN';

    const forgeryRiskScore = documentData?.forgeryResults?.forgeryAnalysis?.overallForgeryAssessment?.finalForgeryRiskScore || 0;
    const forgeryDecision = documentData?.forgeryResults?.forgeryAnalysis?.overallForgeryAssessment?.decision || 'UNKNOWN';

    const riskAssessmentColor = riskLevel === "LOW" ? "#f6ffed" : riskLevel === "MEDIUM" ? "#fffbe6" : "#fff2f0";
    const riskAssessmentTextColor = riskLevel === "LOW" ? "green" : riskLevel === "MEDIUM" ? "orange" : "red";

    const validationScoreColor = getValidationColor(validationScore);
    const validationStatusColor = validationStatus === "PASS" ? "green" : "red";

    return (
        <div style={{ padding: '24px', fontSize: '13px' }}>
            <Card className="summary-card" style={{ marginBottom: '12px' }}>
                <Row gutter={[24, 16]}>
                    <Col span={24}>
                        <Title level={3}><FileTextOutlined /> PAN Verification Report</Title>
                        <Descriptions bordered column={1} size="small" style={{ marginBottom: '16px' }}>
                            <Descriptions.Item label="Processing Status"><Tag color="green"><CheckOutlined /> Completed</Tag></Descriptions.Item>
                        </Descriptions>
                        <Card style={{ marginTop: '8px', backgroundColor: riskAssessmentColor, borderColor: riskAssessmentColor, padding: '8px' }}>
                            <Statistic title="Final Risk Assessment" value={riskLevel} valueStyle={{ color: riskAssessmentTextColor }} prefix={riskLevel === "LOW" ? <CheckCircleOutlined /> : riskLevel === "MEDIUM" ? <ExclamationCircleOutlined /> : <CloseCircleOutlined />} />
                            <Divider style={{ margin: '8px 0' }} />
                            <Row gutter={[16, 0]}>
                                <Col span={10}><Statistic title="Decision" value={decision} valueStyle={{ color: decision === "APPROVE" ? "green" : "red" }} /></Col>
                                <Col span={14}>
                                    <div style={{ paddingLeft: '8px' }}>
                                        <Text strong>Next Steps:</Text> <Text>{nextSteps}</Text><br />
                                        <Text strong>Remarks:</Text> <Text>{remarks}</Text>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Card>
            <Divider style={{ margin: '8px 0' }} />
            <Card title={<Title level={4}><ScanOutlined /> OCR & Extracted Data</Title>} style={{ marginBottom: '12px' }}>
                <Alert message="OCR Provider: Gemini Vision Pro API" type="info" showIcon style={{ marginBottom: '8px' }} />
                <Row gutter={[8, 8]}>
                    {documentData?.ocrResults?.structured_data ? Object.entries(documentData.ocrResults.structured_data)
                        .filter(([key]) => key !== 'raw_text')
                        .map(([key, value], index) => (
                            <Col span={8} key={index}>
                                <Card bordered={false} size="small" style={{ backgroundColor: '#f5f5f5' }}>
                                    <Statistic title={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())} value={value} valueStyle={{ fontSize: '14px' }} />
                                </Card>
                            </Col>
                        )) : null}
                </Row>
            </Card>
            <Divider style={{ margin: '8px 0' }} />
            <Card title={<Title level={4}><SafetyOutlined /> Forgery Check</Title>} style={{ marginBottom: '12px' }}>
                <Card bordered={false} style={{ backgroundColor: getRiskColor(forgeryRiskScore) === 'green' ? '#f6ffed' : getRiskColor(forgeryRiskScore) === 'orange' ? '#fffbe6' : '#fff2f0' }}>
                    <Row align="middle">
                        <Col span={8}>
                            <Progress
                                type="dashboard"
                                percent={(finalRiskScore * 100).toFixed(0)}
                                strokeColor={getRiskColor(forgeryRiskScore)}
                                format={percent => `${percent}%`}
                            />
                        </Col>
                        <Col span={16}>
                            <Statistic title="Forgery Risk Assessment" value={forgeryDecision} valueStyle={{ color: getRiskColor(forgeryRiskScore) }} />
                            <Paragraph style={{ marginTop: '4px', marginBottom: '4px' }}>The document has been analyzed for potential forgery and tampering. Each aspect of the document has been carefully evaluated to ensure authenticity.</Paragraph>
                        </Col>
                    </Row>
                </Card>
                <Table dataSource={forgeryData} columns={forgeryColumns} pagination={false} bordered size="small" style={{ marginTop: '8px' }} />
            </Card>
            <Divider style={{ margin: '8px 0' }} />
            <Card title={<Title level={4}><AuditOutlined /> Validation & Data Cross-Check</Title>} style={{ marginBottom: '12px' }}>
                <Card bordered={false} style={{ backgroundColor: validationScoreColor === 'green' ? '#f6ffed' : validationScoreColor === 'orange' ? '#fffbe6' : '#fff2f0' }}>
                    <Row align="middle">
                        <Col span={8}>
                            <Progress
                                type="dashboard"
                                percent={validationScore.toFixed(0)}
                                status={validationScoreColor === 'green' ? "success" : validationScoreColor === 'orange' ? "normal" : "exception"}
                                format={percent => `${percent}%`}
                            />
                        </Col>
                        <Col span={16}>
                            <Statistic title="Data Validation Status" value={validationStatus} valueStyle={{ color: validationStatusColor }} />
                            <Paragraph style={{ marginTop: '4px', marginBottom: '4px' }}>This score represents how well the extracted data matches the expected reference data.
                                {validationStatus === "FAIL" && (
                                    <Alert message="Validation Failed" description="Some critical fields did not match the expected values. Please review the details below." type="error" showIcon style={{ marginTop: '6px', marginBottom: '4px' }} />
                                )}
                            </Paragraph>
                        </Col>
                    </Row>
                </Card>
                <Table dataSource={validationData} columns={validationColumns} pagination={false} bordered size="small" style={{ marginTop: '8px' }} />
            </Card>
            <Divider style={{ margin: '8px 0' }} />
            <Card title={<Title level={4}><FileImageOutlined /> Image Quality Analysis</Title>} style={{ marginBottom: '12px' }}>
                <Card bordered={false} style={{ backgroundColor: qualityScore >= 0.8 ? '#f6ffed' : qualityScore >= 0.6 ? '#fffbe6' : '#fff2f0' }}>
                    <Row align="middle">
                        <Col span={8}>
                            <Progress
                                type="dashboard"
                                percent={(qualityScore * 100).toFixed(0)}
                                status={qualityScore >= 0.8 ? "success" : qualityScore >= 0.6 ? "normal" : "exception"}
                                format={percent => `${percent}%`}
                            />
                        </Col>
                        <Col span={16}>
                            <Statistic title="Image Quality Assessment" value={qualityDecision} valueStyle={{ color: qualityScore >= 0.8 ? "green" : qualityScore >= 0.6 ? "orange" : "red" }} />
                            <Paragraph style={{ marginTop: '4px', marginBottom: '4px' }}>This score represents the overall quality of the document image, including factors like readability, clarity, lighting, and completeness.</Paragraph>
                        </Col>
                    </Row>
                </Card>
                <Table dataSource={qualityData} columns={qualityColumns} pagination={false} bordered size="small" style={{ marginTop: '8px' }} />
            </Card>
            <Divider style={{ margin: '8px 0' }} />
            <Card title={<Title level={4}><SafetyOutlined /> Final Risk Assessment</Title>} style={{ marginBottom: '12px' }}>
                <Card bordered={false} style={{ backgroundColor: riskAssessmentColor }}>
                    <Row>
                        <Col span={8} style={{ display: 'flex', justifyContent: 'center' }}>
                            <Progress
                                type="dashboard"
                                percent={(finalRiskScore * 100).toFixed(0)}
                                strokeColor={riskAssessmentTextColor}
                                format={() => (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '11px' }}>
                                        <span>Risk</span>
                                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: riskAssessmentTextColor }}>{riskLevel}</span>
                                    </div>
                                )}
                            />
                        </Col>
                        <Col span={16}>
                            <Statistic title="Final Decision" value={decision} valueStyle={{ color: decision === "APPROVE" ? "green" : "red", fontSize: '20px' }} />
                            <Divider style={{ margin: '6px 0' }} />
                            <Title level={5} style={{ fontSize: '14px' }}>Summary:</Title>
                            <Timeline style={{ fontSize: '12px' }}>
                                <Timeline.Item color={validationScoreColor}>Data Validation: {validationScore.toFixed(1)}% ({validationStatus})</Timeline.Item>
                                <Timeline.Item color={getRiskColor(forgeryRiskScore)}>Forgery Risk: {(forgeryRiskScore * 100).toFixed(0)}% ({forgeryDecision})</Timeline.Item>
                                <Timeline.Item color={qualityScore >= 0.8 ? "green" : qualityScore >= 0.6 ? "orange" : "red"}>Image Quality: {(qualityScore * 100).toFixed(0)}% ({qualityDecision})</Timeline.Item>
                                <Timeline.Item color={riskAssessmentTextColor}><strong>Final Assessment: {riskLevel} - {decision}</strong></Timeline.Item>
                            </Timeline>
                            <Divider style={{ margin: '6px 0' }} />
                            <Text strong>Next Steps:</Text> <Text>{nextSteps}</Text><br />
                            <Text strong>Remarks:</Text> <Text>{remarks}</Text>
                        </Col>
                    </Row>
                </Card>
            </Card>
        </div>
    );
};

export default PanInsights;