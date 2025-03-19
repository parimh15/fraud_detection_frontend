import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';
import signupIllustration from '../assets/register.png';

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // API call to register user
      const response = await axios.post('http://localhost:8080/users/register', {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      console.log("Server Response:", response.data); // Debugging

      // Store userId in localStorage (ensure backend returns it)
      if (response.data.id) {
        localStorage.setItem("userId", response.data.id);
      } else {
        console.warn("User ID not found in response");
      }

      // Show success message and alert
      alert("Signup successful! Redirecting to login...");
      navigate('/login'); // Redirect after alert
     

    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form-section">
        <div className="signup-form-wrapper">
          <h1 className="signup-title">Create account</h1>
          <p className="signup-subtitle">Please enter your details</p>
          
          <Form
            name="signup"
            className="signup-form"
            initialValues={{ agree: false }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              label="Full name"
              name="name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email address"
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'Password must be at least 8 characters!' }
              ]}
            >
              <Input.Password />
            </Form.Item>

            {/* <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[
                { 
                  validator: (_, value) => 
                    value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms and conditions')),
                }
              ]}
            >
              <Checkbox>I agree to the Terms and Privacy Policy</Checkbox>
            </Form.Item> */}

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="signup-form-button"
                loading={loading}
              >
                Create account
              </Button>
            </Form.Item>

            {/* <Form.Item>
              <Button className="signup-google-button">
                <GoogleOutlined /> Sign up with Google
              </Button>
            </Form.Item> */}
          </Form>
          
          <div className="signup-login">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
      
      <div className="signup-image-section">
        <div className="signup-illustration">
          <img src={signupIllustration} alt="Signup illustration" />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;