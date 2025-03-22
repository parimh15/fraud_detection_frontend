
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import {
    Card, Row, Col, Typography, Divider, Tag, Progress, Table, Space, Descriptions, Image, Alert, Timeline, Statistic, Spin
} from 'antd';
import {
    CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
    FileTextOutlined, ScanOutlined, SafetyOutlined, FileImageOutlined, AuditOutlined, CheckOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const DocumentInsight = () => {

    const getDocumentTypeFromLocalStorage = () => {
        try {
            const storedDocumentType = localStorage.getItem('documentType'); // Replace 'documentType' with the actual key you use to store it
            return storedDocumentType || null; // Return null if not found
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            return null; // Handle errors, like if localStorage is disabled
        }
    };

    const { userId, documentType: routeDocumentType } = useParams();  //Destructure both userId and documentType from params
    const [localStorageDocumentType, setLocalStorageDocumentType] = useState(getDocumentTypeFromLocalStorage());

    const documentType = routeDocumentType || localStorageDocumentType;
    const [documentData, setDocumentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageURL, setImageURL] = useState(null);
    const [imageError, setImageError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setImageError(null);
            try {
                const result = await axios.get(`http://localhost:8080/documents/${userId}/${documentType}`);  // Use userId and documentType
                setDocumentData(result.data);
                console.log("Fetched DocumentData:", result.data);

               if (result.data.documentId) { // Check if documentId exists before fetching image //${result.data.documentId}
                    try {
                        const imageResponse = await axios.get(`http://localhost:8080/documents/image/75fd4f26-8371-4613-8c58-78b517d6d12f`, {  // Correctly fetch image using documentId from the fetched data
                            responseType: 'blob'
                        });

                        const imageUrl = URL.createObjectURL(imageResponse.data);
                        setImageURL(imageUrl);
                    } catch (imageFetchError) {
                        console.error("Error fetching image:", imageFetchError);
                        setImageError("Failed to load document preview.");
                        setImageURL(null); // Ensure imageURL is null on error
                    }
                } else {
                    setImageURL(null); // Set imageURL to null if documentId is missing
                    setImageError("Document ID is missing. Cannot load preview.");
                }

            } catch (error) {
                console.error("Error fetching document data:", error);
                setError("Failed to load document insights. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            if (imageURL) {
                URL.revokeObjectURL(imageURL);
            }
        };
    }, [userId, documentType, localStorageDocumentType, imageURL]);

    useEffect(() => {
        const handleStorageChange = () => {
            const newDocumentType = getDocumentTypeFromLocalStorage();
            if (newDocumentType !== localStorageDocumentType) {
                setLocalStorageDocumentType(newDocumentType);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [localStorageDocumentType]); // The dependency array includes localStorageDocumentType

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
            title: 'Match Score', dataIndex: 'match_score', key: 'match_score',
            render: (score) => (
                <Space size="small">
                    {getMatchStatusIcon(score)}
                    <span>{score ? score.toFixed(2) : 0}%</span>
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

    const prepareValidationData = () => {
        console.log("prepareValidationData called");
        try {
            if (documentData?.validationResults) {
                console.log("documentData.validationResults exists:", documentData.validationResults);
                const validationResults = documentData.validationResults;
                console.log("validationResults", validationResults);
                const preparedData = Object.entries(validationResults?.validation_results || {}).map(([field, data], index) => {
                    console.log("Mapping over validation results field:", field, data);
                    return {
                        key: index,
                        field: field.replace(/_/g, ' ').toUpperCase(),
                        expected: data?.expected,
                        extracted: data?.extracted,
                        match_score: data?.match_score,
                    };
                });
                console.log("prepareValidationData preparedData:", preparedData);
                return preparedData;
            }
            console.log("No validationResults, returning empty array");
            return [];
        } catch (error) {
            console.error("Error processing validationResults:", error);
            return [];
        } finally {
            console.log("prepareValidationData finished");
        }
    };

    const prepareQualityData = () => {
        console.log("prepareQualityData called");
        try {
            if (documentData?.qualityResults) {
                console.log("documentData.qualityResults exists:", documentData.qualityResults);
                const qualityResults = documentData.qualityResults;
                console.log("qualityResults", qualityResults);
                const preparedData = Object.entries(qualityResults?.qualityAnalysis || {}).map(([field, data], index) => {
                    console.log("Mapping over quality analysis field:", field, data);
                    const scoreKey = Object.keys(data).find((key) => key.includes('Score'));
                    const score = data?.[scoreKey];
                    return {
                        key: index,
                        aspect: field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
                        score: score,
                        insight: data?.detailedInsight,
                        recommendation: data?.recommendations || 'None provided',
                    };
                });
                console.log("prepareQualityData preparedData:", preparedData);
                return preparedData;
            }
            console.log("No qualityResults, returning empty array");
            return [];
        } catch (error) {
            console.error("Error processing qualityResults:", error);
            return [];
        } finally {
            console.log("prepareQualityData finished");
        }
    };

    const prepareForgeryData = () => {
        console.log("prepareForgeryData called");
        try {
            if (documentData?.forgeryResults) {
                console.log("documentData.forgeryResults exists:", documentData.forgeryResults);
                const forgeryResults = documentData.forgeryResults;
                console.log("forgeryResults", forgeryResults);
                const preparedData = Object.entries(forgeryResults?.forgeryAnalysis || {}).filter(([key]) => key !== 'overallForgeryAssessment').map(([field, data], index) => {
                    console.log("Mapping over forgery analysis field:", field, data);
                    const scoreKey = Object.keys(data).find((key) => key.includes('Score'));
                    const score = data?.[scoreKey];
                    return {
                        key: index,
                        aspect: field.replace(/([A-Z])/g, ' $1').replace(/Analysis$/, '').replace(/^./, (str) => str.toUpperCase()),
                        score: score,
                        riskLevel: forgeryResults.forgeryAnalysis.overallForgeryAssessment.finalForgeryRiskScore <= 0.3 ? 'Low Risk' : forgeryResults.forgeryAnalysis.overallForgeryAssessment.finalForgeryRiskScore <= 0.7 ? 'Medium Risk' : 'High Risk',
                        insight: data?.detailedInsight,
                    };
                });
                console.log("prepareForgeryData preparedData:", preparedData);
                return preparedData;
            }
            console.log("No forgeryResults, returning empty array");
            return [];
        } catch (error) {
            console.error("Error processing forgeryResults:", error);
            return [];
        } finally {
            console.log("prepareForgeryData finished");
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Spin size="large" tip="Loading document insights..." />
        </div>;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    if (!documentData) {
        return <Alert message="No Data" description="No document data available." type="warning" showIcon />;
    }

    const validationData = prepareValidationData();
    const qualityData = prepareQualityData();
    const forgeryData = prepareForgeryData();

    // Get safe values for all fields that might be undefined
    const riskLevel = documentData?.riskLevel || 'LOW';
    const decision = documentData?.decision || 'UNKNOWN';
    const nextSteps = documentData?.nextSteps || 'No next steps provided';
    const remarks = documentData?.remarks || 'No remarks provided';
    const finalRiskScore = documentData?.finalRiskScore || 0;
    const documentTypeDisplay = documentData?.ocrResults?.structured_data?.document_type || documentType || 'Unknown';

    // Calculate quality score safely
    const qualityScore = documentData?.qualityResults?.finalQualityScore || 0;
    const qualityDecision = documentData?.qualityResults?.decision || 'UNKNOWN';

    // Calculate validation score safely
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
                    <Col span={15}>
                        <Title level={3}><FileTextOutlined /> Document Verification Report</Title>
                        <Descriptions bordered column={1} size="small" style={{ marginBottom: '16px' }}>
                            <Descriptions.Item label="Processing Status"><Tag color="green"><CheckOutlined /> Completed</Tag></Descriptions.Item>
                        </Descriptions>

                        <Card style={{
                            marginTop: '8px',
                            backgroundColor: riskAssessmentColor,
                            borderColor: riskAssessmentColor,
                            padding: '8px'
                        }}>
                            <Statistic title="Final Risk Assessment" value={riskLevel}
                                valueStyle={{ color: riskAssessmentTextColor }}
                                prefix={riskLevel === "LOW" ? <CheckCircleOutlined /> : riskLevel === "MEDIUM" ? <ExclamationCircleOutlined /> : <CloseCircleOutlined />} />
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
                    <Col span={9} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Card
                            style={{
                                width: '100%',
                                marginBottom: '8px',
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #e6f7ff, #bae7ff)',
                                borderLeft: '4px solid #1890ff'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <FileTextOutlined style={{ fontSize: '18px', marginRight: '8px', color: '#1890ff' }} />
                                <Title level={4} style={{ margin: '0', color: '#1890ff', textTransform: 'uppercase' }}>{documentTypeDisplay}</Title>
                            </div>
                            <Text type="secondary">Government-issued Identity Document</Text>
                        </Card>
                        <Card
                            title={<span><FileImageOutlined /> Document Preview</span>}
                            style={{
                                width: '100%',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                            }}
                            headStyle={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '12px',
                                background: '#f9f9f9',
                                borderRadius: '4px'
                            }}>
                                {imageURL ? (
                                    <Image
                                        width={180}
                                        src={imageURL}
                                        alt="Document Preview"
                                        style={{ border: '1px solid #d9d9d9', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                                    />
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center' }}>
                                        {imageError ?
                                            <Alert message={imageError} type="error" showIcon /> :
                                            <Spin tip="Loading preview..." />
                                        }
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                <Text type="secondary">Secure document • Verified <CheckCircleOutlined style={{ color: 'green' }} /></Text>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Card>

            <Divider style={{ margin: '8px 0' }} />

            <Card title={<Title level={4}><ScanOutlined /> OCR & Extracted Data</Title>} style={{ marginBottom: '12px' }}>
                <Alert message="OCR Provider: Gemini Vision Pro API" type="info" showIcon style={{ marginBottom: '8px' }} />
                <Row gutter={[8, 8]}>
                    {documentData?.ocrResults?.structured_data ? Object.entries(documentData.ocrResults.structured_data)
                        .filter(([key]) => key !== 'raw_text' && key !== 'document_type')
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
                <Card bordered={false} style={{ backgroundColor: getRiskColor(forgeryRiskScore) === 'green' ? '#f6ffed' : getRiskColor(forgeryRiskScore) === 'orange' ? '#fffbe6' : '#fff2f0' }}>
                    <Row align="middle">
                        <Col span={8}>
                            <Progress
                                type="dashboard"
                                percent={(forgeryRiskScore * 100).toFixed(0)}
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

export default DocumentInsight;