import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Typography,
    Divider,
    Tag,
    Progress,
    Table,
    Space,
    Descriptions,
    Collapse,
    Statistic,
    Alert,
    Timeline,
    Button,
    Tooltip,
    Modal
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    SoundOutlined,
    SafetyOutlined,
    AudioOutlined,
    AuditOutlined,
    CheckOutlined,
    PhoneOutlined,
    DownloadOutlined,
    PrinterOutlined,
    ShareAltOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const AudioInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/audio/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Text>Loading audio insights...</Text>
        </div>
    );

    if (error) return (
        <Alert
            message="Error"
            description={`Failed to load audio insights:${error}`}
            type="error"
            showIcon
        />
    );

    if (!data) return <div>No data available</div>;

    // Parse the audio analysis JSON string
    const audioAnalysis = data.audioAnalysis?.output ? JSON.parse(data.audioAnalysis.output) : null;

    // Helper functions for status colors
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'accept': return 'green';
            case 'reject': return 'red';
            case 'pending': return 'orange';
            default: return 'blue';
        }
    };

    const getQualityColor = (quality) => {
        switch (quality?.toLowerCase()) {
            case 'excellent': return 'green';
            case 'good': return 'green';
            case 'fair': return 'orange';
            case 'poor': return 'red';
            default: return 'blue';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 0.8) return 'green';
        if (score >= 0.6) return 'orange';
        return 'red';
    };

    // Helper function to get status icon
    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'accept': return <CheckCircleOutlined />;
            case 'reject': return <CloseCircleOutlined />;
            case 'pending': return <ExclamationCircleOutlined />;
            default: return <CheckOutlined />;
        }
    };

    // Table columns for field-by-field scores
    const scoreColumns = [
        {
            title: 'Field',
            dataIndex: 'field',
            key: 'field',
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            render: (score) => {
                const percentValue = score * 100; // Calculate percent first

                // Debugging: Log the score and calculated percent
                console.log("Score value:", score, typeof score);
                console.log("Percent value (before format):", percentValue, typeof percentValue);

                return (
                    <Progress
                        percent={percentValue.toFixed(0)} //Use percentValue here instead of trying to pass it in format prop
                        size="small"
                        status={score >= 0.8 ? "success" : score >= 0.6 ? "normal" : "exception"}

                    />
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Tag color={getScoreColor(record.score)}>
                    {record.score >= 0.8 ? 'Good' : record.score >= 0.6 ? 'Fair' : 'Poor'}
                </Tag>
            ),
        },
    ];

    // Prepare data for field-by-field scores table
    const scoreData = Object.entries(data.fieldByFieldScores).map(([field, score], index) => ({
        key: index,
        field: field.replace(/_/g, ' ').toUpperCase(),
        score: score,
    }));

    // Audio quality data for table
    const qualityData = audioAnalysis ? [
        {
            key: 1,
            aspect: 'SNR (Signal-to-Noise Ratio)',
            score: audioAnalysis.snr_value / 100,
            grade: audioAnalysis.snr_grade,
            details: `Value: ${audioAnalysis.snr_value.toFixed(2)} dB`
        },
        {
            key: 2,
            aspect: 'Volume Fluctuation',
            score: 1 - audioAnalysis.fluctuation_score,
            grade: audioAnalysis.fluctuation_level,
            details: `Score: ${audioAnalysis.fluctuation_score.toFixed(2)}`
        }
    ] : [];

    const qualityColumns = [
        {
            title: 'Aspect',
            dataIndex: 'aspect',
            key: 'aspect',
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            render: (score) => {
                const percentValue = score * 100; // Calculate percent first

                // Debugging: Log the score and calculated percent
                console.log("Score value:", score, typeof score);
                console.log("Percent value (before format):", percentValue, typeof percentValue);

                return (
                    <Progress
                        percent={percentValue.toFixed(0)} //Use percentValue here instead of trying to pass it in format prop
                        size="small"
                        status={score >= 0.8 ? "success" : score >= 0.6 ? "normal" : "exception"}

                    />
                );
            },
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (grade) => (
                <Tag color={getQualityColor(grade)}>
                    {grade}
                </Tag>
            ),
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
        },
    ];

    // Generate report summary
    const getReportSummary = () => {
        const verificationStatus = data.status.toUpperCase();
        const confidenceScore = (data.overallScore * 100).toFixed(0);

        if (verificationStatus === 'ACCEPT') {
            return `Verification ACCEPTED with ${confidenceScore}% confidence.All critical fields have passed verification requirements.`;
        } else if (verificationStatus === 'PENDING') {
            return `Verification is PENDING with ${confidenceScore}% confidence.Additional information is required for final verification.`;
        } else {
            return `Verification REJECTED with ${confidenceScore}% confidence.Please review the critical fields that failed to meet requirements.`;
        }
    };

    // Mock function to handle report download
    const handleDownloadReport = () => {
        console.log('Downloading report for ID:', data.uuid);
        // In a real application, this would trigger a download of the report
    };

    // Mock function to handle print
    const handlePrintReport = () => {
        window.print();
    };

    // Show summary report modal
    const showReportModal = () => {
        setReportModalVisible(true);
    };

    const handleOk = () => {
        setReportModalVisible(false);
    };

    const handleCancel = () => {
        setReportModalVisible(false);
    };

    return (
        <div className="audio-insight-container" style={{ padding: '24px' }}>
            {/* Header with actions */}
            <Card>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2}>Audio Verification Report</Title>
                        <Text type="secondary">ID: {data.uuid}</Text>
                    </Col>
                    <Col>
                        <Space>
                            <Tooltip title="View Summary Report">
                                <Button
                                    icon={<InfoCircleOutlined />}
                                    onClick={showReportModal}
                                >
                                    Summary
                                </Button>
                            </Tooltip>
                            <Tooltip title="Download Report">
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={handleDownloadReport}
                                >
                                    Download
                                </Button>
                            </Tooltip>
                            <Tooltip title="Print Report">
                                <Button
                                    icon={<PrinterOutlined />}
                                    onClick={handlePrintReport}
                                >
                                    Print
                                </Button>
                            </Tooltip>
                            <Tooltip title="Share Report">
                                <Button
                                    icon={<ShareAltOutlined />}
                                >
                                    Share
                                </Button>
                            </Tooltip>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Divider />

            {/* Audio Summary Section */}
            <Card className="summary-card">
                <Row>
                    <Col span={16}>
                        <Title level={2}>
                            <PhoneOutlined /> Audio Call Verification Report
                        </Title>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Audio ID" span={2}>
                                <Text copyable>{data.uuid}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Reference Name">
                                {data.referenceName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Subject Name">
                                {data.subjectName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Relation">
                                {data.relationToSubject}
                            </Descriptions.Item>
                            <Descriptions.Item label="Subject Occupation">
                                {data.subjectOccupation}
                            </Descriptions.Item>
                            <Descriptions.Item label="Subject Address">
                                {data.subjectAddress}
                            </Descriptions.Item>
                        </Descriptions>

                        <Card style={{
                            marginTop: '16px',
                            backgroundColor: getStatusColor(data.status) === 'green' ? '#f6ffed' :
                                getStatusColor(data.status) === 'orange' ? '#fffbe6' : '#fff2f0'
                        }}>
                            <Statistic
                                title="Verification Status"
                                value={data.status.toUpperCase()}
                                valueStyle={{
                                    color: getStatusColor(data.status)
                                }}
                                prefix={getStatusIcon(data.status)}
                            />
                            <Divider style={{ margin: '12px 0' }} />
                            <Row>
                                <Col span={12}>
                                    <Statistic
                                        title="Overall Score"
                                        value={`${(data.overallScore * 100).toFixed(0)}%`}
                                        valueStyle={{
                                            color: getScoreColor(data.overallScore)
                                        }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Text strong>Subject Address:</Text> <Text>{data.subjectAddress}</Text>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <Card title="Audio Quality" style={{ width: '100%' }}>
                            {audioAnalysis && (
                                <div style={{ textAlign: 'center' }}>
                                    <Progress
                                        type="dashboard"
                                        percent={100}
                                        format={() => (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontSize: '14px' }}>Quality</span>
                                                <span style={{
                                                    fontSize: '16px',
                                                    fontWeight: 'bold',
                                                    color: getQualityColor(audioAnalysis.overall_quality)
                                                }}>
                                                    {audioAnalysis.overall_quality}
                                                </span>
                                            </div>
                                        )}
                                        strokeColor={getQualityColor(audioAnalysis.overall_quality)}
                                    />
                                    <div style={{ marginTop: '16px' }}>
                                        <AudioOutlined style={{ fontSize: '32px', color: getQualityColor(audioAnalysis.overall_quality) }} />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Card>

            <Divider />

            {/* Audio Quality Analysis Section */}
            <Card
                className="quality-card"
                title={
                    <Title level={3}>
                        <SoundOutlined /> Audio Quality Analysis
                    </Title>
                }
                style={{ marginTop: '24px' }}
            >
                <Alert
                    message="Audio Quality Assessment"
                    description={`The overall audio quality is ${audioAnalysis?.overall_quality || 'Unknown'}, making this recording ${audioAnalysis?.overall_quality === 'Good' ? 'suitable' : 'potentially challenging'} for verification purposes.`}
                    type={getQualityColor(audioAnalysis?.overall_quality) === 'green' ? "success" : getQualityColor(audioAnalysis?.overall_quality) === 'orange' ? "warning" : "error"}
                    showIcon
                    style={{ marginBottom: '16px' }}
                />

                <Table
                    dataSource={qualityData}
                    columns={qualityColumns}
                    pagination={false}
                    bordered
                />
            </Card>

            <Divider />

            {/* Transcript Section */}
            <Card
                className="transcript-card"
                title={
                    <Title level={3}>
                        <FileTextOutlined /> Call Transcript
                    </Title>
                }
                style={{ marginTop: '24px' }}
            >
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="View Complete Transcript" key="1">
                        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                            {data.transcript.map((line, index) => (
                                <div key={index} style={{ marginBottom: '12px', padding: '8px', backgroundColor: index % 2 === 0 ? '#f0f0f0' : 'white', borderRadius: '4px' }}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    </Panel>
                </Collapse>
            </Card>

            <Divider />

            {/* Verification Section */}
            <Card
                className="verification-card"
                title={
                    <Title level={3}>
                        <AuditOutlined /> Verification & Data Cross-Check
                    </Title>
                }
                style={{ marginTop: '24px' }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card bordered={false} style={{
                            backgroundColor: getScoreColor(data.overallScore) === 'green' ? '#f6ffed' :
                                getScoreColor(data.overallScore) === 'orange' ? '#fffbe6' : '#fff2f0'
                        }}>
                            <Row align="middle">
                                <Col span={8}>
                                    <Progress
                                        type="dashboard"
                                        percent={(data.overallScore * 100).toFixed(0)}
                                        status={data.overallScore >= 0.8 ? "success" : data.overallScore >= 0.6 ? "normal" : "exception"}
                                        strokeColor={getScoreColor(data.overallScore)}
                                    />
                                </Col>
                                <Col span={16}>
                                    <Statistic
                                        title="Overall Verification Score"
                                        value={`${(data.overallScore * 100).toFixed(0)}%`}
                                        valueStyle={{
                                            color: getScoreColor(data.overallScore),
                                            fontSize: '28px'
                                        }}
                                    />
                                    <Paragraph style={{ marginTop: '8px' }}>
                                        This score represents the overall verification confidence based on the cross-checking
                                        of various data points extracted from the audio call.
                                    </Paragraph>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Table
                            dataSource={scoreData}
                            columns={scoreColumns}
                            pagination={false}
                            bordered
                            style={{ marginTop: '16px' }}
                        />
                    </Col>
                </Row>
            </Card>

            <Divider />
            <Modal
                title="Summary Report"
                visible={reportModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Return
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleOk}>
                        Okay
                    </Button>,
                ]}
            >
                <p>{getReportSummary()}</p>
            </Modal>

            {/* Final Verification Section */}
            <Card
                className="final-verification-card"
                title={
                    <Title level={3}>
                        <SafetyOutlined /> Final Verification
                    </Title>
                }
                style={{ marginTop: '24px', marginBottom: '24px' }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card bordered={false} style={{
                            backgroundColor: getStatusColor(data.status) === 'green' ? '#f6ffed' :
                                getStatusColor(data.status) === 'orange' ? '#fffbe6' : '#fff2f0'
                        }}>
                            <Row>
                                <Col span={8} style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Progress
                                        type="dashboard"
                                        percent={(data.overallScore * 100).toFixed(0)}
                                        format={() => (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontSize: '12px' }}>Confidence</span>
                                                <span style={{
                                                    fontSize: '16px',
                                                    fontWeight: 'bold',
                                                    color: getStatusColor(data.status)
                                                }}>
                                                    {data.status}
                                                </span>
                                            </div>
                                        )}
                                        strokeColor={getStatusColor(data.status)}
                                    />
                                </Col>
                                <Col span={16}>
                                    <Statistic
                                        title="Verification Status"
                                        value={data.status.toUpperCase()}
                                        valueStyle={{
                                            color: getStatusColor(data.status),
                                            fontSize: '28px'
                                        }}
                                    />
                                    <Divider style={{ margin: '12px 0' }} />
                                    <Title level={5}>Summary:</Title>
                                    <Timeline>
                                        <Timeline.Item color={getScoreColor(data.fieldByFieldScores.reference_name)}>
                                            Reference Name: {(data.fieldByFieldScores.reference_name * 100).toFixed(1)}%
                                        </Timeline.Item>
                                        <Timeline.Item color={getScoreColor(data.fieldByFieldScores.subject_name)}>
                                            Subject Name: {(data.fieldByFieldScores.subject_name * 100).toFixed(0)}%
                                        </Timeline.Item>
                                        <Timeline.Item color={getScoreColor(data.fieldByFieldScores.subject_address)}>
                                            Subject Address: {(data.fieldByFieldScores.subject_address * 100).toFixed(0)}%
                                        </Timeline.Item>
                                        <Timeline.Item color={getScoreColor(data.fieldByFieldScores.relation_to_subject)}>
                                            Relation to Subject: {(data.fieldByFieldScores.relation_to_subject * 100).toFixed(0)}%
                                        </Timeline.Item>
                                        <Timeline.Item color={getScoreColor(data.fieldByFieldScores.subject_occupation)}>
                                            Subject Occupation: {(data.fieldByFieldScores.subject_occupation * 100).toFixed(0)}%
                                        </Timeline.Item>
                                        <Timeline.Item color={getStatusColor(data.status)}>
                                            <strong>Final Assessment: {data.status.toUpperCase()} - {(data.overallScore * 100).toFixed(0)}% Confidence</strong>
                                        </Timeline.Item>
                                    </Timeline>
                                    <Divider style={{ margin: '12px 0' }} />
                                    <Text strong>Explanation:</Text>
                                    <ul>
                                        {data.explanation.map((exp, index) => (
                                            <li key={index}><Text>{exp}</Text></li>
                                        ))}
                                    </ul>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default AudioInsights;