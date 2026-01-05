'use client';

import React from 'react';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import type Entity from '@ant-design/cssinjs/es/Cache';
import { useServerInsertedHTML } from 'next/navigation';
import { ConfigProvider, theme } from 'antd';
import { ThemeProvider, useTheme } from './ThemeContext';

const ThemeConfigurator = ({ children }: { children: React.ReactNode }) => {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#44449b',
          colorLink: '#44449b',
          colorTextBase: isDarkMode ? '#ffffff' : '#0e0b38', // Adapt text color
          colorBgBase: isDarkMode ? '#141414' : '#ffffff', // Adapt bg
          fontFamily: 'inherit',
        },
        components: {
          Button: {
            borderRadius: 4,
            controlHeightLG: 48,
            colorPrimary: '#44449b',
            algorithm: true,
          },
          Layout: {
            headerBg: isDarkMode ? '#1f1f1f' : '#ffffff',
            bodyBg: isDarkMode ? '#121212' : '#f1f5fe',
          },
          Card: {
            colorBgContainer: isDarkMode ? '#1f1f1f' : '#ffffff',
            colorBorderSecondary: isDarkMode ? '#303030' : '#f0f0f0'
          },
          Typography: {
            colorTextHeading: isDarkMode ? '#ffffff' : '#0e0b38',
            colorText: isDarkMode ? 'rgba(255,255,255,0.85)' : '#0e0b38',
            colorTextSecondary: isDarkMode ? 'rgba(255,255,255,0.45)' : '#5c5c8a',
          },
          Input: {
            colorBgContainer: isDarkMode ? '#2c2c2c' : '#ffffff',
            colorText: isDarkMode ? '#ffffff' : '#000000',
            colorBorder: isDarkMode ? '#434343' : '#d9d9d9',
            colorTextPlaceholder: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.25)',
          },
          InputNumber: {
            colorBgContainer: isDarkMode ? '#2c2c2c' : '#ffffff',
            colorText: isDarkMode ? '#ffffff' : '#000000',
            colorBorder: isDarkMode ? '#434343' : '#d9d9d9',
            colorTextPlaceholder: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.25)',
          },
          Select: {
            colorBgContainer: isDarkMode ? '#2c2c2c' : '#ffffff',
            colorText: isDarkMode ? '#ffffff' : '#000000',
            colorBorder: isDarkMode ? '#434343' : '#d9d9d9',
            colorTextPlaceholder: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.25)',
            selectorBg: isDarkMode ? '#2c2c2c' : '#ffffff',
            optionSelectedBg: isDarkMode ? '#44449b' : '#e6f7ff',
            colorBgElevated: isDarkMode ? '#3a3a3a' : '#ffffff', // For dropdown menu
          },
          DatePicker: {
            colorBgContainer: isDarkMode ? '#2c2c2c' : '#ffffff',
            colorText: isDarkMode ? '#ffffff' : '#000000',
            colorBorder: isDarkMode ? '#434343' : '#d9d9d9',
            colorTextPlaceholder: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.25)',
          }
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

const StyledComponentsRegistry = ({ children }: React.PropsWithChildren) => {
  const cache = React.useMemo<Entity>(() => createCache(), []);
  useServerInsertedHTML(() => (
    <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />
  ));
  return <StyleProvider cache={cache}>{children}</StyleProvider>;
};

const AntdRegistry = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledComponentsRegistry>
      <ThemeProvider>
        <ThemeConfigurator>
          {children}
        </ThemeConfigurator>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
};

export default AntdRegistry;
