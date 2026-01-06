'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Layout, Button, Typography, Space, Drawer, Dropdown, MenuProps, Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from './ThemeContext';
import ThemeToggle from './ThemeToggle';
import DotGrid from '@/components/DotGrid';
import UserAvatar from '@/components/UserAvatar';
import { MenuOutlined, CloseOutlined, LogoutOutlined, UserOutlined, HomeOutlined, RadarChartOutlined, SearchOutlined } from '@ant-design/icons';
import gsap from 'gsap';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { isDarkMode } = useTheme();
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Animation Refs
    const headerRef = useRef<HTMLElement>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const logoContainerRef = useRef<HTMLDivElement>(null); // Renamed for clarity
    const logoTextRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            // Initial states
            // Navbar starts as a pill containing just the logo + text (centered)
            gsap.set(headerRef.current, {
                width: '230px', // Wider initial width to fit "Air Cargo"
                height: '56px',
                borderRadius: '50px',
                // padding: '0 10px', // Not needed if children are absolute
                justifyContent: 'space-between',
                force3D: true
            });

            // Hide Nav and CTA initially using absolute positioning
            gsap.set([navRef.current, ctaRef.current], {
                autoAlpha: 0,
                position: 'absolute',
                top: '50%',
                yPercent: -50,
                padding: 0,
                margin: 0
            });

            // Center Nav
            gsap.set(navRef.current, {
                left: '50%',
                xPercent: -50
            });

            // Position CTA to right
            gsap.set(ctaRef.current, {
                right: '32px'
            });

            // Position Logo ABSOLUTELY in the center initially
            // This guarantees perfect centering regardless of other elements or flex logic
            gsap.set(logoContainerRef.current, {
                position: 'absolute',
                top: '50%',
                left: '50%',
                xPercent: -50,
                yPercent: -50,
                margin: 0
            });

            // Ensure Logo Text is visible
            gsap.set(logoTextRef.current, {
                autoAlpha: 1,
                display: 'block'
            });

            // Spring Configuration (User Configurable)
            const springAmplitude = 3;
            const springPeriod = 0.4;

            // Animation Timeline
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // 1. Wait a bit
            tl.to({}, { duration: 1 })

                // 2. Expand width with springy motion
                .to(headerRef.current, {
                    width: 'calc(100% - 48px)',
                    maxWidth: '1200px',
                    // padding: '0 32px', // Padding doesn't affect absolute children
                    duration: 1.8,
                    ease: `elastic.out(1,0.3)`,
                }, 'expand')

                // Move logo to the left (32px matches the design padding)
                .to(logoContainerRef.current, {
                    left: '32px',
                    xPercent: 0,
                    duration: 1.5,
                    ease: 'power4.inOut'
                }, 'expand')

                // 3. Reveal Nav & CTA (Just Opacity)
                .to([navRef.current, ctaRef.current], {
                    autoAlpha: 1,
                    duration: 1,
                    stagger: 0.1,
                    delay: 0.2 // Start fading in slightly after expansion begins
                }, 'expand+=0.3'); // Start slightly later

        });

        return () => mm.revert();
    }, []);

    // Dropdown Items
    const items: MenuProps['items'] = [
        {
            key: 'profile',
            label: (
                <Link href="/profile">
                    Profile
                </Link>
            ),
            icon: <UserOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => signOut(),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: isDarkMode ? '#121212' : '#ffffff' }}>
            {/* DotGrid Background */}
            {/* DotGrid Background - Only on Home Page */}
            {pathname === '/' && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                    <DotGrid
                        baseColor={isDarkMode ? '#333' : '#e0e7ff'}
                        activeColor={isDarkMode ? '#44449b' : '#5227FF'}
                        dotSize={4}
                        gap={24}
                        shockRadius={100}
                    />
                </div>
            )}

            <Header
                ref={headerRef}
                style={{
                    position: 'fixed',
                    top: '24px',
                    zIndex: 9999,
                    // Initial styles will be overridden by GSAP, keeping defaults for SSR/no-js
                    width: 'calc(100% - 48px)',
                    maxWidth: '1200px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    height: 'auto',
                    minHeight: '72px',
                    borderRadius: '50px',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.04)',
                    boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.05)',
                    background: isDarkMode ? 'rgba(31, 31, 31, 0.65)' : 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    overflow: 'hidden', // Hide overflow during expansion
                }}
            >
                {/* Logo Area */}
                <div ref={logoContainerRef}>
                    <Link href="/" style={{ textDecoration: 'none' }} passHref>
                        <div className="logo" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', background: '#44449b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>AC</div>
                            <div ref={logoTextRef} style={{ display: 'flex', alignItems: 'center' }}>
                                <Text strong className="logo-text" style={{ fontSize: '24px', fontFamily: 'sans-serif', color: isDarkMode ? 'white' : 'inherit', whiteSpace: 'nowrap', lineHeight: '1', margin: 0, position: 'relative', top: '2px' }}>
                                    Air Cargo
                                </Text>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Navigation - Menu Component (Desktop) */}
                <div ref={navRef} className="responsive-nav" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <Menu
                        mode="horizontal"
                        selectedKeys={[pathname]}
                        style={{
                            background: 'transparent',
                            borderBottom: 'none',
                            lineHeight: '72px',
                            width: '100%',
                            justifyContent: 'center',
                            fontSize: '15px'
                        }}
                        items={[
                            {
                                key: '/',
                                icon: <HomeOutlined />,
                                label: <Link href="/">Home</Link>
                            },
                            {
                                key: '/tracking',
                                icon: <RadarChartOutlined />,
                                label: <Link href="/tracking">Track</Link>
                            },
                            {
                                key: '/search',
                                icon: <SearchOutlined />,
                                label: <Link href="/search">Search Flights</Link>
                            }
                        ]}
                    />
                </div>

                {/* Desktop CTA & Toggle */}
                <div ref={ctaRef}>
                    <Space size={16} className="desktop-cta">
                        {/* <ThemeToggle /> */}
                        {status === 'authenticated' && session?.user ? (
                            <Dropdown menu={{ items }} placement="bottomRight" arrow>
                                <div style={{ cursor: 'pointer' }}>
                                    <UserAvatar name={session.user.name} />
                                </div>
                            </Dropdown>
                        ) : (
                            <Link href="/login">
                                <Button type="primary" size="middle" shape="round">
                                    Get Started
                                </Button>
                            </Link>
                        )}
                    </Space>
                </div>

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
                    zIndex={10000}
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
                    <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '24px', fontWeight: 600, color: isDarkMode ? 'white' : '#0e0b38', textAlign: 'center' }}>
                        Home
                    </Link>
                    <Link href="/tracking" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '24px', fontWeight: 600, color: isDarkMode ? 'white' : '#0e0b38', textAlign: 'center' }}>
                        Track
                    </Link>
                    <Link href="/search" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '24px', fontWeight: 600, color: isDarkMode ? 'white' : '#0e0b38', textAlign: 'center' }}>
                        Search Flights
                    </Link>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {status === 'authenticated' && session?.user ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                                <UserAvatar name={session.user.name} size={48} />
                                <Text style={{ fontSize: '18px', fontWeight: 600, color: isDarkMode ? 'white' : '#0e0b38' }}>
                                    {session.user.name}
                                </Text>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button type="primary" size="large" block style={{ height: '56px', fontSize: '18px' }}>
                                    Get Started
                                </Button>
                            </Link>
                        )}
                    </div>
                </Drawer>
            </Header>

            <Content style={{ background: 'transparent', paddingTop: '120px' }}>
                {children}
            </Content>

            <Footer style={{ textAlign: 'center', background: isDarkMode ? '#1f1f1f' : '#fff', color: isDarkMode ? 'rgba(255,255,255,0.65)' : undefined }}>
                Air Cargo Booking System ©{new Date().getFullYear()}
            </Footer>
        </Layout>
    );
};
