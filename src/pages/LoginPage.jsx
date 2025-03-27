// src/pages/LoginPage.js

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
    LoginOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const { Title, Text } = Typography;
const { Content } = Layout;

const LoginPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const API_BASE_URL = 'http://localhost:8080';
    const { login } = useAuth(); // Use the login function from AuthContext


    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/agents/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: values.email, password: values.password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            const { id: agentId, name: agentName, email: agentEmail } = data;

            const agentData = { agentId, agentName, agentEmail };
            login(agentData); // Update the AuthContext
            message.success('Login successful!');
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            message.error(error.message || 'Invalid credentials');
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
                                    <LoginOutlined style={{ marginRight: '12px' }} />
                                    Welcome Back
                                </Title>
                                <Text type="secondary">
                                    Sign in to access your account
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
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Please enter your email' },
                                        { type: 'email', message: 'Please enter a valid email' }
                                    ]}
                                >
                                    <Input
                                        prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                                        placeholder="Your email address"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Password"
                                    name="password"
                                    rules={[{ required: true, message: 'Please enter your password' }]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                                        placeholder="Your password"
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
                                        Log In
                                    </Button>
                                </Form.Item>

                                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                    <Text type="secondary">
                                        Don't have an account? <Link to="/signup" style={{ color: '#1890ff' }}>Sign up now</Link>
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

export default LoginPage;