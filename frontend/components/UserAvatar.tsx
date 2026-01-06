'use client';

import React from 'react';
import { Avatar, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface UserAvatarProps {
    name?: string | null;
    email?: string | null;
    size?: 'large' | 'small' | 'default' | number;
}

export default function UserAvatar({ name, email, size = 'default' }: UserAvatarProps) {
    // Helper to get initials
    const getInitials = (fullName: string) => {
        if (!fullName) return '';
        const names = fullName.trim().split(' ');
        if (names.length === 0) return '';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    // Use name if available, otherwise just show icon
    const displayName = name || 'User';
    const initials = name ? getInitials(name) : null;

    return (
        <Space>
            <Avatar
                size={size}
                style={{
                    backgroundColor: '#44449b', // Theme color
                    verticalAlign: 'middle',
                    cursor: 'pointer'
                }}
                icon={!initials && <UserOutlined />}
            >
                {initials}
            </Avatar>
        </Space>
    );
}
