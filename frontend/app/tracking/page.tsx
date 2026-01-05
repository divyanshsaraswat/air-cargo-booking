'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Input, Button, Card, Typography, Empty, Alert, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import TrackingTimeline from '@/components/TrackingTimeline';
import { useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;

function TrackingContent() {
    const [searchId, setSearchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [trackingData, setTrackingData] = useState<any>(null);
    const [error, setError] = useState('');
    const searchParams = useSearchParams();

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSearchId(id);
            handleSearch(id);
        }
    }, [searchParams]);

    const handleSearch = (id?: string) => {
        const queryId = id || searchId;
        if (!queryId) return;

        setLoading(true);
        setError('');
        setTrackingData(null);

        // Mock API call
        setTimeout(() => {
            setLoading(false);
            // Simulate finding data for specific ID, else error or random success
            if (queryId.toLowerCase() === 'error') {
                setError('Booking ID not found. Please check and try again.');
            } else {
                setTrackingData({
                    id: queryId,
                    origin: 'New York (JFK)',
                    destination: 'London (LHR)',
                    pieces: 5,
                    weight: 450,
                    currentStatus: 'DEPARTED', // Randomly pick or static
                    events: [
                        { status: 'BOOKED', location: 'JFK', timestamp: '2023-10-25 10:00', description: 'Booking created at JFK' },
                        { status: 'DEPARTED', location: 'JFK', timestamp: '2023-10-26 14:30', description: 'Flight BA112 departed' },
                    ]
                });
            }
        }, 1000);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Title level={2}>Track Your Shipment</Title>
                <Text type="secondary">Enter your Booking Reference ID to see real-time updates.</Text>
            </div>

            <Card style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Input
                        size="large"
                        placeholder="Enter Booking ID (e.g., BOOK-1234)"
                        prefix={<SearchOutlined />}
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        onPressEnter={() => handleSearch()}
                    />
                    <Button type="primary" size="large" onClick={() => handleSearch()} loading={loading}>
                        Track
                    </Button>
                </div>
            </Card>

            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '24px' }} />}

            {trackingData ? (
                <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                    <Card title="Shipment Details" variant="borderless" style={{ marginBottom: '24px' }}>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <div>
                                    <Text type="secondary">Origin</Text>
                                    <Title level={4} style={{ margin: 0 }}>{trackingData.origin}</Title>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div>
                                    <Text type="secondary">Destination</Text>
                                    <Title level={4} style={{ margin: 0 }}>{trackingData.destination}</Title>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div>
                                    <Text type="secondary">Pieces</Text>
                                    <div style={{ fontSize: '16px', fontWeight: 500 }}>{trackingData.pieces}</div>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div>
                                    <Text type="secondary">Weight</Text>
                                    <div style={{ fontSize: '16px', fontWeight: 500 }}>{trackingData.weight} kg</div>
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    <TrackingTimeline events={trackingData.events} currentStatus={trackingData.currentStatus} />
                </div>
            ) : (
                !loading && !error && (
                    <Empty description="Enter a Tracking ID to see details" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
            )}

            <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}

export default function TrackingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TrackingContent />
        </Suspense>
    );
}
