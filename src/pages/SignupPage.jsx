import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    message,
    Layout,
    Typography,
    Divider,
    Row,
    Col,
    Card
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const SignupPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const API_BASE_URL = 'http://localhost:8080';

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/agents/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Signup failed');
            }
            
            message.success('Signup successful! Please log in.');
            navigate('/login');
        } catch (error) {
            console.error('Signup error:', error);
            message.error(error.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', width: '100%' }}>
            <Content style={{ 
                padding: 0,
                height: '100vh',
                width: '100%',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                <Row justify="center" align="middle" style={{ height: '100%' }}>
                    <Col xs={22} sm={16} md={12} lg={8}>
                        <Card 
                            bordered={false}
                            style={{ 
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                                borderRadius: '12px'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <Title level={2} style={{ 
                                    marginBottom: '8px',
                                    color: '#1890ff' 
                                }}>
                                    <UserAddOutlined style={{ marginRight: '12px' }} />
                                    Create Account
                                </Title>
                                <Text type="secondary">
                                    Sign up to get started
                                </Text>
                            </div>
                            
                            <Divider style={{ marginBottom: '24px' }} />
                            
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                size="large"
                            >
                                <Form.Item
                                    label="Name"
                                    name="name"
                                    rules={[{ required: true, message: 'Please enter your name' }]}
                                >
                                    <Input 
                                        prefix={<UserOutlined style={{ color: '#1890ff' }} />} 
                                        placeholder="Your full name"
                                    />
                                </Form.Item>
                                
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Please enter your email' },
                                        { type: 'email', message: 'Please enter a valid email' }
                                    ]}
                                >
                                    <Input 
                                        prefix={<MailOutlined style={{ color: '#1890ff' }} />} 
                                        placeholder="Your email address"
                                    />
                                </Form.Item>
                                
                                <Form.Item
                                    label="Password"
                                    name="password"
                                    rules={[
                                        { required: true, message: 'Please enter your password' },
                                        { min: 6, message: 'Password must be at least 6 characters' }
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                                        placeholder="Create a password"
                                    />
                                </Form.Item>
                                
                                <Form.Item
                                    name="confirm"
                                    label="Confirm Password"
                                    dependencies={['password']}
                                    rules={[
                                        { required: true, message: 'Please confirm your password' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('The two passwords do not match'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                                        placeholder="Confirm your password"
                                    />
                                </Form.Item>
                                
                                <Form.Item>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        loading={loading} 
                                        block
                                        size="large"
                                        style={{ 
                                            height: '48px',
                                            borderRadius: '6px',
                                            fontWeight: 'bold' 
                                        }}
                                    >
                                        Create Account
                                    </Button>
                                </Form.Item>
                                
                                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                    <Text type="secondary">
                                        Already have an account? <Link to="/login" style={{ color: '#1890ff' }}>Log in</Link>
                                    </Text>
                                </div>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default SignupPage;