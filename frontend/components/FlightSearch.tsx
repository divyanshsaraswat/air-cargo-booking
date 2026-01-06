'use client';

import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, Typography, List, Tag, Divider, Row, Col, Empty, Drawer, InputNumber, notification, message, type FormInstance } from 'antd';
import { SearchOutlined, RocketOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const { Title, Text } = Typography;
const { Option } = Select;
import useSWR from 'swr';

interface Flight {
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string; // HH:mm
    duration: string;
    price: number; // Represents base rate or calculated price
    date: string; // YYYY-MM-DD
    // New fields from backend
    maxWeight?: number;
    bookedWeight?: number;
    basePrice?: number;
    arrivalDate?: string;
    arrivalTime?: string;
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
    { code: 'LAX', name: 'Los Angeles (LAX)' },
    { code: 'ICN', name: 'Seoul (ICN)' },
    { code: 'CDG', name: 'Paris (CDG)' },
    { code: 'FRA', name: 'Frankfurt (FRA)' },
    { code: 'IST', name: 'Istanbul (IST)' },
    { code: 'SIN', name: 'Singapore (SIN)' },
    { code: 'AMS', name: 'Amsterdam (AMS)' },
    { code: 'HND', name: 'Tokyo (HND)' },
    { code: 'SFO', name: 'San Francisco (SFO)' },
];

const MOCK_AIRLINES = ['SkyLines', 'AeroJet', 'GlobalWings', 'AirConnect'];

interface FlightSearchProps {
    mode?: 'widget' | 'page';
}

// Helper components for real-time price calculation
const PriceCalculator = ({ form }: { form: FormInstance }) => {
    const weight = Form.useWatch('weight', form);
    return <>{weight || 0}</>;
};

const SubtotalDisplay = ({ form, basePrice }: { form: FormInstance, basePrice?: number }) => {
    const weight = Form.useWatch('weight', form);
    const subtotal = (weight || 0) * (basePrice || 0);
    return <>${subtotal.toFixed(2)}</>;
};

const TaxDisplay = ({ form, basePrice }: { form: FormInstance, basePrice?: number }) => {
    const weight = Form.useWatch('weight', form);
    const subtotal = (weight || 0) * (basePrice || 0);
    const tax = subtotal * 0.18;
    return <>${tax.toFixed(2)}</>;
};

const TotalDisplay = ({ form, basePrice }: { form: FormInstance, basePrice?: number }) => {
    const weight = Form.useWatch('weight', form);
    const subtotal = (weight || 0) * (basePrice || 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    return <>${total.toFixed(2)}</>;
};

export default function FlightSearch({ mode = 'page' }: FlightSearchProps) {
    const [loading, setLoading] = useState(false);
    // results is now managed by SWR
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

    // State for SWR key
    const [searchQuery, setSearchQuery] = useState<{ origin: string, destination: string, date: string } | null>(null);

    // SWR Fetcher
    const fetcher = async (url: string) => {
        console.log("Fetching from:", url);
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('Failed to fetch flights');
        }
        const data: any[][] = await res.json();

        // Map backend response to frontend Route structure
        return data.map((routeFlights: any[]) => {
            const mappedFlights: Flight[] = routeFlights.map(f => {
                const depUTC = dayjs(f.departure_datetime).utc();
                const arrUTC = dayjs(f.arrival_datetime).utc();
                const depIST = depUTC.add(330, 'minute');
                const arrIST = arrUTC.add(330, 'minute');

                const diffMinutes = arrIST.diff(depIST, 'minute');
                const hours = Math.floor(diffMinutes / 60);
                const mins = diffMinutes % 60;
                const durationStr = `${hours}h ${mins}m`;

                return {
                    id: f.flight_id,
                    airline: f.airline_name,
                    flightNumber: f.flight_number,
                    origin: f.origin,
                    destination: f.destination,
                    departureTime: depIST.format('HH:mm'),
                    duration: durationStr,
                    price: f.base_price_per_kg,
                    date: depIST.format('YYYY-MM-DD'),
                    maxWeight: f.max_weight_kg,
                    bookedWeight: f.booked_weight_kg,
                    basePrice: f.base_price_per_kg,
                    arrivalDate: arrIST.format('YYYY-MM-DD'),
                    arrivalTime: arrIST.format('HH:mm')
                };
            });

            const totalPrice = mappedFlights.reduce((sum, f) => sum + (f.price || 0), 0);
            const firstLeg = mappedFlights[0];
            const lastLeg = mappedFlights[mappedFlights.length - 1];

            let totalDurationStr = "";
            if (firstLeg.date && firstLeg.departureTime && lastLeg.arrivalDate && lastLeg.arrivalTime) {
                const start = dayjs(`${firstLeg.date} ${firstLeg.departureTime}`);
                const end = dayjs(`${lastLeg.arrivalDate} ${lastLeg.arrivalTime}`);
                const diff = end.diff(start, 'minute');
                totalDurationStr = `${Math.floor(diff / 60)}h ${diff % 60}m`;
            } else {
                totalDurationStr = mappedFlights.map(f => f.duration).join(' + ');
            }

            return {
                type: mappedFlights.length > 1 ? 'transit' : 'direct',
                flights: mappedFlights,
                totalPrice: parseFloat(totalPrice.toFixed(2)),
                totalDuration: totalDurationStr
            };
        });
    };

    // Construct SWR URL
    const swrKey = searchQuery
        ? `${process.env.NEXT_PUBLIC_API_URL}/route?origin=${searchQuery.origin}&destination=${searchQuery.destination}&date=${searchQuery.date}`
        : null;

    const { data: results, error, isLoading } = useSWR(swrKey, fetcher, {
        revalidateOnFocus: false, // Flight schedules rarely change instantly
        shouldRetryOnError: false
    });

    // Update loading state alias for UI compatibility
    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading]);

    useEffect(() => {
        if (error) {
            console.error(error);
            notification.error({ message: "Error fetching flights", description: "Could not load flight data." });
        }
    }, [error]);


    const performSearch = (values: any) => {
        const { origin, destination, date } = values;
        const dateStr = date.format('YYYY-MM-DD');
        setSearchQuery({ origin, destination, date: dateStr });
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
                                Search Flights
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
                                                    {flight.origin} ({flight.departureTime} IST) <SearchOutlined rotate={90} style={{ fontSize: '10px', margin: '0 4px' }} /> {flight.destination}
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
                styles={{ body: { paddingBottom: 80 }, wrapper: { width: 500 } }}
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
                                    <Title level={3} style={{ margin: 0 }}>{selectedFlight.departureTime} IST</Title>
                                    <Text>{selectedFlight.origin}</Text>
                                    <div style={{ fontSize: 12, color: '#888' }}>{AIRPORTS.find(a => a.code === selectedFlight.origin)?.name}</div>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center', padding: '0 16px' }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{selectedFlight.duration}</Text>
                                    <div style={{ borderTop: '1px dashed #ccc', margin: '4px 0' }}></div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    {/* Use pre-calculated arrival time */}
                                    <Title level={3} style={{ margin: 0 }}>
                                        {selectedFlight.arrivalTime ? `${selectedFlight.arrivalTime} IST` :
                                            dayjs(`${selectedFlight.date} ${selectedFlight.departureTime}`).add(parseInt(selectedFlight.duration), 'hour').format('HH:mm') + ' IST'}
                                    </Title>
                                    <Text>{selectedFlight.destination}</Text>
                                    <div style={{ fontSize: 12, color: '#888' }}>{AIRPORTS.find(a => a.code === selectedFlight.destination)?.name}</div>
                                </div>
                            </div>
                        </Card>

                        {/* Baggage Info */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                <Text strong>📦 Max Capacity :</Text> <Text>{selectedFlight.maxWeight} kg</Text>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <Text strong>💲 Base Rate :</Text> <Text>${selectedFlight.basePrice} / kg</Text>
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
                                onFinish={async (values) => {
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
                                    try {
                                        // @ts-ignore - session.user.id is added in our auth route
                                        const userId = session.user?.id;

                                        const payload = {
                                            ref_id: `BKG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                                            user_id: userId,
                                            origin: selectedFlight.origin,
                                            destination: selectedFlight.destination,
                                            pieces: values.pieces,
                                            weight_kg: values.weight,
                                            // Ideally we should pass flight_ids if we have them. 
                                            // selectedFlight.id is from frontend generation, might not match backend unless search was real.
                                            // But let's pass it if it looks like a real ID or leave empty.
                                            flight_ids: [selectedFlight.id]
                                        };

                                        console.log("Booking Payload:", payload);

                                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${session.accessToken}`
                                            },
                                            body: JSON.stringify(payload),
                                        });

                                        if (!res.ok) {
                                            const err = await res.json();
                                            // Enhanced Error Handling for Concurrency/Locking
                                            if (res.status === 503) {
                                                throw new Error("High traffic detected. Please try confirming your booking again in a few seconds.");
                                            }
                                            if (res.status === 400 && err.detail?.toLowerCase().includes('capacity')) {
                                                throw new Error("This flight no longer has enough capacity for your request. Please try a smaller weight or different flight.");
                                            }
                                            throw new Error(err.detail || "Booking failed");
                                        }

                                        const bookingData = await res.json();

                                        notification.success({
                                            message: 'Booking Confirmed!',
                                            description: `Booking #${bookingData.ref_id} created successfully!`,
                                        });
                                        setReviewOpen(false);
                                        drawerForm.resetFields();
                                    } catch (error) {
                                        console.error("Booking Error:", error);
                                        notification.error({
                                            message: 'Booking Failed',
                                            description: error instanceof Error ? error.message : "Please try again later."
                                        });
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="pieces" label="Pieces" rules={[{ required: true, message: 'Required' }]}>
                                            <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="weight" label="Total Weight (kg)" rules={[{ required: true, message: 'Required' }]}>
                                            <InputNumber min={0.1} style={{ width: '100%' }} placeholder="kg" />
                                        </Form.Item>
                                    </Col>
                                </Row>



                                {/* Price Summary */}
                                <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <Text>Subtotal ({selectedFlight.basePrice} x <PriceCalculator form={drawerForm} /> kg)</Text>
                                        <Text strong><SubtotalDisplay form={drawerForm} basePrice={selectedFlight.basePrice} /></Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <Text>Tax (18%)</Text>
                                        <Text strong><TaxDisplay form={drawerForm} basePrice={selectedFlight.basePrice} /></Text>
                                    </div>
                                    <Divider style={{ margin: '12px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text strong style={{ fontSize: '16px' }}>Total Payable</Text>
                                        <Text strong style={{ fontSize: '18px', color: '#faad14' }}>
                                            <TotalDisplay form={drawerForm} basePrice={selectedFlight.basePrice} />
                                        </Text>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div>

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        size="large"
                                        loading={loading}
                                        className='mb-4'
                                        style={{ height: '56px', fontSize: '18px', fontWeight: 600, background: '#faad14', borderColor: '#faad14', color: '#fff' }}
                                    >
                                        CONFIRM BOOKING
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                )
                }
            </Drawer >
        </div >
    );
}
