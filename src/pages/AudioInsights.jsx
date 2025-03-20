import React, { useState, useEffect, useRef } from 'react';
import {
    Layout,
    Card,
    Button,
    Typography,
    Row,
    Col,
    Divider,
    Table,
    Progress,
    Tag,
    Space,
    Collapse,
    Tooltip,
    Statistic
} from 'antd';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    FileTextOutlined,
    SoundOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const AudioInsights = () => {
    const [audioData, setAudioData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTranscript, setShowTranscript] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchAudioData = async () => {
            try {
                // Directly fetch the audio data using the audio ID.  No need to go through /users
                const response = await axios.get(`http://localhost:8080/audio/${id}`);

                if (response.data) {
                    setAudioData(response.data);
                } else {
                    setError('No audio data found for this ID');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching audio data:', err);
                setError('Failed to load audio data');
                setLoading(false);
            }
        };

        fetchAudioData();
    }, [id]);

    useEffect(() => {
        if (audioData && audioData.uuid) { // Check for uuid instead of id, and ensure audioData exists
            // Construct audio URL using the uuid
            audioRef.current = new Audio(`http://localhost:8080/audio/audio-file/${audioData.uuid}`);

            // Add event listeners
            audioRef.current.addEventListener('ended', () => setIsPlaying(false));
            audioRef.current.addEventListener('error', (e) => {
                console.error('Audio playback error:', e);
                setError(`Failed to load audio file. Please check if the file exists and is accessible. ${e.message}`);
            });

            return () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
                    audioRef.current.removeEventListener('error', () => { });
                }
            };
        }
    }, [audioData]);  // Correct dependency array

    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Add error handling for audio play
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .catch(error => {
                        console.error("Audio playback failed:", error);
                        setError(`Failed to play audio. Please check your audio settings. ${error.message}`);
                    });
            }
        }
        setIsPlaying(!isPlaying);
    };

    const toggleTranscript = () => {
        setShowTranscript(!showTranscript);
    };

    // Format time for transcript
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    };

    // Prepare field comparison data
    const prepareFieldComparison = () => {
        if (!audioData?.llmExtraction?.extracted_result) return [];  // Null check

        return [
            {
                field: 'Reference Name',
                extracted: audioData.llmExtraction.extracted_result.reference_name || 'N/A',
                expected: audioData.llmExtraction.extracted_result.reference_name || 'N/A',
                score: audioData.llmExtraction.scoring_results?.field_by_field_scores?.reference_name || 0,
                explanation: audioData.llmExtraction.scoring_results?.explanation?.reference_name || 'No explanation available'
            },
            {
                field: 'Subject Name',
                extracted: audioData.llmExtraction.extracted_result.subject_name || 'N/A',
                expected: audioData.llmExtraction.extracted_result.subject_name || 'N/A',
                score: audioData.llmExtraction.scoring_results?.field_by_field_scores?.subject_name || 0,
                explanation: audioData.llmExtraction.scoring_results?.explanation?.subject_name || 'No explanation available'
            },
            {
                field: 'Subject Address',
                extracted: audioData.llmExtraction.extracted_result.subject_address || 'N/A',
                expected: audioData.llmExtraction.extracted_result.subject_address || 'N/A',
                score: audioData.llmExtraction.scoring_results?.field_by_field_scores?.subject_address || 0,
                explanation: audioData.llmExtraction.scoring_results?.explanation?.subject_address || 'No explanation available'
            },
            {
                field: 'Relation to Subject',
                extracted: audioData.llmExtraction.extracted_result.relation_to_subject || 'N/A',
                expected: audioData.llmExtraction.extracted_result.relation_to_subject || 'N/A',
                score: audioData.llmExtraction.scoring_results?.field_by_field_scores?.relation_to_subject || 0,
                explanation: audioData.llmExtraction.scoring_results?.explanation?.relation_to_subject || 'No explanation available'
            },
            {
                field: 'Subject Occupation',
                extracted: audioData.llmExtraction.extracted_result.subject_occupation || 'N/A',
                expected: audioData.llmExtraction.extracted_result.subject_occupation || 'N/A',
                score: audioData.llmExtraction.scoring_results?.field_by_field_scores?.subject_occupation || 0,
                explanation: audioData.llmExtraction.scoring_results?.explanation?.subject_occupation || 'No explanation available'
            }
        ];
    };

    // Define score color function
    const getScoreColor = (score) => {
        if (score >= 0.8) return '#52c41a';
        if (score >= 0.6) return '#faad14';
        return '#f5222d';
    };

    const statusColor = {
        accept: 'success',
        reject: 'error',
        pending: 'warning'
    };

    if (loading) return <div>Loading audio insights...</div>;
    if (error) return <div>{error}</div>;

    const columns = [
        {
            title: 'Field',
            dataIndex: 'field',
            key: 'field',
            width: '15%'
        },
        {
            title: 'Extracted Value',
            dataIndex: 'extracted',
            key: 'extracted',
            width: '20%'
        },
        {
            title: 'Expected Value',
            dataIndex: 'expected',
            key: 'expected',
            width: '20%'
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            width: '15%',
            render: (score) => (
                <Space>
                    <Progress
                        percent={Math.round((score || 0) * 100)}
                        size="small"
                        strokeColor={getScoreColor(score || 0)}
                        style={{ width: 80 }}
                        format={percent => percent === 100 ? '100' : `${percent}`} // Remove % sign for 100%
                    />
                </Space>
            )
        },
        {
            title: 'Explanation',
            dataIndex: 'explanation',
            key: 'explanation',
            width: '30%'
        }
    ];

    // Use the transcript data from audioData.llmExtraction.transcript
    const parsedTranscript = audioData?.llmExtraction?.transcript?.map((entry, index) => ({
        startTime: entry.start_time || 0,
        endTime: entry.end_time || 0,
        speaker: entry.speaker || 'UNKNOWN',
        text: entry.text || 'N/A'
    })) || [];

    const fieldComparisonData = prepareFieldComparison();

    // Audio analysis data is directly available in audioData.audioAnalysis
    const snrValue = audioData?.audioAnalysis?.snr_value !== undefined ? audioData.audioAnalysis.snr_value : 0;
    const fluctuationScore = audioData?.audioAnalysis?.fluctuation_score !== undefined ? audioData.audioAnalysis.fluctuation_score : 0;

    // SNR tooltip info
    const snrTooltip = "Signal-to-Noise Ratio (SNR) measures the level of desired audio signal compared to background noise. Higher values (measured in dB) indicate clearer audio with less noise.";

    // Fluctuation tooltip info
    const fluctuationTooltip = "Fluctuation score measures the stability of audio signal strength throughout the recording. Lower values indicate more consistent audio levels with fewer volume variations.";

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <SoundOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#1890ff' }} />
                    <Title level={3} style={{ margin: 0 }}>Audio Insights</Title>
                </div>
                <Space>
                    <Button
                        type="primary"
                        icon={<FileTextOutlined />}
                        onClick={toggleTranscript}
                    >
                        {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                    </Button>
                    <Button
                        type={isPlaying ? 'default' : 'primary'}
                        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        onClick={togglePlayPause}
                    >
                        {isPlaying ? 'Pause Audio' : 'Play Audio'}
                    </Button>
                </Space>
            </Header>
            <Content style={{ padding: '24px', overflow: 'auto' }}>
                <Row gutter={[24, 24]}>
                    {/* Status and Score Card */}
                    <Col xs={24} md={12}>
                        <Card title="Verification Status" bordered={false}>
                            <Row gutter={[16, 16]} align="middle">
                                <Col span={12}>
                                    <Statistic
                                        title="Status"
                                        value={(audioData?.llmExtraction?.status || 'pending').toUpperCase()}
                                        valueStyle={{
                                            color: statusColor[audioData?.llmExtraction?.status || 'pending'] === 'success'
                                                ? '#52c41a'
                                                : statusColor[audioData?.llmExtraction?.status || 'pending'] === 'error'
                                                    ? '#f5222d'
                                                    : '#faad14'
                                        }}
                                        prefix={audioData?.llmExtraction?.status === 'accept'
                                            ? <CheckCircleOutlined />
                                            : audioData?.llmExtraction?.status === 'reject'
                                                ? <CloseCircleOutlined />
                                                : <InfoCircleOutlined />
                                        }
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Overall Score"
                                        value={`${Math.round((audioData?.llmExtraction?.scoring_results?.overall_score || 0) * 100)}%`}
                                        valueStyle={{ color: getScoreColor(audioData?.llmExtraction?.scoring_results?.overall_score || 0) }}
                                    />
                                    <Progress
                                        percent={Math.round((audioData?.llmExtraction?.scoring_results?.overall_score || 0) * 100)}
                                        strokeColor={getScoreColor(audioData?.llmExtraction?.scoring_results?.overall_score || 0)}
                                        showInfo={false}
                                        style={{ marginTop: 8 }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Audio Analysis Card */}
                    <Col xs={24} md={12}>
                        <Card title="Audio Quality Analysis" bordered={false}>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ marginRight: '4px' }}>SNR</span>
                                        <Tooltip title={snrTooltip}>
                                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                                        </Tooltip>
                                    </div>
                                    <Statistic
                                        value={audioData?.audioAnalysis?.snr_grade || 'N/A'}
                                        valueStyle={{
                                            color: (audioData?.audioAnalysis?.snr_grade === 'Good') ? '#52c41a' : '#faad14'
                                        }}
                                    />
                                    <Text type="secondary">{snrValue.toFixed(1)} dB</Text>
                                </Col>
                                <Col span={8}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ marginRight: '4px' }}>Fluctuation</span>
                                        <Tooltip title={fluctuationTooltip}>
                                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                                        </Tooltip>
                                    </div>
                                    <Statistic
                                        value={audioData?.audioAnalysis?.fluctuation_level || 'N/A'}
                                        valueStyle={{
                                            color: (audioData?.audioAnalysis?.fluctuation_level === 'Stable') ? '#52c41a' : '#faad14'
                                        }}
                                    />
                                    <Text type="secondary">{fluctuationScore.toFixed(2)}</Text>
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Overall Quality"
                                        value={audioData?.audioAnalysis?.overall_quality || 'N/A'}
                                        valueStyle={{
                                            color: (audioData?.audioAnalysis?.overall_quality === 'Good') ? '#52c41a' : '#faad14'
                                        }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Transcript Card (conditionally rendered) */}
                    {showTranscript && (
                        <Col span={24}>
                            <Card title="Call Transcript" bordered={false}>
                                <Collapse defaultActiveKey={['0']}>
                                    {parsedTranscript.map((entry, index) => (
                                        <Panel
                                            header={
                                                <Space>
                                                    <Text strong>{formatTime(entry.startTime)}</Text>
                                                    <Tag color={entry.speaker === 'SPEAKER_00' ? 'blue' : 'green'}>
                                                        {entry.speaker === 'SPEAKER_00' ? 'Agent' : 'Reference'}
                                                    </Tag>
                                                    <Text>{entry.text}</Text>
                                                </Space>
                                            }
                                            key={index}
                                        >
                                            <p><strong>Start Time:</strong> {entry.startTime}s</p>
                                            <p><strong>End Time:</strong> {entry.endTime}s</p>
                                            <p><strong>Speaker ID:</strong> {entry.speaker}</p>
                                            <p><strong>Text:</strong> {entry.text}</p>
                                        </Panel>
                                    ))}
                                </Collapse>
                            </Card>
                        </Col>
                    )}

                    {/* Field Comparison Table */}
                    <Col span={24}>
                        <Card
                            title={
                                <Space>
                                    <span>Field Extraction Analysis</span>
                                    <Tooltip title="This shows how accurately each field was extracted from the audio transcript.">
                                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                                    </Tooltip>
                                </Space>
                            }
                            bordered={false}
                        >
                            <Table
                                columns={columns}
                                dataSource={fieldComparisonData}
                                pagination={false}
                                rowKey="field"
                                bordered
                            />
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default AudioInsights;