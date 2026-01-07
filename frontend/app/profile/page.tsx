'use client';

import React, { useState } from 'react';
import { Typography, Card, Avatar, Descriptions, Button, Divider, Spin, List, Tag, Drawer, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined, SafetyCertificateOutlined, RocketOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';

const { Title, Text } = Typography;

interface Booking {
    ref_id: string;
    origin: string;
    destination: string;
    status: string;
    weight_kg: number;
    pieces: number;
    created_at: string;
    events: any[];
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    React.useEffect(() => {
        if (session?.accessToken) {
            fetchBookings();
        }
    }, [session]);

    const fetchBookings = async () => {
        setLoadingBookings(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/my-bookings`, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoadingBookings(false);
        }
    };

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


    const user = session?.user;
    const displayName = user?.name || 'User Name';
    const displayEmail = user?.email || 'user@example.com';


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


                <Card title="Your Bookings" bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    {loadingBookings ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>
                    ) : bookings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Text type="secondary">No bookings found.</Text>
                        </div>
                    ) : (
                        <List
                            itemLayout="horizontal"
                            dataSource={bookings}
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
                                                <div style={{ marginBottom: 4 }}>Ref: {item.ref_id} • {new Date(item.created_at).toLocaleDateString()}</div>
                                                <Tag color={item.status === 'BOOKED' ? 'green' : 'orange'}>{item.status}</Tag>
                                            </div>
                                        }
                                    />
                                    <div>
                                        <Text strong>{item.weight_kg} kg</Text>
                                    </div>
                                </List.Item>
                            )}
                        />
                    )}
                </Card>
            </div>


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
                            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>Booking Ref: {selectedBooking.ref_id}</Text>
                            <Tag color="green" style={{ marginTop: 8 }} icon={<CheckCircleOutlined />}>{selectedBooking.status}</Tag>
                        </div>

                        <Divider />


                        <Card title="Cargo Information" size="small" style={{ background: '#fafafa', marginBottom: 24 }}>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Weight">{selectedBooking.weight_kg} kg</Descriptions.Item>
                                <Descriptions.Item label="Pieces">{selectedBooking.pieces}</Descriptions.Item>
                                <Descriptions.Item label="Created At">
                                    {new Date(selectedBooking.created_at).toLocaleString('en-IN', {
                                        timeZone: 'Asia/Kolkata',
                                        dateStyle: 'medium',
                                        timeStyle: 'medium'
                                    })} (IST)
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </div>
                )}
            </Drawer>
        </div>
    );
}


function Space({ children }: { children: React.ReactNode }) {
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>{children}</span>;
}
