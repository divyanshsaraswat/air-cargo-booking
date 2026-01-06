'use client';

import React, { useState } from 'react';
import { Typography, Card, Avatar, Descriptions, Button, Divider, Spin, List, Tag, Drawer, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined, SafetyCertificateOutlined, RocketOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';

const { Title, Text } = Typography;

interface Booking {
    id: string;
    origin: string;
    destination: string;
    date: string;
    airline: string;
    flightNumber: string;
    status: 'Confirmed' | 'Pending' | 'Cancelled';
    price: number;
    description: string;
    duration: string;
    departureTime: string;
}

const MOCK_BOOKINGS: Booking[] = [
    {
        id: 'BK-12345',
        origin: 'DEL',
        destination: 'BLR',
        date: '2026-02-10',
        airline: 'SkyLines',
        flightNumber: 'SL505',
        status: 'Confirmed',
        price: 150,
        description: 'New Delhi to Bengaluru',
        duration: '2h 45m',
        departureTime: '10:30'
    },
    {
        id: 'BK-67890',
        origin: 'BOM',
        destination: 'DXB',
        date: '2026-03-01',
        airline: 'GlobalWings',
        flightNumber: 'GW101',
        status: 'Confirmed',
        price: 450,
        description: 'Mumbai to Dubai',
        duration: '3h 30m',
        departureTime: '14:15'
    }
];

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    if (status === 'loading') {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    // Determine values to display
    // Using session data or placeholders as we are simulating backend for now
    const user = session?.user;
    const displayName = user?.name || 'User Name';
    const displayEmail = user?.email || 'user@example.com';

    // Simulated values based on schema request
    const simulatedDob = '2000-01-01';
    const simulatedCreatedAt = new Date().toLocaleDateString();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
            <Title level={2} style={{ marginBottom: '32px' }}>My Profile</Title>

            <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>

                {/* Header Card */}
                <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        <div style={{ flexShrink: 0 }}>
                            <UserAvatar name={displayName} size={100} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Title level={3} style={{ marginBottom: '4px' }}>{displayName}</Title>
                            <Text type="secondary" style={{ fontSize: '16px' }}>{displayEmail}</Text>
                            <div style={{ marginTop: '16px' }}>
                                <Button danger onClick={() => signOut()}>
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Details Card */}
                <Card title="Personal Information" bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Descriptions column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }} size="middle" bordered>
                        <Descriptions.Item label={<Space><UserOutlined /> Name</Space>}>
                            <Text strong>{displayName}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
                            <Text copyable>{displayEmail}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label={<Space><SafetyCertificateOutlined /> Password</Space>}>
                            <Text type="secondary">•••••••••••• (Managed by Google)</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label={<Space><CalendarOutlined /> Date of Birth</Space>}>
                            <Text>{simulatedDob}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Account Created">
                            <Text>{simulatedCreatedAt}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Your Bookings Section */}
                <Card title="Your Bookings" bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <List
                        itemLayout="horizontal"
                        dataSource={MOCK_BOOKINGS}
                        renderItem={(item) => (
                            <List.Item
                                actions={[<Button type="link" onClick={() => {
                                    setSelectedBooking(item);
                                    setDrawerOpen(true);
                                }}>View Details</Button>]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<RocketOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                                    title={<Text strong>{item.origin} <ArrowRightOutlined /> {item.destination}</Text>}
                                    description={
                                        <div>
                                            <div style={{ marginBottom: 4 }}>{item.date} • {item.airline}</div>
                                            <Tag color={item.status === 'Confirmed' ? 'green' : 'orange'}>{item.status}</Tag>
                                        </div>
                                    }
                                />
                                <div>
                                    <Text strong>${item.price}</Text>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>
            </div>

            {/* Booking Details Drawer */}
            <Drawer
                title="Booking Details"
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                width={500}
                zIndex={1000000}
            >
                {selectedBooking && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Header Info */}
                        <div style={{ marginBottom: 24, textAlign: 'center' }}>
                            <Title level={4} style={{ margin: 0 }}>
                                {selectedBooking.origin} <ArrowRightOutlined /> {selectedBooking.destination}
                            </Title>
                            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>Booking Ref: {selectedBooking.id}</Text>
                            <Tag color="green" style={{ marginTop: 8 }} icon={<CheckCircleOutlined />}>{selectedBooking.status}</Tag>
                        </div>

                        <Divider />

                        {/* Flight Info Card */}
                        <Card title="Flight Information" size="small" style={{ background: '#fafafa', marginBottom: 24 }}>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Airline">{selectedBooking.airline}</Descriptions.Item>
                                <Descriptions.Item label="Flight No">{selectedBooking.flightNumber}</Descriptions.Item>
                                <Descriptions.Item label="Date">{selectedBooking.date}</Descriptions.Item>
                                <Descriptions.Item label="Departure">{selectedBooking.departureTime}</Descriptions.Item>
                                <Descriptions.Item label="Duration">{selectedBooking.duration}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Payment Info */}
                        <Card title="Payment Summary" size="small" style={{ background: '#fafafa' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Total Amount Paid</Text>
                                <Text strong>${selectedBooking.price}</Text>
                            </div>
                        </Card>

                    </div>
                )}
            </Drawer>
        </div>
    );
}

// Helper component for icon alignment
function Space({ children }: { children: React.ReactNode }) {
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>{children}</span>;
}
