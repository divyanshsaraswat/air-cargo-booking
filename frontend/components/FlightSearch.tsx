'use client';

import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, Typography, List, Tag, Divider, Row, Col, Empty, Drawer, InputNumber, notification, message } from 'antd';
import { SearchOutlined, RocketOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const { Title, Text } = Typography;
const { Option } = Select;

interface Flight {
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string; // HH:mm
    duration: string;
    price: number;
    date: string; // YYYY-MM-DD
}

interface Route {
    type: 'direct' | 'transit';
    flights: Flight[];
    totalPrice: number;
    totalDuration: string;
}

const AIRPORTS = [
    { code: 'DEL', name: 'New Delhi (DEL)' },
    { code: 'BOM', name: 'Mumbai (BOM)' },
    { code: 'BLR', name: 'Bengaluru (BLR)' },
    { code: 'HYD', name: 'Hyderabad (HYD)' },
    { code: 'DXB', name: 'Dubai (DXB)' },
    { code: 'LHR', name: 'London (LHR)' },
    { code: 'JFK', name: 'New York (JFK)' },
    { code: 'HKG', name: 'Hong Kong (HKG)' },
];

const MOCK_AIRLINES = ['SkyLines', 'AeroJet', 'GlobalWings', 'AirConnect'];

interface FlightSearchProps {
    mode?: 'widget' | 'page';
}

export default function FlightSearch({ mode = 'page' }: FlightSearchProps) {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Route[] | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();

    const [form] = Form.useForm();
    const [drawerForm] = Form.useForm(); // Add this line

    // Initialize form from URL params if in page mode
    useEffect(() => {
        if (mode === 'page' && searchParams) {
            const origin = searchParams.get('origin');
            const destination = searchParams.get('destination');
            const dateParam = searchParams.get('date');

            if (origin && destination && dateParam) {
                form.setFieldsValue({
                    origin,
                    destination,
                    date: dayjs(dateParam)
                });
                // Auto-trigger search
                performSearch({ origin, destination, date: dayjs(dateParam) });
            }
        }
    }, [mode, searchParams, form]);

    // Restore pending booking if user just logged in
    useEffect(() => {
        if (session) {
            const pendingFlight = localStorage.getItem('pendingBookingFlight');
            if (pendingFlight) {
                try {
                    const flightData = JSON.parse(pendingFlight);
                    // Verify it's valid flight data simply
                    if (flightData && flightData.id) {
                        setSelectedFlight(flightData);
                        setReviewOpen(true);
                        // Optional: Show a message "Resuming your booking..."
                        message.success("Resuming your booking", 2);
                    }
                } catch (e) {
                    console.error("Failed to parse pending booking", e);
                } finally {
                    // Clear it so it doesn't open next time unnecessarily
                    localStorage.removeItem('pendingBookingFlight');
                }
            }
        }
    }, [session]);

    const generateFlight = (from: string, to: string, date: Dayjs): Flight => {
        const airline = MOCK_AIRLINES[Math.floor(Math.random() * MOCK_AIRLINES.length)];
        const flightNumber = `${airline.substring(0, 2).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const departureTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const durationHours = 2 + Math.floor(Math.random() * 10);

        return {
            id: Math.random().toString(36).substr(2, 9),
            airline,
            flightNumber,
            origin: from,
            destination: to,
            departureTime,
            duration: `${durationHours}h ${Math.floor(Math.random() * 60)}m`,
            price: 100 + Math.floor(Math.random() * 500),
            date: date.format('YYYY-MM-DD'),
        };
    };

    const performSearch = (values: any) => {
        setLoading(true);
        setResults(null);

        // Simulate API delay
        setTimeout(() => {
            const { origin, destination, date } = values;
            const searchDate = dayjs(date);
            const newResults: Route[] = [];

            // 1. Direct Flight
            const directFlight = generateFlight(origin, destination, searchDate);
            newResults.push({
                type: 'direct',
                flights: [directFlight],
                totalPrice: directFlight.price,
                totalDuration: directFlight.duration,
            });

            // 2. Transit Flight Logic
            // Find a transit hub that is not origin or destination
            const possibleHubs = AIRPORTS.filter(a => a.code !== origin && a.code !== destination);
            if (possibleHubs.length > 0) {
                const hub = possibleHubs[Math.floor(Math.random() * possibleHubs.length)].code;

                // Leg 1: Origin -> Hub (On Search Date)
                const leg1 = generateFlight(origin, hub, searchDate);

                // Leg 2: Hub -> Destination (Same Day or Next Day)
                // Logic: 50% chance sameday, 50% chance next day
                const isNextDay = Math.random() > 0.5;
                const leg2Date = isNextDay ? searchDate.add(1, 'day') : searchDate;

                const leg2 = generateFlight(hub, destination, leg2Date);

                // Ensure leg2 is not after next day (Already handled by strict assignment)

                newResults.push({
                    type: 'transit',
                    flights: [leg1, leg2],
                    totalPrice: leg1.price + leg2.price,
                    totalDuration: 'Transit (Layover included)', // Simplified for mock
                });
            }

            // Generate more mock data for "Show More" effect
            for (let i = 0; i < 3; i++) {
                const extraDirect = generateFlight(origin, destination, searchDate);
                newResults.push({
                    type: 'direct',
                    flights: [extraDirect],
                    totalPrice: extraDirect.price + Math.floor(Math.random() * 50),
                    totalDuration: extraDirect.duration,
                })
            }

            setResults(newResults);
            setLoading(false);
        }, 1000);
    };

    const onFinish = (values: any) => {
        if (mode === 'widget') {
            // Redirect to search page with params
            const query = new URLSearchParams({
                origin: values.origin,
                destination: values.destination,
                date: values.date.format('YYYY-MM-DD')
            }).toString();
            router.push(`/search?${query}`);
        } else {
            // Page mode: Perform search and update URL (shallow)
            const query = new URLSearchParams({
                origin: values.origin,
                destination: values.destination,
                date: values.date.format('YYYY-MM-DD')
            }).toString();
            // Update URL without full reload
            window.history.pushState(null, '', `/search?${query}`);
            performSearch(values);
        }
    };

    const [reviewOpen, setReviewOpen] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

    const onBookClick = (flight: Flight) => {
        setSelectedFlight(flight);
        setReviewOpen(true);
    };


    return (
        <div className="search-container">
            <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
                {mode === 'widget' ? 'Search Flights' : 'Flight Results'}
            </Typography.Title>

            <Card
                style={{
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    borderRadius: '16px',
                    marginBottom: '40px'
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        origin: 'DEL',
                        destination: 'BLR',
                        date: dayjs()
                    }}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="origin" label="From" rules={[{ required: true }]}>
                                <Select showSearch placeholder="Origin">
                                    {AIRPORTS.map(airport => (
                                        <Option key={airport.code} value={airport.code}>{airport.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="destination" label="To" rules={[{ required: true }]}>
                                <Select showSearch placeholder="Destination">
                                    {AIRPORTS.map(airport => (
                                        <Option key={airport.code} value={airport.code}>{airport.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="date" label="Departure Date" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading} size="large">
                                {mode === 'widget' ? 'Search Flights' : 'Update Search'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {mode === 'page' && results && (
                <div className="search-results">
                    <Typography.Title level={4}>Available Flights</Typography.Title>
                    <List
                        grid={{ gutter: 16, column: 1 }}
                        dataSource={results}
                        renderItem={item => (
                            <List.Item>
                                <Card hoverable style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                                    <div className="flight-card-header">
                                        <div>
                                            <Tag color={item.type === 'direct' ? 'green' : 'orange'}>
                                                {item.type.toUpperCase()}
                                            </Tag>
                                            <span style={{ marginLeft: 8, fontWeight: 600, fontSize: '16px' }}>
                                                {item.flights[0].origin} <RocketOutlined style={{ margin: '0 8px', color: '#1890ff' }} /> {item.flights[item.flights.length - 1].destination}
                                            </span>
                                        </div>
                                        <div className="flight-card-price-section">
                                            <div>
                                                <Title level={4} style={{ margin: 0 }}>${item.totalPrice}</Title>
                                                <Text type="secondary">{item.totalDuration}</Text>
                                            </div>
                                            <div style={{ marginTop: '8px' }}>
                                                <Button
                                                    type="primary"
                                                    onClick={() => onBookClick(item.flights[0])} // Simplified: selecting first leg for "Book Now" context if transit, or pass full route later. For now passed single flight or better pass route.
                                                // Correction: User wants to review the flight. If it's transit, we should probably show all details.
                                                // For MVP simplicity and keeping types clean, I'll pass the first flight for "origin/dest/date" prefill, 
                                                // but conceptually we might want to pass the whole route.
                                                // Let's pass item.flights[0] for basic info for now as per previous logic.
                                                >
                                                    Book Now
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Divider style={{ margin: '12px 0' }} />

                                    {item.flights.map((flight, idx) => (
                                        <div key={idx} className="flight-segment-row" style={{ marginBottom: idx < item.flights.length - 1 ? 12 : 0 }}>
                                            <div className="flight-segment-info">
                                                <div style={{ fontWeight: 600 }}>{flight.airline} <Text type="secondary" style={{ fontSize: '12px' }}>{flight.flightNumber}</Text></div>
                                                <div>{flight.date}</div>
                                                <div style={{ color: '#555' }}>
                                                    {flight.origin} ({flight.departureTime}) <SearchOutlined rotate={90} style={{ fontSize: '10px', margin: '0 4px' }} /> {flight.destination}
                                                </div>
                                            </div>
                                            <div>{flight.duration}</div>
                                        </div>
                                    ))}
                                </Card>
                            </List.Item>
                        )}
                    />
                </div>
            )}

            {/* Review Drawer */}
            <Drawer
                title="Review Flight"
                placement="right"
                onClose={() => setReviewOpen(false)}
                open={reviewOpen}
                width={500}
                styles={{ body: { paddingBottom: 80 } }}
                zIndex={100000000}
            >
                {selectedFlight && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Header Info */}
                        <div style={{ marginBottom: 24 }}>
                            <Title level={4} style={{ margin: 0 }}>
                                {AIRPORTS.find(a => a.code === selectedFlight.origin)?.name?.split('(')[0].trim() || selectedFlight.origin}
                                <ArrowRightOutlined style={{ fontSize: '16px', margin: '0 12px', color: '#888' }} />
                                {AIRPORTS.find(a => a.code === selectedFlight.destination)?.name?.split('(')[0].trim() || selectedFlight.destination}
                            </Title>
                            <Text type="secondary">{dayjs(selectedFlight.date).format('ddd, DD MMM')} • Non-stop • {selectedFlight.duration} • Economy</Text>
                        </div>

                        {/* Flight Details Card */}
                        <Card style={{ background: '#fafafa', borderRadius: '12px', border: 'none', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                                {/* Mock Logo */}
                                <div style={{ width: 32, height: 32, background: '#002147', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', marginRight: 12 }}>
                                    {selectedFlight.airline.substring(0, 2).toUpperCase()}
                                </div>
                                <Text strong>{selectedFlight.airline} • {selectedFlight.flightNumber}</Text>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div>
                                    <Title level={3} style={{ margin: 0 }}>{selectedFlight.departureTime}</Title>
                                    <Text>{selectedFlight.origin}</Text>
                                    <div style={{ fontSize: 12, color: '#888' }}>{AIRPORTS.find(a => a.code === selectedFlight.origin)?.name}</div>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center', padding: '0 16px' }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{selectedFlight.duration}</Text>
                                    <div style={{ borderTop: '1px dashed #ccc', margin: '4px 0' }}></div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    {/* Mocking arrival time as +duration approx */}
                                    <Title level={3} style={{ margin: 0 }}>
                                        {dayjs(`${selectedFlight.date} ${selectedFlight.departureTime}`).add(parseInt(selectedFlight.duration), 'hour').format('HH:mm')}
                                    </Title>
                                    <Text>{selectedFlight.destination}</Text>
                                    <div style={{ fontSize: 12, color: '#888' }}>{AIRPORTS.find(a => a.code === selectedFlight.destination)?.name}</div>
                                </div>
                            </div>

                            <Tag color="gold" style={{ marginTop: 12, borderRadius: 12, border: 'none', color: '#874d00' }}>
                                ⏱ 30% On-time
                            </Tag>
                        </Card>

                        {/* Baggage Info */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                <Text strong>🧳 Check-in :</Text> <Text>15 kg per adult</Text>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <Text strong>🎒 Cabin :</Text> <Text>7 kg per piece, 1 piece per adult</Text>
                            </div>
                        </div>

                        <Divider />

                        {/* Booking Form Inputs */}
                        <div style={{ marginBottom: 24 }}>
                            <Title level={4}>Cargo Details</Title>
                            <Form
                                form={drawerForm} // Assign the form instance
                                layout="vertical"
                                name="drawer_booking_form"
                                onFinish={(values) => {
                                    if (!session) {
                                        // Store current flight details to local storage
                                        localStorage.setItem('pendingBookingFlight', JSON.stringify(selectedFlight));

                                        message.loading("Redirecting to Login...", 1.5)
                                            .then(() => {
                                                // Redirect to login with callbackUrl pointing back here
                                                const callbackUrl = encodeURIComponent(window.location.href);
                                                router.push(`/login?callbackUrl=${callbackUrl}`);
                                            });
                                        return;
                                    }

                                    setLoading(true);
                                    setTimeout(() => {
                                        setLoading(false);
                                        notification.success({
                                            message: 'Booking Confirmed!',
                                            description: `Your booking for ${selectedFlight.origin} to ${selectedFlight.destination} has been confirmed. Ref: #${Math.floor(Math.random() * 10000)}`,
                                        });
                                        setReviewOpen(false);
                                        drawerForm.resetFields(); // Reset form fields after successful booking
                                    }, 1500);
                                }}
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="pieces" label="Pieces" rules={[{ required: true, message: 'Required' }]}>
                                            <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="weight" label="Weight (kg)" rules={[{ required: true, message: 'Required' }]}>
                                            <InputNumber min={0.1} style={{ width: '100%' }} placeholder="kg" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* Footer Action */}
                                <div style={{ marginTop: 24 }}>

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        size="large"
                                        loading={loading}
                                        style={{ height: '56px', fontSize: '18px', fontWeight: 600, background: '#faad14', borderColor: '#faad14', color: '#fff' }}
                                    >
                                        CONFIRM BOOKING
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}
