'use client';

import React, { Suspense } from 'react';
import FlightSearch from '@/components/FlightSearch';
import MainLayout from '@/components/MainLayout';

export default function SearchPage() {
    return (
        <Suspense fallback={null}>
            <FlightSearch mode="page" />
        </Suspense>
    );
}
