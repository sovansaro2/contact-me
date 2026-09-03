/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import AppRoutes from './routes';
import InstallGate from './components/Install';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

export default function App() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Configure status bar for Android
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#120f0d' });
    } catch (e) {
      console.warn('StatusBar configuration error:', e);
    }

    // Handle Android hardware back button
    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (window.location.pathname === '/' || !canGoBack) {
        CapApp.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      backListener.then(handle => handle.remove()).catch(() => {});
    };
  }, []);

  return (
    <InstallGate>
      <AppRoutes />
    </InstallGate>
  );
}
