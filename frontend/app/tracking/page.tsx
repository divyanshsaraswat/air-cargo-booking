'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Input, Button, Card, Typography, Empty, Alert, Row, Col, Result } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import TrackingTimeline from '@/components/TrackingTimeline';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;

function TrackingContent() {
    const [searchId, setSearchId] = useState('');
    const searchParams = useSearchParams();

    // SWR Fetcher
    const fetcher = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Booking ID not found. Please check and try again.');
            } else {
                throw new Error('Failed to fetch booking details.');
            }
        }
        const data = await res.json();
        console.log("Tracking Response:", data);

        // Transform
        return {
            id: data.ref_id,
            origin: data.origin,
            destination: data.destination,
            pieces: data.pieces,
            weight: data.weight_kg,
            currentStatus: data.status,
            events: (data.events || []).map((e: any) => ({
                status: e.status,
                location: e.location || 'Unknown',
                timestamp: new Date(e.timestamp).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'medium',
                    timeStyle: 'short'
                }) + ' (IST)',
                description: (() => {
                    if (e.metadata?.message) return e.metadata.message;
                    if (e.status === 'DEPARTED') return `Departed from ${e.location}`;
                    if (e.status === 'ARRIVED') return `Arrived at ${e.location}`;
                    if (e.status === 'DELIVERED') return `Delivered at ${e.location}`;
                    return `Status updated to ${e.status}`;
                })()
            }))
        };
    };

    // Use SWR
    // Only fetch if we have a searchId
    const { data: trackingData, error, isLoading } = useSWR(
        searchId ? `${process.env.NEXT_PUBLIC_API_URL}/bookings/${searchId}` : null,
        fetcher,
        {
            revalidateOnFocus: false, // Don't revalidate just by clicking window
            refreshInterval: 10000,   // Poll every 10 seconds for live updates
            shouldRetryOnError: false // Don't retry 404s infinitely
        }
    );

    // Initialize searchId from URL
    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSearchId(id);
        }
    }, [searchParams]);

    const handleSearch = (id?: string) => {
        // Just setting the searchID triggers SWR
        // If input changed, we update searchId. 
        // Note: The input is bound to 'searchId' state directly in the original code.
        // But if we type, we don't want to fetch on every keystroke. 
        // We need a separate state for "Input Value" vs "Query Value".
        // Let's fix that.
    };

    // We need separate state for input to avoid fetching on every keystroke if the user is typing
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (searchId) setInputValue(searchId);
    }, [searchId]);

    const onSearchTrigger = () => {
        setSearchId(inputValue);
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
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onPressEnter={onSearchTrigger}
                    />
                    <Button type="primary" size="large" onClick={onSearchTrigger} loading={isLoading}>
                        Track
                    </Button>
                </div>
            </Card>

            {error ? (
                <div style={{ animation: 'fadeIn 0.5s', marginBottom: '24px' }}>
                    <Card variant="borderless" style={{ background: 'transparent' }}>
                        <Result
                            status={error.message?.includes('not found') ? "404" : "error"}
                            title={error.message?.includes('not found') ? "No Booking Found" : "Error"}
                            subTitle={error.message}
                            extra={[
                                <Button type="primary" key="search" onClick={() => { setSearchId(''); setInputValue(''); }}>
                                    Try Another ID
                                </Button>
                            ]}
                        />
                    </Card>
                </div>
            ) : null}

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
                !isLoading && !error && (
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
        <Suspense>
            <TrackingContent />
        </Suspense>
    );
}
