import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card, Row, Col, Typography, Divider, Tag, Progress, Table, Space, Descriptions, Image, Alert, Timeline, Statistic, Spin
} from 'antd';
import {
    CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
    FileTextOutlined, ScanOutlined, SafetyOutlined, FileImageOutlined, AuditOutlined, CheckOutlined
} from '@ant-design/icons';

import DocumentPreviewImage from '../assets/adhar3.jpg'; // Keep this, and make sure it exists!

const { Title, Text, Paragraph } = Typography;

const DocumentInsight = () => {
    const [documentData, setDocumentData] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state

    const documentId = "67d905e8d80a911191d6ee4a"; // Hardcoded documentId


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await axios.get(`http://localhost:8080/documents/result?documentId=${documentId}`);
                setDocumentData(result.data);
            } catch (error) {
                console.error("Error fetching document data:", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [documentId]); // Add documentId as a dependency to useEffect

    // Helper functions (Memoized)
    const getRiskColor = (score) => score <= 0.3 ? 'green' : score <= 0.7 ? 'orange' : 'red';
    const getValidationColor = (score) => score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red';
    const getMatchStatusIcon = (score) => {
        if (score >= 80) return <CheckCircleOutlined style={{ color: 'green' }} />;
        if (score >= 60) return <ExclamationCircleOutlined style={{ color: 'orange' }} />;
        return <CloseCircleOutlined style={{ color: 'red' }} />;
    };

    //Table Column Configs
    const validationColumns = [
        { title: 'Field', dataIndex: 'field', key: 'field' },
        { title: 'Expected Value', dataIndex: 'expected', key: 'expected' },
        { title: 'Extracted Value', dataIndex: 'extracted', key: 'extracted' },
        {
            title: 'Match Score', dataIndex: 'match_score', key: 'match_score',
            render: (score) => (
                <Space size="small">
                    {getMatchStatusIcon(score)}
                    <span>{score.toFixed(2)}%</span>
                </Space>
            ),
        },
    ];

    const qualityColumns = [
        { title: 'Aspect', dataIndex: 'aspect', key: 'aspect' },
        {
            title: 'Score', dataIndex: 'score', key: 'score',
            render: (score) => (
                <Progress percent={score * 100} size="small" status={score >= 0.8 ? "success" : score >= 0.6 ? "normal" : "exception"} format={percent => `${percent.toFixed(0)}%`} />
            ),
        },
        { title: 'Insight', dataIndex: 'insight', key: 'insight' },
        { title: 'Recommendation', dataIndex: 'recommendation', key: 'recommendation' },
    ];

    const forgeryColumns = [
        { title: 'Aspect', dataIndex: 'aspect', key: 'aspect' },
        {
            title: 'Risk Score', dataIndex: 'score', key: 'score',
            render: (score) => (
                <Progress percent={score * 100} size="small" strokeColor={getRiskColor(score)} format={percent => `${percent.toFixed(0)}%`} />
            ),
        },
        {
            title: 'Risk Level', dataIndex: 'riskLevel', key: 'riskLevel' },
        { title: 'Detailed Insight', dataIndex: 'insight', key: 'insight' },
    ];

    // Data Transformation Functions
    const prepareValidationData = () => documentData && documentData.validationResults && documentData.validationResults.validation_results ? Object.entries(documentData.validationResults.validation_results)
        .map(([field, data], index) => ({
            key: index,
            field: field.replace(/_/g, ' ').toUpperCase(),
            expected: data.expected,
            extracted: data.extracted,
            match_score: data.match_score,
        })) : [];

    const prepareQualityData = () => documentData && documentData.qualityResults && documentData.qualityResults.qualityAnalysis ? Object.entries(documentData.qualityResults.qualityAnalysis)
        .map(([field, data], index) => {
            const scoreKey = Object.keys(data).find(key => key.includes('Score'));
            const score = data[scoreKey];

            return {
                key: index,
                aspect: field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                score: score,
                insight: data.detailedInsight,
                recommendation: data.recommendations || 'None provided',
            };
        }) : [];

    const prepareForgeryData = () => documentData && documentData.forgeryResults && documentData.forgeryResults.forgeryAnalysis ? Object.entries(documentData.forgeryResults.forgeryAnalysis)
        .filter(([key]) => key !== 'overallForgeryAssessment')
        .map(([field, data], index) => {
            const scoreKey = Object.keys(data).find(key => key.includes('Score'));
            const score = data[scoreKey];

            return {
                key: index,
                aspect: field.replace(/([A-Z])/g, ' $1').replace(/Analysis$/, '').replace(/^./, str => str.toUpperCase()),
                score: score,
                riskLevel: score <= 0.3 ? 'Low Risk' : score <= 0.7 ? 'Medium Risk' : 'High Risk',
                insight: data.detailedInsight,
            };
        }) : [];


    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Spin size="large" tip="Loading document insights..." />
        </div>;
    }

    if (error) {
        return <Alert message="Error" description="Failed to load document insights." type="error" showIcon />;
    }

    if (!documentData) {
        return <Alert message="No Data" description="No document data available." type="warning" showIcon />;
    }

    const validationData = prepareValidationData();
    const qualityData = prepareQualityData();
    const forgeryData = prepareForgeryData();

    const riskAssessmentColor = documentData.riskLevel === "LOW" ? "#f6ffed" : documentData.riskLevel === "MEDIUM" ? "#fffbe6" : "#fff2f0";
    const riskAssessmentTextColor = documentData.riskLevel === "LOW" ? "green" : documentData.riskLevel === "MEDIUM" ? "orange" : "red";

    const validationScoreColor = getValidationColor(documentData.validationResults.overall_validation_score);
    const validationStatusColor = documentData.validationResults.status === "PASS" ? "green" : "red";

    return (
        <div style={{ padding: '12px', fontSize: '13px' }}>
            <Card className="summary-card" style={{ marginBottom: '12px' }}>
                <Row gutter={[16, 16]}>
                    <Col span={16}>
                        <Title level={3}><FileTextOutlined /> Document Verification Report</Title>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Document ID" span={2}><Text copyable>{documentData.documentId}</Text></Descriptions.Item>
                            <Descriptions.Item label="Document Type">{documentData.ocrResults.structured_data.document_type}</Descriptions.Item>
                            <Descriptions.Item label="Upload Date">March 17, 2025</Descriptions.Item>
                            <Descriptions.Item label="Uploaded By">John Doe</Descriptions.Item>
                            <Descriptions.Item label="Processing Status"><Tag color="green"><CheckOutlined /> Completed</Tag></Descriptions.Item>
                        </Descriptions>

                        <Card style={{ marginTop: '8px', backgroundColor: riskAssessmentColor, borderColor: riskAssessmentColor }}>
                            <Statistic title="Final Risk Assessment" value={documentData.riskLevel} valueStyle={{ color: riskAssessmentTextColor }}
                                prefix={documentData.riskLevel === "LOW" ? <CheckCircleOutlined /> : documentData.riskLevel === "MEDIUM" ? <ExclamationCircleOutlined /> : <CloseCircleOutlined />} />
                            <Divider style={{ margin: '8px 0' }} />
                            <Row>
                                <Col span={12}><Statistic title="Decision" value={documentData.decision} valueStyle={{ color: documentData.decision === "APPROVE" ? "green" : "red" }} /></Col>
                                <Col span={12}>
                                    <Text strong>Next Steps:</Text> <Text>{documentData.nextSteps}</Text><br />
                                    <Text strong>Remarks:</Text> <Text>{documentData.remarks}</Text>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <Card title="Document Preview" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Image width={150} src={DocumentPreviewImage} alt="Document Preview" />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Card>

            <Divider style={{ margin: '8px 0' }} />

            <Card title={<Title level={4}><ScanOutlined /> OCR & Extracted Data</Title>} style={{ marginBottom: '12px' }}>
                <Alert message="OCR Provider: Gemini Vision Pro API" type="info" showIcon style={{ marginBottom: '8px' }} />
                <Row gutter={[8, 8]}>
                    {documentData.ocrResults && documentData.ocrResults.structured_data ? Object.entries(documentData.ocrResults.structured_data)
                        .filter(([key]) => key !== 'raw_text')
                        .map(([key, value], index) => (
                            <Col span={8} key={index}>
                                <Card bordered={false} size="small" style={{ backgroundColor: '#f5f5f5' }}>
                                    <Statistic title={key.replace(/_/g, ' ').toUpperCase()} value={value} valueStyle={{ fontSize: '14px' }} />
                                </Card>
                            </Col>
                        )) : null}
                </Row>
            </Card>

            <Divider style={{ margin: '8px 0' }} />

            <Card title={<Title level={4}><SafetyOutlined /> Forgery Check</Title>} style={{ marginBottom: '12px' }}>
                <Card bordered={false} style={{ backgroundColor: getRiskColor(documentData.forgeryResults.forgeryAnalysis.overallForgeryAssessment.finalForgeryRiskScore) === 'green' ? '#f6ffed' : getRiskColor(documentData.forgeryResults.forgeryAnalysis.overallForgeryAssessment.finalForgeryRiskScore) === 'orange' ? '#fffbe6' : '#fff2f0' }}>
                    <Row align="middle">
                        <Col span={8}>
                            <Progress type="dashboard" percent={(documentData.forgeryResults.forgeryAnalysis.overallForgeryAssessment.finalForgeryRiskScore * 100).toFixed(0)} strokeColor={getRiskColor(documentData.forgeryResults.forgeryAnalysis.overallForgeryAssessment.finalForgeryRiskScore)} format={percent => `${percent}%`} />
                        </Col>
                        <Col span={16}>
                            <Statistic title="Forgery Risk Assessment" value={documentData.forgeryResults.forgeryAnalysis.overallForgeryAssessment.decision} valueStyle={{ color: getRiskColor(documentData.forgeryResults.forgeryAnalysis.overallForgeryAssessment.finalForgeryRiskScore) }} />
                            <Paragraph style={{ marginTop: '4px', marginBottom: '4px' }}>The document has been analyzed for potential forgery and tampering. Each aspect of the document has been carefully evaluated to ensure authenticity.</Paragraph>
                        </Col>
                    </Row>
                </Card>
                <Table dataSource={forgeryData} columns={forgeryColumns} pagination={false} bordered size="small" style={{ marginTop: '8px' }} />
            </Card>

            <Divider style={{ margin: '8px 0' }} />

            <Card title={<Title level={4}><FileImageOutlined /> Image Quality Analysis</Title>} style={{ marginBottom: '12px' }}>
                <Card bordered={false} style={{ backgroundColor: documentData.qualityResults.finalQualityScore >= 0.8 ? '#f6ffed' : documentData.qualityResults.finalQualityScore >= 0.6 ? '#fffbe6' : '#fff2f0' }}>
                    <Row align="middle">
                        <Col span={8}>
                            <Progress type="dashboard" percent={(documentData.qualityResults.finalQualityScore * 100).toFixed(0)} status={documentData.qualityResults.finalQualityScore >= 0.8 ? "success" : documentData.qualityResults.finalQualityScore >= 0.6 ? "normal" : "exception"} format={percent => `${percent}%`} />
                        </Col>
                        <Col span={16}>
                            <Statistic title="Image Quality Assessment" value={documentData.qualityResults.decision} valueStyle={{ color: documentData.qualityResults.finalQualityScore >= 0.8 ? "green" : documentData.qualityResults.finalQualityScore >= 0.6 ? "orange" : "red" }} />
                            <Paragraph style={{ marginTop: '4px', marginBottom: '4px' }}>This score represents the overall quality of the document image, including factors like readability, clarity, lighting, and completeness.</Paragraph>
                        </Col>
                    </Row>
                </Card>
                <Table dataSource={qualityData} columns={qualityColumns} pagination={false} bordered size="small" style={{ marginTop: '8px' }} />
            </Card>

            <Divider style={{ margin: '8px 0' }} />

            <Card title={<Title level={4}><AuditOutlined /> Validation & Data Cross-Check</Title>} style={{ marginBottom: '12px' }}>
                <Card bordered={false} style={{ backgroundColor: validationScoreColor === 'green' ? '#f6ffed' : validationScoreColor === 'orange' ? '#fffbe6' : '#fff2f0' }}>
                    <Row align="middle">
                        <Col span={8}>
                            <Progress type="dashboard" percent={documentData.validationResults.overall_validation_score.toFixed(0)} status={validationScoreColor === 'green' ? "success" : validationScoreColor === 'orange' ? "normal" : "exception"} format={percent => `${percent}%`} />
                        </Col>
                        <Col span={16}>
                            <Statistic title="Data Validation Status" value={documentData.validationResults.status} valueStyle={{ color: validationStatusColor }} />
                            <Paragraph style={{ marginTop: '4px', marginBottom: '4px' }}>This score represents how well the extracted data matches the expected reference data.
                                {documentData.validationResults.status === "FAIL" && (
                                    <Alert message="Validation Failed" description="Some critical fields did not match the expected values. Please review the details below." type="error" showIcon style={{ marginTop: '6px', marginBottom: '4px' }} />
                                )}
                            </Paragraph>
                        </Col>
                    </Row>
                </Card>
                <Table dataSource={validationData} columns={validationColumns} pagination={false} bordered size="small" style={{ marginTop: '8px' }} />
            </Card>

            <Divider style={{ margin: '8px 0' }} />

            <Card title={<Title level={4}><SafetyOutlined /> Final Risk Assessment</Title>} style={{ marginBottom: '12px' }}>
                <Card bordered={false} style={{ backgroundColor: riskAssessmentColor }}>
                    <Row>
                        <Col span={8} style={{ display: 'flex', justifyContent: 'center' }}>
                            <Progress type="dashboard" percent={(documentData.finalRiskScore * 100).toFixed(0)} strokeColor={riskAssessmentTextColor}
                                format={() => (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '11px' }}>
                                        <span>Risk</span>
                                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: riskAssessmentTextColor }}>{documentData.riskLevel}</span>
                                    </div>
                                )} />
                        </Col>
                        <Col span={16}>
                            <Statistic title="Final Decision" value={documentData.decision} valueStyle={{ color: documentData.decision === "APPROVE" ? "green" : "red", fontSize: '20px' }} />
                            <Divider style={{ margin: '6px 0' }} />
                            <Title level={5} style={{ fontSize: '14px' }}>Summary:</Title>
                            <Timeline style={{ fontSize: '12px' }}>
                                <Timeline.Item color={validationScoreColor}>Data Validation: {documentData.validationResults.overall_validation_score.toFixed(1)}% ({documentData.validationResults.status})</Timeline.Item>
                                <Timeline.Item color={getRiskColor(documentData.forgeryResults.forgeryAnalysis.overallForgeryAssessment.finalForgeryRiskScore)}>Forgery Risk: {(documentData.forgeryResults.forgeryAnalysis.overallForgeryAssessment.finalForgeryRiskScore * 100).toFixed(0)}% ({documentData.forgeryResults.forgeryAnalysis.overallForgeryAssessment.decision})</Timeline.Item>
                                <Timeline.Item color={documentData.qualityResults.finalQualityScore >= 0.8 ? "green" : documentData.qualityResults.finalQualityScore >= 0.6 ? "orange" : "red"}>Image Quality: {(documentData.qualityResults.finalQualityScore * 100).toFixed(0)}% ({documentData.qualityResults.decision})</Timeline.Item>
                                <Timeline.Item color={riskAssessmentTextColor}><strong>Final Assessment: {documentData.riskLevel} - {documentData.decision}</strong></Timeline.Item>
                            </Timeline>
                            <Divider style={{ margin: '6px 0' }} />
                            <Text strong>Next Steps:</Text> <Text>{documentData.nextSteps}</Text><br />
                            <Text strong>Remarks:</Text> <Text>{documentData.remarks}</Text>
                        </Col>
                    </Row>
                </Card>
            </Card>
        </div>
    );
};

export default DocumentInsight;