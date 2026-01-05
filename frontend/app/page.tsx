'use client';

import React from 'react';
import { Typography, Row, Col, Button, Input } from 'antd';
import { RocketOutlined, ArrowRightOutlined, RobotOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeContext';
import DotGrid from '@/components/DotGrid';

const { Title, Text, Paragraph } = Typography;

export default function Home() {
  const { isDarkMode } = useTheme();

  return (
    <div style={{ padding: '0 24px', overflow: 'hidden', position: 'relative', minHeight: '100vh' }}>
      {/* DotGrid Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        <DotGrid
          baseColor={isDarkMode ? '#333' : '#e0e7ff'}
          activeColor={isDarkMode ? '#44449b' : '#5227FF'}
          dotSize={4}
          gap={24}
          shockRadius={100}
        />
      </div>

      {/* Hero Section */}
      <div className="hero-container" style={{
        textAlign: 'center',
        // padding handled by CSS
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>



        <Title
          level={1}
          className="hero-title"
          style={{
            // fontSize handled by CSS
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '24px',
          }}
        >
          Global logistics, <span style={{ color: isDarkMode ? '#ffffff' : '#343471ff' }}>simplified.</span>
        </Title>

        <Paragraph style={{ fontSize: '20px', maxWidth: '750px', margin: '0 auto 48px' }}>
          Experience the future of air freight. Book shipments instantly and track them
          in real-time, all from one minimalist platform.
        </Paragraph>

        <div className="hero-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/booking">
            <Button type="primary" size="large" icon={<RocketOutlined />} style={{ height: '56px', padding: '0 32px', fontSize: '18px' }}>
              New Booking
            </Button>
          </Link>
          <Link href="/tracking">
            <Button size="large" icon={<ArrowRightOutlined />} style={{ height: '56px', padding: '0 32px', fontSize: '18px' }}>
              Track Shipment
            </Button>
          </Link>
        </div>

        <div style={{ marginTop: '16px' }}>
          <Text type="secondary" style={{ fontSize: '13px' }}>Trusted by top global carriers</Text>
        </div>

      </div>

      {/* Interactive/Mockup Section */}
      <div style={{
        marginTop: '40px',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Indigo Box/Mockup container */}
        <div style={{
          background: '#44449b',
          borderRadius: '24px 24px 0 0',
          padding: '60px 20px 0',
          width: '100%',
          maxWidth: '1000px',
          height: '380px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
        }}>

          {/* Inner White Card (Tracking Interface Mockup) */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '650px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            height: 'fit-content'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text strong style={{ fontSize: '18px' }}>Quick Track</Text>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff4d4f' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffec3d' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#52c41a' }} />
              </div>
            </div>

            <Input.Search
              placeholder="Enter Booking Reference (e.g., BOOK-8821)"
              enterButton="Track"
              size="large"
              style={{ width: '100%' }}
              onSearch={(value) => {
                if (value) {
                  window.location.href = `/tracking?id=${value}`;
                }
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#f5f7fa', borderRadius: '12px' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Recent Search</Text>
                <div style={{ fontWeight: 600 }}>BOOK-4921</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Status</Text>
                <div style={{ color: '#44449b', fontWeight: 600 }}>Arrived at LHR</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
