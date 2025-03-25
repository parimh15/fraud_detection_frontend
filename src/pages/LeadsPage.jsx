import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Typography,
    List,
    Space,
    Tag,
    Drawer,
    Form,
    Input,
    DatePicker,
    Select,
    message,
    Row,
    Col,
    Empty,
    Spin,
    Avatar
} from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    PlusOutlined,
    IdcardOutlined
} from '@ant-design/icons';
import { useNavigate, useOutletContext } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const LeadsPage = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { agentId } = useOutletContext(); // Access agentId from context
    const API_BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        fetchLeads();
    }, [agentId]); // Fetch leads whenever agentId changes

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/leads/agent/${agentId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setLeads(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leads:', error);
            message.error('Failed to load leads. Please try again.');
            setLoading(false);
        }
    };

    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        form.resetFields();
    };

    const handleViewLead = (leadId) => {
        navigate(`/risk-assessment/${leadId}`);
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const dob = values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null;
            const payload = {
                agentId: agentId, // Use agentId from context
                name: values.name,
                email: values.email,
                dob: dob,
                gender: values.gender,
                fatherName: values.fatherName,
                adharNumber: values.adharNumber,
                panNumber: values.panNumber,
                referenceName: values.referenceName,
                relationToSubject: values.relationToSubject,
                subjectOccupation: values.subjectOccupation,
                subjectAddress: values.subjectAddress, // Use subjectAddress from form
                phoneNumber: values.phoneNumber
            };

            const response = await fetch(`${API_BASE_URL}/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newLead = await response.json();
            message.success('Lead created successfully!');
            closeDrawer();
            fetchLeads();
        } catch (error) {
            console.error('Error creating lead:', error);
            message.error('Failed to create lead. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const getRandomColor = (id) => {
        const colors = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#faad14'];
        const index = id.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={2}>Lead Management Console</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={showDrawer}
                    loading={loading}
                >
                    Create New Lead
                </Button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : leads.length > 0 ? (
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 1,
                        md: 2,
                        lg: 3,
                        xl: 3,
                        xxl: 4,
                    }}
                    dataSource={leads}
                    renderItem={(lead) => (
                        <List.Item>
                            <Card
                                hoverable
                                onClick={() => handleViewLead(lead.id)}
                                style={{ borderRadius: '8px', height: '100%' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Avatar
                                        size={64}
                                        style={{ backgroundColor: getRandomColor(lead.id), marginRight: '16px' }}
                                    >
                                        {getInitials(lead.name)}
                                    </Avatar>
                                    <div>
                                        <Title level={4} style={{ margin: '0 0 8px 0' }}>{lead.name}</Title>
                                        <Tag color={lead.gender === 'MALE' ? 'blue' : 'pink'}>
                                            {lead.gender}
                                        </Tag>
                                        <Tag color="cyan">{lead.subjectOccupation}</Tag>
                                    </div>
                                </div>

                                <div style={{ marginTop: '16px' }}>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <div>
                                            <PhoneOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                            <Text>{lead.phoneNumber}</Text>
                                        </div>
                                        <div>
                                            <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                            <Text>{lead.email}</Text>
                                        </div>
                                        <div>
                                            <IdcardOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                            <Text>Aadhar: {lead.adharNumber.slice(0, 4) + 'xxxx' + lead.adharNumber.slice(-4)}</Text>
                                        </div>
                                        {/* REMOVED ADDRESS DISPLAY */}
                                    </Space>
                                </div>

                                <div style={{ marginTop: '16px' }}>
                                    <Text type="secondary">
                                        Created on {new Date(lead.createdAt).toLocaleDateString()}
                                    </Text>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            ) : (
                <Empty
                    description="No leads found. Create your first lead by clicking the button above."
                    style={{ margin: '100px 0' }}
                />
            )}

            {/* Create Lead Drawer */}
            <Drawer
                title="Create New Lead"
                width={720}
                onClose={closeDrawer}
                open={drawerVisible}
                bodyStyle={{ paddingBottom: 80 }}
                extra={
                    <Space>
                        <Button onClick={closeDrawer}>Cancel</Button>
                        <Button type="primary" onClick={() => form.submit()} loading={loading}>
                            Submit
                        </Button>
                    </Space>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        gender: 'MALE',
                        relationToSubject: 'SISTER',
                    }}
                >
                    <Title level={4}>Personal Information</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Full Name"
                                rules={[{ required: true, message: 'Please enter full name' }]}
                            >
                                <Input placeholder="Enter full name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Please enter a valid email' }
                                ]}
                            >
                                <Input placeholder="Enter email address" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="dob"
                                label="Date of Birth"
                                rules={[{ required: true, message: 'Please select date of birth' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="gender"
                                label="Gender"
                                rules={[{ required: true, message: 'Please select gender' }]}
                            >
                                <Select placeholder="Select gender">
                                    <Option value="MALE">Male</Option>
                                    <Option value="FEMALE">Female</Option>
                                    <Option value="OTHER">Other</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fatherName"
                                label="Father's Name"
                            >
                                <Input placeholder="Enter father's name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Phone Number"
                                rules={[{ required: true, message: 'Please enter phone number' }]}
                            >
                                <Input placeholder="Enter phone number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title level={4} style={{ marginTop: '24px' }}>Address Information</Title>
                    <Form.Item
                        name="subjectAddress"  //Corrected: name is subjectAddress
                        label="Subject Address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Enter Subject Address" />
                    </Form.Item>

                    <Title level={4} style={{ marginTop: '24px' }}>Identification</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="adharNumber"
                                label="Aadhar Number"
                                rules={[
                                    { required: true, message: 'Please enter Aadhar number' },
                                    { len: 12, message: 'Aadhar number must be 12 digits' }
                                ]}
                            >
                                <Input placeholder="Enter 12-digit Aadhar number" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="panNumber"
                                label="PAN Number"
                                rules={[
                                    { required: true, message: 'Please enter PAN number' },
                                    { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Enter a valid PAN number (ABCDE1234F format)' }
                                ]}
                            >
                                <Input placeholder="Enter PAN number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title level={4} style={{ marginTop: '24px' }}>Occupation Information</Title>
                    <Form.Item
                        name="subjectOccupation"
                        label="Occupation"
                        rules={[{ required: true, message: 'Please enter occupation' }]}
                    >
                        <Input placeholder="Enter occupation" />
                    </Form.Item>

                    <Title level={4} style={{ marginTop: '24px' }}>Reference Information</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="referenceName"
                                label="Reference Name"
                                rules={[{ required: true, message: 'Please enter reference name' }]}
                            >
                                <Input placeholder="Enter reference name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="relationToSubject"
                                label="Relation to Subject"
                                rules={[{ required: true, message: 'Please select relation' }]}
                            >
                                <Select placeholder="Select relation">
                                    <Option value="FATHER">Father</Option>
                                    <Option value="MOTHER">Mother</Option>
                                    <Option value="BROTHER">Brother</Option>
                                    <Option value="SISTER">Sister</Option>
                                    <Option value="SPOUSE">Spouse</Option>
                                    <Option value="FRIEND">Friend</Option>
                                    <Option value="COLLEAGUE">Colleague</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </div>
    );
};

export default LeadsPage;