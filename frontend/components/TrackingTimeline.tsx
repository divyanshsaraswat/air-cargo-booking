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
                    {
                        title: 'Booked',
                        description: events.find(e => e.status === 'BOOKED')?.description || 'Shipment details received',
                        icon: <ClockCircleOutlined />,
                    },
                    {
                        title: 'Departed',
                        description: events.find(e => e.status === 'DEPARTED')?.description || 'In transit',
                        icon: <EnvironmentOutlined />,
                    },
                    {
                        title: 'Arrived',
                        description: events.find(e => e.status === 'ARRIVED')?.description || 'Arrived at destination airport',
                        icon: <EnvironmentOutlined />,
                    },
                    {
                        title: 'Delivered',
                        description: events.find(e => e.status === 'DELIVERED')?.description || 'Delivered to consignee',
                        icon: <CheckCircleOutlined />,
                    },
                ]}
            />
        </Card>
    );
}
