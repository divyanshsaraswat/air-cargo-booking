'use client';

import React from 'react';
import { useTheme } from './ThemeContext';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
// Custom SVG icons to match the look more closely if needed, 
// or I can just use Ant Design icons with standard styling.
// The image shows a Sun with rays and a Crescent Moon.

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <div
            onClick={toggleTheme}
            style={{
                width: '64px',
                height: '32px',
                borderRadius: '20px',
                background: isDarkMode ? '#ffffff' : '#343471ff', // Dark mode: White container | Light mode: Dark container (as per image logic interpretation)
                // Wait, looking at the image: 
                // Top (Sun/Dark BG): likely represents "Light Mode" or "Day". 
                // Bottom (Moon/White BG): likely represents "Dark Mode" or "Night".
                // Let's toggle:
                // If !isDarkMode (Light): Show Sun -> Handle Left -> Dark BG.
                // If isDarkMode (Dark): Show Moon -> Handle Right -> White BG.

                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
            }}
        >
            <div
                style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isDarkMode ? '#000000' : '#ffffff',
                    position: 'absolute',
                    left: isDarkMode ? '36px' : '4px', // Slide logic
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                {isDarkMode ? (
                    // Moon Icon
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                ) : (
                    // Sun Icon
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                )}
            </div>
        </div>
    );
};

export default ThemeToggle;
