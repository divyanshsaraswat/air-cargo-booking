'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, DatePicker, message, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, CalendarOutlined, IdcardOutlined, GoogleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const { Title, Text } = Typography;

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        console.log('Signup values:', values);

        try {
            // Convert moment/dayjs object to YYYY-MM-DD string
            const formattedValues = {
                ...values,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : null
            };

            const response = await fetch('http://localhost:8000/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedValues),
            });

            if (response.ok) {
                const data = await response.json();
                message.success('Account created successfully!');
                router.push('/login');
            } else {
                const errorData = await response.json();
                message.error(errorData.detail || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            message.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const [password, setPassword] = useState('');

    const passwordRules = [
        { regex: /.{8,}/, message: 'Minimum 8 characters' },
        { regex: /[A-Z]/, message: 'At least one uppercase letter' },
        { regex: /[a-z]/, message: 'At least one lowercase letter' },
        { regex: /[0-9]/, message: 'At least one number' },
        { regex: /[^A-Za-z0-9]/, message: 'At least one special character' },
    ];

    const getRuleIcon = (rule: { regex: RegExp, message: string }, value: string) => {
        const isValid = rule.regex.test(value);
        return isValid ? <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span> : <span style={{ color: '#ff4d4f', marginRight: '8px' }}>✗</span>;
    };

    const getRuleColor = (rule: { regex: RegExp, message: string }, value: string) => {
        return rule.regex.test(value) ? '#52c41a' : '#8c8c8c';
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px'
        }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
                <Card
                    variant="borderless"
                    style={{
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        borderRadius: '16px'
                    }}
                    bodyStyle={{ padding: '40px' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <Title level={3} style={{ marginBottom: '8px' }}>Create an account</Title>
                        <Text type="secondary">Sign up to get started</Text>
                    </div>

                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                        <Button block size="large" icon={<GoogleOutlined />} style={{ height: '48px' }} onClick={() => signIn('google')}>
                            Sign up with Google
                        </Button>
                    </Space>

                    <Divider style={{ margin: '32px 0', color: '#8c8c8c' }} plain><Text type="secondary" style={{ fontSize: '12px' }}>Or continue with</Text></Divider>

                    <Form
                        name="signup"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                        scrollToFirstError
                    >
                        <Form.Item
                            name="name"
                            label={<Text strong style={{ fontSize: '13px' }}>Full Name</Text>}
                            rules={[{ required: true, message: 'Please input your full name!' }]}
                        >
                            <Input prefix={<IdcardOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="John Doe" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label={<Text strong style={{ fontSize: '13px' }}>Email</Text>}
                            rules={[
                                { type: 'email', message: 'The input is not valid E-mail!' },
                                { required: true, message: 'Please input your E-mail!' },
                            ]}
                        >
                            <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="user@example.com" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<Text strong style={{ fontSize: '13px' }}>Password</Text>}
                            help={
                                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                                    {passwordRules.map((rule, index) => (
                                        <div key={index} style={{ color: getRuleColor(rule, password), display: 'flex', alignItems: 'center' }}>
                                            {getRuleIcon(rule, password)} {rule.message}
                                        </div>
                                    ))}
                                </div>
                            }
                            rules={[
                                { required: true, message: 'Please input your password!' },
                                () => ({
                                    validator(_, value) {
                                        if (!value) return Promise.resolve();
                                        const allValid = passwordRules.every(rule => rule.regex.test(value));
                                        if (allValid) return Promise.resolve();
                                        return Promise.reject(new Error('Password does not meet requirements'));
                                    },
                                }),
                            ]}
                            hasFeedback
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Secure password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirm"
                            label={<Text strong style={{ fontSize: '13px' }}>Confirm Password</Text>}
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The new password that you entered do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Confirm password" />
                        </Form.Item>

                        <Form.Item
                            name="dob"
                            label={<Text strong style={{ fontSize: '13px' }}>Date of Birth</Text>}
                            rules={[{ required: true, message: 'Please select your Date of Birth!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                            <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ height: '48px', fontWeight: 600 }}>
                                Sign Up
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <Text type="secondary">Already have an account? </Text>
                        <Link href="/login" style={{ color: '#44449b', fontWeight: 600 }}>Login</Link>
                    </div>
                </Card>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        By clicking continue, you agree to our <Link href="#" style={{ textDecoration: 'underline' }}>Terms of Service</Link> and <Link href="#" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
                    </Text>
                </div>
            </div>
        </div>
    );
}
