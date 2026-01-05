'use client';

import React, { useState } from 'react';
import { Layout, Button, Typography, Space, Drawer } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeContext';
import ThemeToggle from './ThemeToggle';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { isDarkMode } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header
                className="responsive-header"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    // padding handled by CSS
                    height: 'auto', // Allow growing
                    minHeight: '80px',
                    boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.05)',
                    background: isDarkMode ? '#1f1f1f' : '#ffffff',
                }}
            >
                {/* Logo Area */}
                <Link href="/" style={{ textDecoration: 'none' }} passHref>
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', background: '#44449b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>AC</div>
                        <Text strong className="logo-text" style={{ fontSize: '24px', fontFamily: 'sans-serif', color: isDarkMode ? 'white' : 'inherit' }}>
                            Air Cargo
                        </Text>
                    </div>
                </Link>

                {/* Navigation - Minimalist Text Links (Desktop) */}
                <Space size={40} className="responsive-nav" style={{ display: 'flex' }}>
                    <Link href="/" passHref>
                        <Text strong={pathname === '/'} style={{ color: isDarkMode ? 'white' : undefined }}>Home</Text>
                    </Link>
                    <Link href="/booking" passHref>
                        <Text strong={pathname === '/booking'} style={{ color: isDarkMode ? 'white' : undefined }}>Booking</Text>
                    </Link>
                    <Link href="/tracking" passHref>
                        <Text strong={pathname === '/tracking'} style={{ color: isDarkMode ? 'white' : undefined }}>Track</Text>
                    </Link>
                </Space>

                {/* Desktop CTA & Toggle */}
                <Space size={16} className="desktop-cta">
                    {/* <ThemeToggle /> */}
                    <Link href="/login">
                        <Button type="primary" size="large">
                            Get Started
                        </Button>
                    </Link>
                </Space>

                {/* Mobile Hamburger Icon */}
                <div className="mobile-menu-icon" onClick={() => setMobileMenuOpen(true)}>
                    <MenuOutlined style={{ fontSize: '24px', color: isDarkMode ? 'white' : '#0e0b38' }} />
                </div>

                {/* Mobile Menu Drawer */}
                <Drawer
                    title="Menu"
                    placement="right"
                    onClose={() => setMobileMenuOpen(false)}
                    open={mobileMenuOpen}
                    width={'100%'}
                    closeIcon={<CloseOutlined style={{ color: isDarkMode ? 'white' : 'inherit' }} />}
                    styles={{
                        header: {
                            background: isDarkMode ? '#1f1f1f' : '#ffffff',
                            borderBottom: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0',
                            color: isDarkMode ? 'white' : 'inherit'
                        },
                        body: {
                            background: isDarkMode ? '#121212' : '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '32px',
                            paddingTop: '40px'
                        }
                    }}
                >
                    <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '24px', fontWeight: 600, color: isDarkMode ? 'white' : '#0e0b38' }}>
                        Home
                    </Link>
                    <Link href="/booking" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '24px', fontWeight: 600, color: isDarkMode ? 'white' : '#0e0b38' }}>
                        Booking
                    </Link>
                    <Link href="/tracking" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '24px', fontWeight: 600, color: isDarkMode ? 'white' : '#0e0b38' }}>
                        Track
                    </Link>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: '18px', color: isDarkMode ? 'white' : '#0e0b38' }}>Dark Mode</Text>
                            <ThemeToggle />
                        </div> */}
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            <Button type="primary" size="large" block style={{ height: '56px', fontSize: '18px' }}>
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </Drawer>
            </Header>

            <Content style={{ background: isDarkMode ? '#121212' : '#fff' }}>
                {children}
            </Content>

            <Footer style={{ textAlign: 'center', background: isDarkMode ? '#1f1f1f' : '#fff', color: isDarkMode ? 'rgba(255,255,255,0.65)' : undefined }}>
                Air Cargo Booking System ©{new Date().getFullYear()}
            </Footer>
        </Layout>
    );
};
