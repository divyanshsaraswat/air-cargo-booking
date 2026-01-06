'use client';

import React from 'react';
import { Steps, Card, Tag, Typography } from 'antd';
import { EnvironmentOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Mock data type
interface TrackingEvent {
    status: string;
    location: string;
    timestamp: string;
    description: string;
}

interface TrackingTimelineProps {
    events: TrackingEvent[];
    currentStatus: 'BOOKED' | 'DEPARTED' | 'ARRIVED' | 'DELIVERED';
}

const statusMap = {
    BOOKED: 0,
    DEPARTED: 1,
    ARRIVED: 2,
    DELIVERED: 3,
};

export default function TrackingTimeline({ events, currentStatus }: TrackingTimelineProps) {
    const currentStep = statusMap[currentStatus] || 0;

    return (
        <Card
            title={<Title level={4}>Shipment Journey</Title>}
            style={{ marginTop: '24px' }}
            extra={<Tag color={currentStatus === 'DELIVERED' ? 'green' : 'blue'}>{currentStatus}</Tag>}
        >
            <Steps
                direction="vertical"
                current={currentStep}
                items={[
                    { title: 'Booked', status: 'BOOKED', icon: <ClockCircleOutlined /> },
                    { title: 'Departed', status: 'DEPARTED', icon: <EnvironmentOutlined /> },
                    { title: 'Arrived', status: 'ARRIVED', icon: <EnvironmentOutlined /> },
                    { title: 'Delivered', status: 'DELIVERED', icon: <CheckCircleOutlined /> },
                ].map(step => {
                    const event = events.find(e => e.status === step.status);
                    return {
                        title: step.title,
                        icon: step.icon,
                        description: (
                            <div>
                                <div>{event?.description || 'Pending'}</div>
                                {event?.timestamp && (
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {event.timestamp}
                                    </Text>
                                )}
                            </div>
                        )
                    };
                })}
            />
        </Card>
    );
}
