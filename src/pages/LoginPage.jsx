import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import loginIllustration from '../assets/register.png';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
  
      const response = await axios.post(
        'http://localhost:8080/users/login',
        values,  // Ensure 'values' contains { email, password }
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      localStorage.setItem('userId', response.data.id);
      localStorage.setItem('userName',response.data.name);
    
      message.success('Login successful!');
      alert('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'Login failed. Please try again.');
      alert('Login failed. Please try again.')
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-form-section">
        <div className="login-form-wrapper">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Please enter your details</p>
          
          <Form
            name="login"
            className="login-form"
            initialValues={{ remember: false }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              label="Email address"
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="login-form-button"
                loading={loading}
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>
          
          <div className="login-signup">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </div>
      </div>
      
      <div className="login-image-section">
        <div className="login-illustration">
          <img src={loginIllustration} alt="Login illustration" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;