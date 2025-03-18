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
import { useParams } from 'react-router-dom'; // keep this import if u plan to use this soon

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
    //const { id } = useParams();  // We will comment this out for now

    // Hardcoded ID - Replace with your desired ID
    const hardcodedId = '4d7a8237-857a-49c0-94ce-b7905d0d959a';

    useEffect(() => {
        const fetchAudioData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/audio/${hardcodedId}`);
                setAudioData(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load audio data');
                setLoading(false);
            }
        };

        fetchAudioData();
    }, [hardcodedId]); // Removed id dependency, added hardcodedId

    useEffect(() => {
        if (audioData) {
            // Fix for audio path - using a public URL format that the browser can access
            // Note: This assumes the audio files are served by your application server
            audioRef.current = new Audio(`http://localhost:8080/audio-file/${hardcodedId}`);

            // Add event listeners
            audioRef.current.addEventListener('ended', () => setIsPlaying(false));
            audioRef.current.addEventListener('error', (e) => {
                console.error('Audio playback error:', e);
                setError('Failed to load audio file. Please check if the file exists and is accessible.');
            });

            return () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
                    audioRef.current.removeEventListener('error', () => { });
                }
            };
        }
    }, [audioData, hardcodedId]); // Removed id dependency, added hardcodedId

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
                        setError("Failed to play audio. Please check your audio settings.");
                    });
            }
        }
        setIsPlaying(!isPlaying);
    };

    const toggleTranscript = () => {
        setShowTranscript(!showTranscript);
    };

    // Convert transcript array to a more structured format
    const parseTranscript = (transcriptArray) => {
        if (!transcriptArray) return [];

        return transcriptArray.map(item => {
            // Parse the string to extract values
            const startMatch = item.match(/start_time=([^,}]+)/);
            const endMatch = item.match(/end_time=([^,}]+)/);
            const speakerMatch = item.match(/speaker=([^,}]+)/);
            const textMatch = item.match(/text=([^}]+)}/);

            return {
                startTime: startMatch ? parseFloat(startMatch[1]) : 0,
                endTime: endMatch ? parseFloat(endMatch[1]) : 0,
                speaker: speakerMatch ? speakerMatch[1] : '',
                text: textMatch ? textMatch[1] : ''
            };
        });
    };

    // Prepare field comparison data
    const prepareFieldComparison = () => {
        if (!audioData) return [];

        return [
            {
                field: 'Reference Name',
                extracted: audioData.referenceName,
                expected: audioData.referenceName, // Assuming ground truth is the same for simplicity
                score: audioData.fieldByFieldScores.reference_name,
                explanation: audioData.explanation[0]
            },
            {
                field: 'Subject Name',
                extracted: audioData.subjectName,
                expected: 'Matthew', // Based on the explanation
                score: audioData.fieldByFieldScores.subject_name,
                explanation: audioData.explanation[1]
            },
            {
                field: 'Subject Address',
                extracted: audioData.subjectAddress,
                expected: 'Pattimatham, Ernakulam', // Based on the explanation
                score: audioData.fieldByFieldScores.subject_address,
                explanation: audioData.explanation[2]
            },
            {
                field: 'Relation to Subject',
                extracted: audioData.relationToSubject,
                expected: 'work together', // Based on the explanation
                score: audioData.fieldByFieldScores.relation_to_subject,
                explanation: audioData.explanation[3]
            },
            {
                field: 'Subject Occupation',
                extracted: audioData.subjectOccupation,
                expected: 'unemployed', // Based on the explanation
                score: audioData.fieldByFieldScores.subject_occupation,
                explanation: audioData.explanation[4]
            }
        ];
    };

    // Define score color function
    const getScoreColor = (score) => {
        if (score >= 0.8) return '#52c41a';
        if (score >= 0.6) return '#faad14';
        return '#f5222d';
    };

    // Format time for transcript
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
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
                        percent={Math.round(score * 100)}
                        size="small"
                        strokeColor={getScoreColor(score)}
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

    const parsedTranscript = parseTranscript(audioData.transcript);
    const fieldComparisonData = prepareFieldComparison();

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
                                        value={audioData.status.toUpperCase()}
                                        valueStyle={{ color: statusColor[audioData.status] === 'success' ? '#52c41a' : '#f5222d' }}
                                        prefix={audioData.status === 'accept' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Overall Score"
                                        value={`${(audioData.overallScore * 100).toFixed(0)}%`}
                                        valueStyle={{ color: getScoreColor(audioData.overallScore) }}
                                    />
                                    <Progress
                                        percent={Math.round(audioData.overallScore * 100)}
                                        strokeColor={getScoreColor(audioData.overallScore)}
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
                                        value={audioData.audioAnalysis.snr_grade}
                                        valueStyle={{
                                            color: audioData.audioAnalysis.snr_grade === 'Good' ? '#52c41a' : '#faad14'
                                        }}
                                    />
                                    <Text type="secondary">{audioData.audioAnalysis.snr_value.toFixed(1)} dB</Text>
                                </Col>
                                <Col span={8}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ marginRight: '4px' }}>Fluctuation</span>
                                        <Tooltip title={fluctuationTooltip}>
                                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                                        </Tooltip>
                                    </div>
                                    <Statistic
                                        value={audioData.audioAnalysis.fluctuation_level}
                                        valueStyle={{
                                            color: audioData.audioAnalysis.fluctuation_level === 'Stable' ? '#52c41a' : '#faad14'
                                        }}
                                    />
                                    <Text type="secondary">{audioData.audioAnalysis.fluctuation_score.toFixed(2)}</Text>
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Overall Quality"
                                        value={audioData.audioAnalysis.overall_quality}
                                        valueStyle={{
                                            color: audioData.audioAnalysis.overall_quality === 'Good' ? '#52c41a' : '#faad14'
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