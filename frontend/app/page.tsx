'use client';

import React, { Suspense } from 'react';
import { Typography, Row, Col, Button, Input } from 'antd';
import { RocketOutlined, ArrowRightOutlined, RobotOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeContext';
import DotTextType from '@/components/DotTextType';

import FlightSearch from '@/components/FlightSearch';

const { Title, Text, Paragraph } = Typography;

export default function Home() {
  const { isDarkMode } = useTheme();

  return (
    <div style={{ padding: '0 24px', overflow: 'hidden', position: 'relative', minHeight: '100vh' }}>

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
          Global logistics, <br className="block md:hidden" /><DotTextType
            as="span"
            text={[
              "simplified.",
              "optimized.",
              "streamlined.",
              "reliable.",
              "transparent.",
              "efficient."
            ]}
            textColors={[
              '#5227FF',
              '#FF4D4F',
              '#52C41A',
              '#FAAD14',
              '#13C2C2',
              '#722ED1'
            ]}
            typingSpeed={100}
            deletingSpeed={50}
            pauseDuration={2000}
            loop={true}
            showCursor={true}
            cursorCharacter="●"
            className="inline-block"
          />
        </Title>

        <Paragraph style={{ fontSize: '20px', maxWidth: '750px', margin: '0 auto 48px' }}>
          Experience the future of air freight. Book shipments instantly and track them
          in real-time, all from one minimalist platform.
        </Paragraph>

        <div className="hero-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/search">
            <Button type="primary" size="large" icon={<RocketOutlined />} style={{ height: '56px', padding: '0 32px', fontSize: '18px' }}>
              Search Flights
            </Button>
          </Link>
          <Link href="/tracking">
            <Button size="large" icon={<ArrowRightOutlined />} style={{ height: '56px', padding: '0 32px', fontSize: '18px' }}>
              Track Shipment
            </Button>
          </Link>
        </div>


      </div>

      {/* Flight Search Section */}
      <div style={{ marginTop: '60px', marginBottom: '60px' }}>
        <Suspense>
          <FlightSearch mode="widget" />
        </Suspense>
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

    </div >
  );
}
