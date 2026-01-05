'use client';

import React from 'react';
import { Form, Input, Button, Card, Divider, Typography, Space } from 'antd';
import { AppleFilled, GoogleOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LoginPage() {
    const onFinish = (values: any) => {
        console.log('Received values of form: ', values);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // background: consistent with Theme (handled by MainLayout)
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
                        <Title level={3} style={{ marginBottom: '8px' }}>Welcome back</Title>
                        <Text type="secondary">Login with your Email or Google account</Text>
                    </div>

                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                        <Button block size="large" icon={<GoogleOutlined />} style={{ height: '48px' }}>
                            Login with Google
                        </Button>
                    </Space>

                    <Divider style={{ margin: '32px 0', color: '#8c8c8c' }} plain><Text type="secondary" style={{ fontSize: '12px' }}>Or continue with</Text></Divider>

                    <Form
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            label={<Text strong style={{ fontSize: '13px' }}>Email</Text>}
                            rules={[{ required: true, message: 'Please input your Email!' }]}
                        >
                            <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="m@example.com" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <Text strong style={{ fontSize: '13px' }}>Password</Text>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please input your Password!' }]}
                        >
                            <Input.Password prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Enter your password" />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                            <Button type="primary" htmlType="submit" block size="large" style={{ height: '48px', fontWeight: 600 }}>
                                Login
                            </Button>
                        </Form.Item>
                    </Form>
                    <div style={{ textAlign: 'center', marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'space-between' }}>
                        <Link href="#" style={{ fontSize: '13px', color: '#44449b' }}>Forgot your password?</Link>
                        <Text type="secondary">Don't have an account? </Text>
                        <Link href="#" style={{ color: '#44449b', fontWeight: 600 }}>Sign up</Link>
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
