'use client';

import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, DatePicker, Select, Card, notification, Divider, Typography, Row, Col } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

export default function BookingForm() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = (values: any) => {
        setLoading(true);
        console.log('Received values of form: ', values);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            notification.success({
                message: 'Booking Created',
                description: `Your booking from ${values.origin} to ${values.destination} has been created successfully. Ref ID: BOOK-${Math.floor(Math.random() * 10000)}`,
            });
            form.resetFields();
        }, 1500);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
            <Card variant="borderless" hoverable>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Title level={2}>Create New Booking</Title>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    name="booking_form"
                    onFinish={onFinish}
                    initialValues={{ pieces: 1 }}
                >
                    <Divider>Route Details</Divider>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="origin"
                                label="Origin Airport"
                                rules={[{ required: true, message: 'Please select origin!' }]}
                            >
                                <Select placeholder="Select Origin" showSearch>
                                    <Option value="JFK">JFK - New York</Option>
                                    <Option value="LHR">LHR - London</Option>
                                    <Option value="DXB">DXB - Dubai</Option>
                                    <Option value="DEL">DEL - Delhi</Option>
                                    <Option value="HKG">HKG - Hong Kong</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="destination"
                                label="Destination Airport"
                                rules={[{ required: true, message: 'Please select destination!' }]}
                            >
                                <Select placeholder="Select Destination" showSearch>
                                    <Option value="JFK">JFK - New York</Option>
                                    <Option value="LHR">LHR - London</Option>
                                    <Option value="DXB">DXB - Dubai</Option>
                                    <Option value="DEL">DEL - Delhi</Option>
                                    <Option value="HKG">HKG - Hong Kong</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="departureDate"
                        label="Departure Date"
                        rules={[{ required: true, message: 'Please select date!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Divider>Cargo Details</Divider>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="pieces"
                                label="Number of Pieces"
                                rules={[{ required: true, message: 'Please enter number of pieces!' }]}
                            >
                                <InputNumber min={1} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="weight"
                                label="Total Weight (kg)"
                                rules={[{ required: true, message: 'Please enter total weight!' }]}
                            >
                                <InputNumber min={1} max={5000} style={{ width: '100%' }} suffix="kg" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<RocketOutlined />}>
                            Create Booking
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
